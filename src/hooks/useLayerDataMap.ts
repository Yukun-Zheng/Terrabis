import { useMemo } from 'react';
import { chinaCityHeatData, getShenzhenHeatData } from '../data/heatmapData';
import { getChinaHexbinData, getGuangdongHexbinData, getShenzhenHexbinData } from '../data/hexbinData';
import { getChinaProvinceChoroplethData } from '../data/choroplethData';

export function useLayerDataMap(): { [key: string]: any[] } {
  return useMemo(() => ({
    'heatmap-china': chinaCityHeatData,
    'heatmap-shenzhen': getShenzhenHeatData(200),
    'heatmap-china-full': chinaCityHeatData,
    'hexbin-china': getChinaHexbinData(300),
    'hexbin-guangdong': getGuangdongHexbinData(200),
    'hexbin-shenzhen': getShenzhenHexbinData(250),
    'choropleth-china': getChinaProvinceChoroplethData(),
    // ...可继续补充
  }), []);
} 