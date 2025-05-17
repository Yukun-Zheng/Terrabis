/**
 * GeoJSON加载和处理工具
 */

// 异步加载GeoJSON文件
export const loadGeoJson = async (url: string): Promise<any> => {
  try {
    console.log('Loading GeoJSON from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
    }
    const data = await response.json();
    
    // 添加文件名到特征属性中，用于后续识别
    if (data && data.features) {
      const filename = url.split('/').pop() || '';
      console.log('Loaded GeoJSON file:', filename, 'with', data.features.length, 'features');
      
      data.features.forEach((feature: any) => {
        feature._filename = filename;
      });
    } else {
      console.error('Invalid GeoJSON data structure:', data);
    }
    
    return data;
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    return null;
  }
};

// 加载多个GeoJSON文件
export const loadMultipleGeoJson = async (urls: string[]): Promise<any[]> => {
  try {
    const promises = urls.map(url => loadGeoJson(url));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error loading multiple GeoJSON files:', error);
    return [];
  }
};

// 根据数据缩放地图到合适位置
export const fitMapToBounds = (map: any, geojson: any): void => {
  if (!map || !geojson || !geojson.features || !geojson.features.length) {
    return;
  }
  
  try {
    // 获取边界
    const bounds = getBounds(geojson);
    if (!bounds) return;
    
    // 使用天地图的视图范围对象
    const tbounds = new window.T.LngLatBounds(
      new window.T.LngLat(bounds.minLng, bounds.minLat),
      new window.T.LngLat(bounds.maxLng, bounds.maxLat)
    );
    
    // 设置地图视图
    map.fitBounds(tbounds);
  } catch (error) {
    console.error('Error fitting map to bounds:', error);
  }
};

// 计算GeoJSON的边界
export const getBounds = (geojson: any): { minLng: number; minLat: number; maxLng: number; maxLat: number } | null => {
  if (!geojson || !geojson.features || !geojson.features.length) {
    return null;
  }
  
  try {
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;
    
    // 遍历所有特征
    geojson.features.forEach((feature: any) => {
      const geometry = feature.geometry;
      
      if (geometry.type === 'MultiPolygon') {
        // 处理多边形
        geometry.coordinates.forEach((polygon: any) => {
          polygon.forEach((ring: any) => {
            ring.forEach((coord: [number, number]) => {
              const [lng, lat] = coord;
              minLng = Math.min(minLng, lng);
              minLat = Math.min(minLat, lat);
              maxLng = Math.max(maxLng, lng);
              maxLat = Math.max(maxLat, lat);
            });
          });
        });
      } else if (geometry.type === 'Polygon') {
        // 处理单个多边形
        geometry.coordinates.forEach((ring: any) => {
          ring.forEach((coord: [number, number]) => {
            const [lng, lat] = coord;
            minLng = Math.min(minLng, lng);
            minLat = Math.min(minLat, lat);
            maxLng = Math.max(maxLng, lng);
            maxLat = Math.max(maxLat, lat);
          });
        });
      }
    });
    
    return { minLng, minLat, maxLng, maxLat };
  } catch (error) {
    console.error('Error calculating bounds:', error);
    return null;
  }
};

// GeoJSON预定义样式
export const predefinedStyles = {
  china: {
    color: '#1890ff',
    fillColor: 'rgba(24, 144, 255, 0.1)',
    weight: 2
  },
  province: {
    color: '#52c41a',
    fillColor: 'rgba(82, 196, 26, 0.15)',
    weight: 1.5
  },
  city: {
    color: '#fa8c16',
    fillColor: 'rgba(250, 140, 22, 0.2)',
    weight: 1
  }
}; 