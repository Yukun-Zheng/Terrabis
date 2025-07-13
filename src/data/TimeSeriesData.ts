/**
 * 时间序列数据点接口
 */
export interface TimeSeriesPoint {
  id: string;            // 数据点ID
  name: string;          // 名称
  value: number;         // 数值
  timestamp: number;     // 时间戳
  date?: Date;           // 日期对象 (可选)
}

/**
 * 时间序列数据集接口
 */
export interface TimeSeriesDataset {
  id: string;                    // 数据集ID
  name: string;                  // 数据集名称
  description?: string;          // 描述
  unit?: string;                 // 值单位
  points: TimeSeriesPoint[];     // 数据点数组
  min?: number;                  // 最小值
  max?: number;                  // 最大值
  average?: number;              // 平均值
  timeRange?: [Date, Date];      // 时间范围
}

/**
 * 时间间隔类型
 */
export type TimeInterval = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * 生成模拟的时间序列数据
 * 
 * @param regionIds 区域ID数组
 * @param startDate 起始日期
 * @param endDate 结束日期
 * @param interval 时间间隔
 * @param baseValue 基础值
 * @param fluctuation 波动范围 (0-1之间)
 * @param trend 趋势增长率 (正数为增长，负数为下降)
 * @returns 时间序列数据集
 */
export function generateTimeSeriesData(
  regionIds: string[],
  startDate: Date = new Date(2023, 0, 1),
  endDate: Date = new Date(2023, 11, 31),
  interval: TimeInterval = 'month',
  baseValue: number = 100,
  fluctuation: number = 0.2,
  trend: number = 0.05
): TimeSeriesDataset {
  const points: TimeSeriesPoint[] = [];
  const intervalMilliseconds = getIntervalMilliseconds(interval);
  
  // 计算时间点
  const timePoints: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    timePoints.push(new Date(currentDate));
    
    // 增加时间间隔
    switch (interval) {
      case 'day':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'quarter':
        currentDate.setMonth(currentDate.getMonth() + 3);
        break;
      case 'year':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }
  
  // 为每个区域生成数据
  regionIds.forEach(regionId => {
    // 为区域设置随机调整因子，使不同区域有不同的数据曲线
    const regionFactor = 0.5 + Math.random(); // 0.5-1.5之间的随机值
    
    timePoints.forEach((date, index) => {
      // 计算时间因子 (0-1之间)
      const timeFactor = index / (timePoints.length - 1 || 1);
      
      // 应用趋势增长
      const trendValue = baseValue * (1 + trend * timeFactor);
      
      // 添加随机波动
      const randomFactor = 1 + (Math.random() * 2 - 1) * fluctuation;
      
      // 计算最终值
      const value = Math.round(trendValue * randomFactor * regionFactor);
      
      // 添加数据点
      points.push({
        id: `${regionId}-${date.getTime()}`,
        name: `数据点 ${index + 1}`,
        value,
        timestamp: date.getTime(),
        date
      });
    });
  });
  
  // 计算统计值
  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // 创建并返回数据集
  return {
    id: `timeseries-${Date.now()}`,
    name: `时间序列数据 (${interval})`,
    description: `从 ${startDate.toLocaleDateString()} 到 ${endDate.toLocaleDateString()} 的模拟数据`,
    unit: '单位值',
    points,
    min,
    max,
    average,
    timeRange: [startDate, endDate]
  };
}

/**
 * 获取时间间隔对应的毫秒数
 */
function getIntervalMilliseconds(interval: TimeInterval): number {
  const DAY_MS = 24 * 60 * 60 * 1000;
  
  switch (interval) {
    case 'day':
      return DAY_MS;
    case 'week':
      return 7 * DAY_MS;
    case 'month':
      return 30 * DAY_MS; // 近似值
    case 'quarter':
      return 90 * DAY_MS; // 近似值
    case 'year':
      return 365 * DAY_MS; // 近似值
    default:
      return DAY_MS;
  }
}

/**
 * 获取中国省级行政区的时间序列数据
 */
export function getChinaProvincesTimeSeriesData(): TimeSeriesDataset {
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
  
  // 生成2023年全年按月分布的数据
  return generateTimeSeriesData(
    provinceIds,
    new Date(2023, 0, 1),
    new Date(2023, 11, 1),
    'month',
    1000,    // 基础值
    0.3,     // 波动范围
    0.08     // 年增长趋势
  );
}

/**
 * 按区域ID过滤时间序列数据
 */
export function filterTimeSeriesByRegionId(dataset: TimeSeriesDataset, regionId: string): TimeSeriesPoint[] {
  if (!dataset || !dataset.points || !Array.isArray(dataset.points) || !regionId) {
    return [];
  }
  
  return dataset.points.filter(point => point && point.id && point.id.startsWith(`${regionId}-`));
}

/**
 * 按时间范围过滤时间序列数据
 */
export function filterTimeSeriesByTimeRange(
  dataset: TimeSeriesDataset, 
  startDate: Date, 
  endDate: Date
): TimeSeriesPoint[] {
  return dataset.points.filter(point => {
    const pointDate = point.date || new Date(point.timestamp);
    return pointDate >= startDate && pointDate <= endDate;
  });
}

/**
 * 将时间序列数据按区域ID分组
 */
export function groupTimeSeriesByRegion(dataset: TimeSeriesDataset): Record<string, TimeSeriesPoint[]> {
  const result: Record<string, TimeSeriesPoint[]> = {};
  
  dataset.points.forEach(point => {
    // 提取区域ID (格式: regionId-timestamp)
    const regionId = point.id.split('-')[0];
    
    if (!result[regionId]) {
      result[regionId] = [];
    }
    
    result[regionId].push(point);
  });
  
  return result;
} 