/**
 * 数据点接口
 */
export interface FeatureDataPoint {
  id: string;            // 区域ID
  name: string;          // 区域名称
  value: number;         // 数值
  properties?: any;      // 其他属性
}

/**
 * 生成随机分级设色图数据
 * 
 * @param featureIds 特征ID数组
 * @param minValue 最小值
 * @param maxValue 最大值
 * @param distribution 数据分布类型: 'normal'(正态分布) | 'uniform'(均匀分布) | 'exponential'(指数分布)
 * @returns 生成的数据点数组
 */
export function generateChoroplethData(
  featureIds: string[],
  minValue: number = 0,
  maxValue: number = 100,
  distribution: 'normal' | 'uniform' | 'exponential' = 'normal'
): FeatureDataPoint[] {
  if (!Array.isArray(featureIds) || featureIds.length === 0) {
    return [];
  }
  
  return featureIds.map(id => {
    let value: number;
    
    // 根据分布类型生成随机值
    switch (distribution) {
      case 'normal':
        // 正态分布 - 大多数值在中间，少数在两端
        const mean = (minValue + maxValue) / 2;
        const stdDev = (maxValue - minValue) / 6; // 标准差取值范围的1/6，确保99.7%的值在范围内
        value = generateNormalRandom(mean, stdDev);
        // 限制在范围内
        value = Math.max(minValue, Math.min(maxValue, value));
        break;
        
      case 'exponential':
        // 指数分布 - 小值较多，大值较少
        const lambda = 5 / (maxValue - minValue); // 调整参数，使分布更明显
        value = minValue + generateExponentialRandom(lambda, maxValue - minValue);
        break;
        
      case 'uniform':
      default:
        // 均匀分布 - 等概率分布
        value = minValue + Math.random() * (maxValue - minValue);
        break;
    }
    
    // 四舍五入到整数
    value = Math.round(value);
    
    return {
      id,
      name: `区域 ${id}`,
      value
    };
  });
}

/**
 * 生成基于ID的确定性随机值
 * 
 * @param id 唯一标识符
 * @param min 最小值
 * @param max 最大值
 * @returns 生成的数值
 */
export function generateDeterministicValue(id: string, min: number, max: number): number {
  // 使用字符串哈希生成伪随机数
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // 将哈希值映射到范围
  const normalized = (hash & 0x7fffffff) / 0x7fffffff; // 0-1之间的值
  return min + normalized * (max - min);
}

/**
 * 生成正态分布随机数
 * 
 * @param mean 平均值
 * @param stdDev 标准差
 * @returns 随机数
 */
function generateNormalRandom(mean: number, stdDev: number): number {
  // Box-Muller变换生成标准正态分布随机数
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // 避免对数为0
  while (v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  
  // 调整为指定均值和标准差
  return mean + z * stdDev;
}

/**
 * 生成指数分布随机数
 * 
 * @param lambda 指数分布参数
 * @param max 最大值
 * @returns 随机数
 */
function generateExponentialRandom(lambda: number, max: number): number {
  // 生成指数分布随机数
  const u = Math.random();
  return Math.min(max, -Math.log(u) / lambda);
}

/**
 * 生成中国省级行政区的分级设色数据
 * 
 * @param distribution 数据分布类型
 * @returns 分级设色数据
 */
export function getChinaProvinceChoroplethData(distribution: 'normal' | 'uniform' | 'exponential' = 'normal'): FeatureDataPoint[] {
  // 中国省级行政区ID (使用GB码作为ID)
  const provinceIds = [
    '110000', // 北京市
    '120000', // 天津市
    '130000', // 河北省
    '140000', // 山西省
    '150000', // 内蒙古自治区
    '210000', // 辽宁省
    '220000', // 吉林省
    '230000', // 黑龙江省
    '310000', // 上海市
    '320000', // 江苏省
    '330000', // 浙江省
    '340000', // 安徽省
    '350000', // 福建省
    '360000', // 江西省
    '370000', // 山东省
    '410000', // 河南省
    '420000', // 湖北省
    '430000', // 湖南省
    '440000', // 广东省
    '450000', // 广西壮族自治区
    '460000', // 海南省
    '500000', // 重庆市
    '510000', // 四川省
    '520000', // 贵州省
    '530000', // 云南省
    '540000', // 西藏自治区
    '610000', // 陕西省
    '620000', // 甘肃省
    '630000', // 青海省
    '640000', // 宁夏回族自治区
    '650000'  // 新疆维吾尔自治区
  ];
  
  // 生成分级设色数据
  return generateChoroplethData(provinceIds, 10, 1000, distribution);
}

/**
 * 为GeoJSON特征创建ID映射的数据
 * 
 * @param geojson GeoJSON数据
 * @param idField ID字段名
 * @param minValue 最小值
 * @param maxValue 最大值
 * @param distribution 数据分布类型
 * @returns 分级设色数据
 */
export function createDataFromGeoJson(
  geojson: any,
  idField: string = 'id',
  minValue: number = 0,
  maxValue: number = 100,
  distribution: 'normal' | 'uniform' | 'exponential' = 'normal'
): FeatureDataPoint[] {
  if (!geojson || !geojson.features || !Array.isArray(geojson.features)) {
    return [];
  }
  
  // 提取ID数组
  const ids = geojson.features.map((feature: any) => {
    return feature.properties?.[idField] || feature.id || `feature-${Math.random().toString(36).substr(2, 9)}`;
  });
  
  // 生成数据
  return generateChoroplethData(ids, minValue, maxValue, distribution);
}

/**
 * 为时间序列数据创建同一时间点的分级设色数据
 * 
 * @param timeSeriesData 时间序列数据
 * @param timestamp 时间戳
 * @returns 分级设色数据
 */
export function createChoroplethDataFromTimeSeries(timeSeriesData: any[], timestamp: number): FeatureDataPoint[] {
  if (!Array.isArray(timeSeriesData)) {
    return [];
  }
  
  // 过滤指定时间戳的数据
  const filteredData = timeSeriesData.filter(item => item.timestamp === timestamp);
  
  // 转换为分级设色数据格式
  return filteredData.map(item => ({
    id: item.regionId || item.id,
    name: item.name || `区域 ${item.regionId || item.id}`,
    value: item.value,
    properties: item
  }));
} 