/**
 * 天地图GIS代理服务器
 * 
 * 此脚本启动一个简单的Express服务器，用于以下功能：
 * 1. 代理天地图请求，避免跨域问题
 * 2. 提供API接口，方便前端调用
 * 3. 允许与其他Web应用集成
 */

const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const url = require('url');

// 创建一个代理服务器实例
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  secure: false, // 不验证SSL证书
  // 添加错误处理函数，直接作为配置项设置
  errorHandler: function(err, req, res) {
    console.error(`代理请求错误:`, err);
    
    // 如果响应尚未发送，则发送错误响应
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: true,
        message: `代理请求失败: ${err.message}`
      }));
    }
  }
});

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 启用宽松的CORS配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400
}));

// CORS预检请求处理
app.options('*', cors());

// 解析JSON请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'tianditu-gis-proxy'
  });
});

// 通用的跨域头设置中间件
const addCorsHeaders = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Max-Age', '86400');
  next();
};

// 设置代理响应事件处理
proxy.on('proxyRes', (proxyRes, req, res) => {
  // 覆盖响应头，确保浏览器接受跨域响应
  proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept';
  
  // 确保图像可以正确传输
  if (req.url.includes('/wmts') && req.query && req.query.FORMAT === 'tiles') {
    proxyRes.headers['Content-Type'] = 'image/png';
  }
  
  console.log(`代理响应: ${req.method} ${req.url} => ${proxyRes.statusCode}`);
});

// 应用全局中间件
app.use(addCorsHeaders);

// 天地图服务器代理 - t0 到 t7
app.use('/t0', (req, res) => {
  const targetUrl = 'https://t0.tianditu.gov.cn';
  console.log(`代理请求(/t0): ${req.method} ${req.url} => ${targetUrl}${req.url}`);
  proxy.web(req, res, { target: targetUrl });
});

app.use('/t1', (req, res) => {
  const targetUrl = 'https://t1.tianditu.gov.cn';
  console.log(`代理请求(/t1): ${req.method} ${req.url} => ${targetUrl}${req.url}`);
  proxy.web(req, res, { target: targetUrl });
});

app.use('/t2', (req, res) => {
  const targetUrl = 'https://t2.tianditu.gov.cn';
  console.log(`代理请求(/t2): ${req.method} ${req.url} => ${targetUrl}${req.url}`);
  proxy.web(req, res, { target: targetUrl });
});

app.use('/t3', (req, res) => {
  const targetUrl = 'https://t3.tianditu.gov.cn';
  console.log(`代理请求(/t3): ${req.method} ${req.url} => ${targetUrl}${req.url}`);
  proxy.web(req, res, { target: targetUrl });
});

app.use('/t4', (req, res) => {
  const targetUrl = 'https://t4.tianditu.gov.cn';
  console.log(`代理请求(/t4): ${req.method} ${req.url} => ${targetUrl}${req.url}`);
  proxy.web(req, res, { target: targetUrl });
});

app.use('/t5', (req, res) => {
  const targetUrl = 'https://t5.tianditu.gov.cn';
  console.log(`代理请求(/t5): ${req.method} ${req.url} => ${targetUrl}${req.url}`);
  proxy.web(req, res, { target: targetUrl });
});

app.use('/t6', (req, res) => {
  const targetUrl = 'https://t6.tianditu.gov.cn';
  console.log(`代理请求(/t6): ${req.method} ${req.url} => ${targetUrl}${req.url}`);
  proxy.web(req, res, { target: targetUrl });
});

app.use('/t7', (req, res) => {
  const targetUrl = 'https://t7.tianditu.gov.cn';
  console.log(`代理请求(/t7): ${req.method} ${req.url} => ${targetUrl}${req.url}`);
  proxy.web(req, res, { target: targetUrl });
});

// 通用天地图代理
app.use('/tianditu', (req, res) => {
  const targetUrl = 'https://t0.tianditu.gov.cn';
  console.log(`代理请求(/tianditu): ${req.method} ${req.url} => ${targetUrl}${req.url.replace(/^\/tianditu/, '')}`);
  // 修改请求路径，去掉/tianditu前缀
  req.url = req.url.replace(/^\/tianditu/, '');
  proxy.web(req, res, { target: targetUrl });
});

// 代理服务器状态检查
app.get('/proxy-status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    service: '天地图代理服务器',
    routes: [
      { path: '/t0-t7/*', target: 'https://t0-t7.tianditu.gov.cn' },
      { path: '/tianditu/*', target: 'https://t0.tianditu.gov.cn' }
    ]
  });
});

// API版本信息
app.get('/api/version', (req, res) => {
  res.json({
    name: '天地图GIS服务',
    version: '1.0.0',
    api_version: 'v1',
    description: '提供天地图服务和地理信息处理'
  });
});

// 处理404
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: '未找到请求的资源'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: true,
    message: '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('╭────────────────────────────────────────────────────────────────────────╮');
  console.log('│                                                                        │');
  console.log('│    🌏 天地图GIS代理服务器已启动                                       │');
  console.log(`│    📡 服务运行在: http://localhost:${PORT}                            │`);
  console.log('│                                                                        │');
  console.log('│    ✅ 健康检查: http://localhost:3001/health                          │');
  console.log('│    🗺️  天地图代理: http://localhost:3001/tianditu 和 /t0-t7           │');
  console.log('│    ℹ️  API信息: http://localhost:3001/api/version                     │');
  console.log('│    📊 代理状态: http://localhost:3001/proxy-status                    │');
  console.log('│                                                                        │');
  console.log('│    提示: 确保前端应用使用代理地址而不是直接访问天地图服务器          │');
  console.log('│                                                                        │');
  console.log('╰────────────────────────────────────────────────────────────────────────╯');
}); 