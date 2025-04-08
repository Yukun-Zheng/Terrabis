# DeepSeek Chat 本地部署版

这是一个基于 Ollama 和 DeepSeek-r1:8b 模型的本地聊天应用。

## 系统要求

- Python 3.8+
- Ollama 已安装并运行
- DeepSeek-r1:8b 模型已下载

## 安装步骤

1. 确保 Ollama 服务正在运行：
```bash
ollama run deepseek-ri:8b
```

2. 安装后端依赖：
```bash
cd backend
pip install -r requirements.txt
```

3. 启动后端服务：
```bash
python main.py
```

4. 打开前端界面：
   直接在浏览器中打开 `frontend/index.html` 文件

## 功能特点

- 实时聊天界面
- 支持流式响应
- 打字指示器
- 消息时间戳
- 可配置的模型参数
- 错误处理和重试机制
- 响应式设计

## 配置选项

在 `backend/config.py` 中可以修改以下配置：

- 模型名称
- 温度参数
- 最大生成长度
- 系统提示词
- API 超时时间

## 常见问题

1. 如果遇到依赖安装问题：
   - 确保使用正确的 Python 环境
   - 尝试使用 `python -m pip install` 而不是直接使用 `pip`
   - 检查网络连接

2. 如果 Ollama 服务无法连接：
   - 确保 Ollama 服务正在运行
   - 检查端口 11434 是否被占用
   - 确认模型名称是否正确

3. 如果前端无法连接后端：
   - 检查后端服务是否正在运行
   - 确认端口 8000 是否可用
   - 检查浏览器控制台是否有错误信息

## 开发说明

- 后端使用 FastAPI 框架
- 前端使用纯 HTML/JavaScript 和 Tailwind CSS
- 支持跨域请求
- 实现了流式响应处理

## 安全说明

- 当前版本允许所有来源的 CORS 请求，生产环境应限制来源
- API 密钥和敏感信息应通过环境变量配置
- 建议在生产环境中启用 HTTPS

## 更新日志

### v1.0.0
- 初始版本发布
- 基础聊天功能
- 流式响应支持
- 基本错误处理 