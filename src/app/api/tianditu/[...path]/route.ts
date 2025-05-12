import { NextRequest, NextResponse } from 'next/server';
import { TIANDITU_API_KEY } from '@/config/api-keys';

// 从配置中获取天地图API密钥
const API_KEY = TIANDITU_API_KEY;

// 缓存的响应头
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=86400',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * 天地图API代理 - 处理所有类型的天地图请求
 * 支持所有瓦片类型: vec, img, ter 以及它们对应的注记图层
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 获取完整路径
    const path = params.path || [];
    const pathString = path.join('/');
    
    // 从URL获取查询参数
    const { searchParams } = new URL(request.url);
    const searchParamsString = searchParams.toString();
    
    // 判断用哪个子域名服务器（t0-t7）
    const serverIndex = Math.floor(Math.random() * 8); // 随机选择0-7的一个服务器
    
    // 构建请求URL
    let targetUrl = `https://t${serverIndex}.tianditu.gov.cn/${pathString}`;
    
    // 添加原始查询参数
    if (searchParamsString) {
      targetUrl += `?${searchParamsString}`;
      
      // 确保添加API密钥
      if (!searchParams.has('tk')) {
        targetUrl += `&tk=${API_KEY}`;
      }
    } else {
      targetUrl += `?tk=${API_KEY}`;
    }
    
    console.log(`代理天地图请求到: ${targetUrl}`);
    
    // 发送请求到天地图服务器
    const response = await fetch(targetUrl, {
      headers: request.headers,
      cache: 'force-cache',
    });
    
    // 如果响应不成功，返回错误
    if (!response.ok) {
      return new NextResponse(`天地图服务器错误: ${response.statusText}`, {
        status: response.status,
      });
    }
    
    // 获取响应内容
    const data = await response.arrayBuffer();
    
    // 判断内容类型
    let contentType = response.headers.get('content-type') || 'image/png';
    
    // 确保瓦片请求返回正确的图像内容类型
    if (pathString.includes('wmts') || 
        pathString.includes('vec') || 
        pathString.includes('cva') || 
        pathString.includes('img') || 
        pathString.includes('cia') || 
        pathString.includes('ter') || 
        pathString.includes('cta')) {
      contentType = 'image/png';
    }
    
    // 返回响应
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': contentType,
        ...CACHE_HEADERS,
      },
    });
  } catch (error) {
    console.error('天地图代理错误:', error);
    return new NextResponse('代理请求失败', { status: 500 });
  }
} 