from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import json
import asyncio
import subprocess
import os
from config import model_config, api_config
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 存储 Ollama 进程
ollama_process = None

async def start_ollama():
    global ollama_process
    try:
        if ollama_process is None or ollama_process.poll() is not None:
            ollama_process = subprocess.Popen(
                ["ollama", "run", "deepseek-r1:8b"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            # 等待几秒钟让服务启动
            await asyncio.sleep(5)
            return True
        return True
    except Exception as e:
        logger.error(f"Failed to start Ollama: {str(e)}")
        return False

async def stop_ollama():
    global ollama_process
    try:
        if ollama_process and ollama_process.poll() is None:
            ollama_process.terminate()
            ollama_process = None
            return True
        return True
    except Exception as e:
        logger.error(f"Failed to stop Ollama: {str(e)}")
        return False

async def check_ollama_connection():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags")
            return response.status_code == 200
    except Exception as e:
        logger.error(f"Ollama connection check failed: {str(e)}")
        return False

async def stream_ollama_response(prompt: str):
    try:
        # 检查 Ollama 连接，如果未连接则尝试启动
        if not await check_ollama_connection():
            if not await start_ollama():
                yield json.dumps({"error": "无法启动 Ollama 服务"})
                return

        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                api_config.ollama_url,
                json={
                    "model": "deepseek-r1:8b",  # 修正模型名称
                    "prompt": prompt,
                    "stream": True,
                    "options": {
                        "temperature": model_config.temperature,
                        "top_p": model_config.top_p,
                        "num_predict": model_config.max_tokens
                    }
                },
                timeout=model_config.timeout
            ) as response:
                if response.status_code != 200:
                    error_msg = await response.text()
                    logger.error(f"Ollama API error: {error_msg}")
                    yield json.dumps({"error": "Ollama API 请求失败"})
                    return

                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line)
                            if "response" in data:
                                yield json.dumps({"response": data["response"]}) + "\n"
                        except json.JSONDecodeError:
                            logger.warning(f"Failed to parse line: {line}")
                            continue

    except Exception as e:
        logger.error(f"Stream error: {str(e)}")
        yield json.dumps({"error": str(e)})

@app.post("/api/chat")
async def chat_with_ollama(request: Request):
    try:
        data = await request.json()
        prompt = data.get("content", "")
        
        if not prompt:
            raise HTTPException(status_code=400, detail="消息内容不能为空")

        return StreamingResponse(
            stream_ollama_response(prompt),
            media_type="application/x-ndjson"
        )

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="无效的 JSON 数据")
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ollama/start")
async def start_ollama_service():
    success = await start_ollama()
    if success:
        return {"message": "Ollama 服务已启动"}
    else:
        raise HTTPException(status_code=500, detail="无法启动 Ollama 服务")

@app.post("/api/ollama/stop")
async def stop_ollama_service():
    success = await stop_ollama()
    if success:
        return {"message": "Ollama 服务已停止"}
    else:
        raise HTTPException(status_code=500, detail="无法停止 Ollama 服务")

@app.get("/api/ollama/status")
async def get_ollama_status():
    is_running = await check_ollama_connection()
    return {"status": "running" if is_running else "stopped"}

@app.get("/api/config")
async def get_config():
    return {
        "model": "deepseek-r1:8b",
        "temperature": model_config.temperature,
        "max_tokens": model_config.max_tokens,
        "top_p": model_config.top_p
    }

@app.post("/api/config")
async def update_config(config: dict):
    try:
        for key, value in config.items():
            if hasattr(model_config, key):
                setattr(model_config, key, value)
        return {"message": "配置更新成功"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=api_config.host, port=api_config.port) 