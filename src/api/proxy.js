const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();

app.use(cors());

// 代理天地图请求
app.use('/tianditu', createProxyMiddleware({
  target: 'https://t0.tianditu.gov.cn',
  changeOrigin: true,
  pathRewrite: {'^/tianditu': ''},
  timeout: 60000, // 设置60秒超时
  proxyTimeout: 60000, // 代理请求超时
  onProxyReq: (proxyReq) => {
    console.log('代理请求到天地图:', proxyReq.path);
  },
  onError: (err, req, res) => {
    console.error('代理请求错误:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });
    res.end(`代理请求失败: ${err.message}`);
  }
}));

// 添加简单的健康检查路由
app.get('/health', (req, res) => {
  res.status(200).send('代理服务器运行正常');
});

// 为Web端集成添加API路由 
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: '天地图GIS服务',
    status: 'running'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log('使用示例: http://localhost:3001/tianditu/vec_w/wmts?SERVICE=WMTS&...');
}); 