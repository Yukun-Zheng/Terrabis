import { MAPBOX_ACCESS_TOKEN } from '../config/api-keys';

/**
 * 地理编码结果接口
 */
export interface GeocodeResult {
  id: string;
  name: string;
  address?: string;
  center: [number, number]; // [经度, 纬度]
  place_name?: string;      // 兼容旧接口
  source?: string;          // 数据来源
  score?: number;           // 匹配分数
  properties?: any;         // 其他属性
}

/**
 * 将地址转换为坐标
 * 
 * @param {string} address 地址字符串
 * @returns {Promise<GeocodeResult[]>} 地理编码结果
 */
export const geocodeAddress = async (address: string): Promise<GeocodeResult[]> => {
  if (!window.T) {
    throw new Error('天地图API未加载');
  }
  
  // 创建天地图地址解析对象
  const geocoder = new window.T.Geocoder();
  
  // 使用Promise包装回调
  return new Promise<GeocodeResult[]>((resolve, reject) => {
    geocoder.getPoint(address, (result: any) => {
      if (result.getStatus() === 0) { // 0表示成功
        // 获取位置点，可能是单个点或者数组
        const location = result.getLocationPoint();
        if (!location) {
          resolve([]);
          return;
        }
        
        // 检查并处理返回值（可能是数组或单个对象）
        const locations = Array.isArray(location) ? location : [location];
        
        // 转换为GeocodeResult格式
        const formattedResults = locations.map((item: any) => ({
          id: item.id || String(Math.random()),
          name: item.name || address,
          address: item.address || '',
          center: [item.lnt, item.lat] as [number, number],
          place_name: item.name, // 兼容旧接口
          source: 'tianditu'
        }));
        resolve(formattedResults);
      } else {
        reject(new Error(`地理编码失败，状态码: ${result.getStatus()}`));
      }
    });
  });
};

/**
 * 根据坐标获取位置信息（反向地理编码）
 * 
 * @param longitude 经度
 * @param latitude 纬度
 * @param accessToken Mapbox访问令牌
 * @returns 地理编码结果列表
 */
export const reverseGeocode = async (
  longitude: number,
  latitude: number,
  accessToken: string = MAPBOX_ACCESS_TOKEN
): Promise<GeocodeResult[]> => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&limit=1`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`反向地理编码请求失败: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 转换并返回结果
    return data.features.map((feature: any) => ({
      id: feature.id,
      place_name: feature.place_name,
      center: feature.center,
      bbox: feature.bbox
    }));
  } catch (error) {
    console.error('反向地理编码错误:', error);
    return [];
  }
}; 