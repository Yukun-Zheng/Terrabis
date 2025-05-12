/**
 * 天地图GIS基础代理服务器
 * 使用纯Node.js http模块和http-proxy，避免任何路由库
 */

const http = require('http');
const httpProxy = require('http-proxy');
const url = require('url');

// 创建一个代理服务器实例
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  timeout: 60000,
  proxyTimeout: 60000,
  secure: false, // 不验证SSL证书
  // 添加错误处理函数，直接作为参数传入而不是使用事件监听
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

// 设置代理响应事件处理
proxy.on('proxyRes', (proxyRes, req, res) => {
  // 覆盖响应头，确保浏览器接受跨域响应
  proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept';
  
  // 确保图像可以正确传输
  const parsedUrl = url.parse(req.url, true);
  
  // 判断是否为瓦片请求
  if (
    parsedUrl.pathname.includes('/wmts') ||
    parsedUrl.pathname.includes('vec_c') ||
    parsedUrl.pathname.includes('vec_w') ||
    parsedUrl.pathname.includes('cva_c') ||
    parsedUrl.pathname.includes('cva_w') ||
    parsedUrl.pathname.includes('img_c') ||
    parsedUrl.pathname.includes('img_w') ||
    parsedUrl.pathname.includes('cia_c') ||
    parsedUrl.pathname.includes('cia_w') ||
    parsedUrl.pathname.includes('ter_c') ||
    parsedUrl.pathname.includes('ter_w') ||
    parsedUrl.pathname.includes('cta_c') ||
    parsedUrl.pathname.includes('cta_w')
  ) {
    proxyRes.headers['Content-Type'] = 'image/png';
    // 添加缓存控制头
    proxyRes.headers['Cache-Control'] = 'public, max-age=86400';
    console.log('设置瓦片内容类型为image/png');
  }
  
  console.log(`代理响应: ${req.method} ${req.url} => ${proxyRes.statusCode}`);
});

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 添加CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 解析URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // 健康检查端点
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'tianditu-gis-proxy'
    }));
    return;
  }
  
  // 代理服务器状态检查
  if (pathname === '/proxy-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      timestamp: new Date().toISOString(),
      service: '天地图代理服务器',
      routes: [
        { path: '/t0-t7/*', target: 'https://t0-t7.tianditu.gov.cn' },
        { path: '/tianditu/*', target: 'https://t0.tianditu.gov.cn' }
      ]
    }));
    return;
  }
  
  // API版本信息
  if (pathname === '/api/version') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: '天地图GIS服务',
      version: '1.0.0',
      api_version: 'v1',
      description: '提供天地图服务和地理信息处理'
    }));
    return;
  }

  // 天地图底图服务代理处理
  const tiandituServices = [
    'vec_c', 'vec_w', 'cva_c', 'cva_w', 
    'img_c', 'img_w', 'cia_c', 'cia_w', 
    'ter_c', 'ter_w', 'cta_c', 'cta_w'
  ];

  // 检查是否是天地图底图请求
  if (tiandituServices.some(service => pathname.includes(service))) {
    // 使用正则表达式从路径中提取服务类型
    const serviceMatch = pathname.match(/(vec|cva|img|cia|ter|cta)_(c|w)/);
    if (serviceMatch) {
      const serviceType = serviceMatch[0];
      // 这里直接转发请求到t0.tianditu.gov.cn
      const target = 'https://t0.tianditu.gov.cn';
      console.log(`天地图底图代理: ${req.method} ${req.url} => ${target}`);
      proxy.web(req, res, { target });
      return;
    }
  }
  
  // 处理天地图代理请求
  if (pathname.startsWith('/t0/')) {
    req.url = req.url.replace(/^\/t0/, '');
    console.log(`代理请求(/t0): ${req.method} ${req.url} => https://t0.tianditu.gov.cn${req.url}`);
    proxy.web(req, res, { target: 'https://t0.tianditu.gov.cn' });
    return;
  }
  
  if (pathname.startsWith('/t1/')) {
    req.url = req.url.replace(/^\/t1/, '');
    console.log(`代理请求(/t1): ${req.method} ${req.url} => https://t1.tianditu.gov.cn${req.url}`);
    proxy.web(req, res, { target: 'https://t1.tianditu.gov.cn' });
    return;
  }
  
  if (pathname.startsWith('/t2/')) {
    req.url = req.url.replace(/^\/t2/, '');
    console.log(`代理请求(/t2): ${req.method} ${req.url} => https://t2.tianditu.gov.cn${req.url}`);
    proxy.web(req, res, { target: 'https://t2.tianditu.gov.cn' });
    return;
  }
  
  if (pathname.startsWith('/t3/')) {
    req.url = req.url.replace(/^\/t3/, '');
    console.log(`代理请求(/t3): ${req.method} ${req.url} => https://t3.tianditu.gov.cn${req.url}`);
    proxy.web(req, res, { target: 'https://t3.tianditu.gov.cn' });
    return;
  }
  
  if (pathname.startsWith('/t4/')) {
    req.url = req.url.replace(/^\/t4/, '');
    console.log(`代理请求(/t4): ${req.method} ${req.url} => https://t4.tianditu.gov.cn${req.url}`);
    proxy.web(req, res, { target: 'https://t4.tianditu.gov.cn' });
    return;
  }
  
  if (pathname.startsWith('/t5/')) {
    req.url = req.url.replace(/^\/t5/, '');
    console.log(`代理请求(/t5): ${req.method} ${req.url} => https://t5.tianditu.gov.cn${req.url}`);
    proxy.web(req, res, { target: 'https://t5.tianditu.gov.cn' });
    return;
  }
  
  if (pathname.startsWith('/t6/')) {
    req.url = req.url.replace(/^\/t6/, '');
    console.log(`代理请求(/t6): ${req.method} ${req.url} => https://t6.tianditu.gov.cn${req.url}`);
    proxy.web(req, res, { target: 'https://t6.tianditu.gov.cn' });
    return;
  }
  
  if (pathname.startsWith('/t7/')) {
    req.url = req.url.replace(/^\/t7/, '');
    console.log(`代理请求(/t7): ${req.method} ${req.url} => https://t7.tianditu.gov.cn${req.url}`);
    proxy.web(req, res, { target: 'https://t7.tianditu.gov.cn' });
    return;
  }
  
  if (pathname.startsWith('/tianditu/')) {
    req.url = req.url.replace(/^\/tianditu/, '');
    console.log(`代理请求(/tianditu): ${req.method} ${req.url} => https://t0.tianditu.gov.cn${req.url}`);
    proxy.web(req, res, { target: 'https://t0.tianditu.gov.cn' });
    return;
  }
  
  // 处理404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: true,
    message: '未找到请求的资源'
  }));
});

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('╭────────────────────────────────────────────────────────────────────────╮');
  console.log('│                                                                        │');
  console.log('│    🌏 天地图GIS基础代理服务器已启动                                   │');
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