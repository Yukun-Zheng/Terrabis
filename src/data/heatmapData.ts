/**
 * 热力图数据点接口
 */
export interface HeatPoint {
  name: string;
  lng: number;
  lat: number;
  count: number;
}

/**
 * 中国主要城市热力图数据
 */
export const chinaCityHeatData: HeatPoint[] = [
  { name: '深圳', lng: 114.07, lat: 22.62, count: 41 },
  { name: '广州', lng: 113.23, lat: 23.16, count: 38 },
  { name: '北京', lng: 116.46, lat: 39.92, count: 79 },
  { name: '上海', lng: 121.48, lat: 31.22, count: 25 },
  { name: '杭州', lng: 120.19, lat: 30.26, count: 84 },
  { name: '南京', lng: 118.78, lat: 32.04, count: 67 },
  { name: '武汉', lng: 114.31, lat: 30.52, count: 273 },
  { name: '成都', lng: 104.06, lat: 30.67, count: 58 },
  { name: '重庆', lng: 106.54, lat: 29.59, count: 66 },
  { name: '西安', lng: 108.95, lat: 34.27, count: 61 },
  { name: '青岛', lng: 120.33, lat: 36.07, count: 18 },
  { name: '长沙', lng: 113.0, lat: 28.21, count: 175 },
  { name: '福州', lng: 119.3, lat: 26.08, count: 29 },
  { name: '厦门', lng: 118.1, lat: 24.46, count: 26 },
  { name: '哈尔滨', lng: 126.63, lat: 45.75, count: 114 },
  { name: '济南', lng: 117.0, lat: 36.65, count: 92 },
  { name: '太原', lng: 112.53, lat: 37.87, count: 39 },
  { name: '西宁', lng: 101.74, lat: 36.56, count: 57 },
  { name: '兰州', lng: 103.73, lat: 36.03, count: 99 },
  { name: '拉萨', lng: 91.11, lat: 29.97, count: 24 },
  { name: '南宁', lng: 108.33, lat: 22.84, count: 37 },
  { name: '长春', lng: 125.35, lat: 43.88, count: 51 },
  { name: '天津', lng: 117.2, lat: 39.13, count: 105 },
  { name: '昆明', lng: 102.73, lat: 25.04, count: 39 },
  { name: '贵阳', lng: 106.71, lat: 26.57, count: 71 },
  { name: '海口', lng: 110.35, lat: 20.02, count: 44 },
  { name: '石家庄', lng: 114.48, lat: 38.03, count: 147 },
  { name: '郑州', lng: 113.65, lat: 34.76, count: 113 },
  { name: '大连', lng: 121.62, lat: 38.92, count: 47 },
  { name: '沈阳', lng: 123.38, lat: 41.8, count: 50 },
  { name: '苏州', lng: 120.62, lat: 31.32, count: 50 },
  { name: '南通', lng: 121.05, lat: 32.08, count: 23 },
  { name: '无锡', lng: 120.29, lat: 31.59, count: 71 },
  { name: '温州', lng: 120.65, lat: 28.01, count: 95 },
  { name: '合肥', lng: 117.27, lat: 31.86, count: 229 },
  { name: '大庆', lng: 125.03, lat: 46.58, count: 279 }
];

/**
 * 获取深圳区域随机热力数据
 */
export const getShenzhenHeatData = (count = 100): HeatPoint[] => {
  // 深圳市中心范围
  const shenzhenArea = {
    minLng: 113.8,
    maxLng: 114.5,
    minLat: 22.4,
    maxLat: 22.8
  };
  
  const data: HeatPoint[] = [];
  
  // 生成随机点
  for (let i = 0; i < count; i++) {
    const lng = shenzhenArea.minLng + Math.random() * (shenzhenArea.maxLng - shenzhenArea.minLng);
    const lat = shenzhenArea.minLat + Math.random() * (shenzhenArea.maxLat - shenzhenArea.minLat);
    const heatValue = Math.floor(Math.random() * 100) + 1; // 1-100的热力值
    
    data.push({
      name: `位置${i+1}`,
      lng,
      lat,
      count: heatValue
    });
  }
  
  return data;
}; 