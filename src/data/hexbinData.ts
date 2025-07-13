/**
 * 蜂窝图数据点接口
 */
export interface HexPoint {
  name: string;
  lng: number;
  lat: number;
  count: number;
}

/**
 * 获取随机蜂窝图数据 - 中国范围
 */
export const getChinaHexbinData = (count = 300): HexPoint[] => {
  // 中国大陆范围
  const chinaArea = {
    minLng: 73.5,
    maxLng: 135.0,
    minLat: 18.0,
    maxLat: 53.5
  };
  
  const data: HexPoint[] = [];
  
  // 生成随机点
  for (let i = 0; i < count; i++) {
    const lng = chinaArea.minLng + Math.random() * (chinaArea.maxLng - chinaArea.minLng);
    const lat = chinaArea.minLat + Math.random() * (chinaArea.maxLat - chinaArea.minLat);
    const heatValue = Math.floor(Math.random() * 100) + 1; // 1-100的值
    
    data.push({
      name: `位置${i+1}`,
      lng,
      lat,
      count: heatValue
    });
  }
  
  return data;
};

/**
 * 获取广东省蜂窝图数据
 */
export const getGuangdongHexbinData = (count = 200): HexPoint[] => {
  // 广东省范围
  const guangdongArea = {
    minLng: 109.7,
    maxLng: 117.3,
    minLat: 20.2,
    maxLat: 25.5
  };
  
  const data: HexPoint[] = [];
  
  // 生成随机点
  for (let i = 0; i < count; i++) {
    const lng = guangdongArea.minLng + Math.random() * (guangdongArea.maxLng - guangdongArea.minLng);
    const lat = guangdongArea.minLat + Math.random() * (guangdongArea.maxLat - guangdongArea.minLat);
    const heatValue = Math.floor(Math.random() * 100) + 1; // 1-100的值
    
    // 人口密度模拟 - 珠三角区域值更高
    let multiplier = 1.0;
    // 珠三角区域大致范围
    if (lng > 112.5 && lng < 114.5 && lat > 22.4 && lat < 23.5) {
      multiplier = 3.0; // 珠三角区域值更高
    }
    
    data.push({
      name: `位置${i+1}`,
      lng,
      lat,
      count: Math.floor(heatValue * multiplier)
    });
  }
  
  return data;
};

/**
 * 深圳市蜂窝图数据 - 更密集、更贴近实际分布
 */
export const getShenzhenHexbinData = (count = 250): HexPoint[] => {
  // 深圳市范围
  const shenzhenArea = {
    minLng: 113.8,
    maxLng: 114.5,
    minLat: 22.4,
    maxLat: 22.8
  };
  
  const data: HexPoint[] = [];
  
  // 深圳主要区域及其权重 (模拟人口/活动密度)
  const regions = [
    { name: '福田中心区', lng: 114.055, lat: 22.543, weight: 10 },
    { name: '南山科技园', lng: 113.944, lat: 22.540, weight: 9 },
    { name: '罗湖老城区', lng: 114.131, lat: 22.548, weight: 8 },
    { name: '宝安中心区', lng: 113.883, lat: 22.555, weight: 7 },
    { name: '龙岗中心城', lng: 114.251, lat: 22.720, weight: 6 },
    { name: '盐田港区', lng: 114.236, lat: 22.557, weight: 5 },
    { name: '前海新区', lng: 113.892, lat: 22.527, weight: 8 },
    { name: '龙华中心区', lng: 114.025, lat: 22.659, weight: 7 }
  ];
  
  // 生成围绕主要区域聚集的点
  for (let i = 0; i < count; i++) {
    // 随机选择一个中心区域
    const regionIndex = Math.floor(Math.pow(Math.random(), 1.5) * regions.length);
    const region = regions[regionIndex] || regions[0];
    
    // 围绕中心点生成随机偏移
    const radius = 0.025 * Math.pow(Math.random(), 0.5); // 控制扩散范围
    const angle = Math.random() * 2 * Math.PI;
    
    const lng = region.lng + radius * Math.cos(angle);
    const lat = region.lat + radius * Math.sin(angle);
    
    // 确保在深圳范围内
    if (lng >= shenzhenArea.minLng && lng <= shenzhenArea.maxLng && 
        lat >= shenzhenArea.minLat && lat <= shenzhenArea.maxLat) {
      
      // 生成热力值，加入区域权重影响
      const baseValue = Math.floor(Math.random() * 60) + 20; // 20-80的基础值
      const value = Math.min(100, Math.floor(baseValue * (region.weight / 5))); // 按区域权重调整
      
      data.push({
        name: `${region.name}-${i}`,
        lng,
        lat,
        count: value
      });
    } else {
      // 如果超出边界，重新生成一个点
      i--;
    }
  }
  
  return data;
}; 