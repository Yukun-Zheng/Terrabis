/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  // 允许外部图像域
  images: {
    domains: ['api.tianditu.gov.cn', 't0.tianditu.gov.cn', 'lbs.tianditu.gov.cn'],
  },
  // 为web端集成做准备
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // 配置静态资源目录 - 修改确保静态资源可访问
  // 这样可以通过/data/访问public/data目录下的文件
  // 包括GeoJSON文件
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/data/:path*',
      }
    ];
  },
  // 确保生产环境也能访问静态资源
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : undefined,
};

module.exports = nextConfig;
