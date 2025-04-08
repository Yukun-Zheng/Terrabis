from pydantic import BaseModel

class ModelConfig(BaseModel):
    model_name: str = "deepseek-ri:8b"
    temperature: float = 0.7
    max_tokens: int = 2048
    top_p: float = 0.9
    system_prompt: str = "你是一个有帮助的AI助手。"
    timeout: int = 30

class APIConfig(BaseModel):
    host: str = "localhost"
    port: int = 8000
    ollama_url: str = "http://localhost:11434/api/generate"

# 创建配置实例
model_config = ModelConfig()
api_config = APIConfig() 