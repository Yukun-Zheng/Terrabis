import React, { useEffect, useRef } from 'react';

interface HeatPoint {
  name?: string;
  lng: number;
  lat: number;
  count: number;
}

interface HeatmapLayerProps {
  map: any; // 天地图地图实例
  data: HeatPoint[];
  maxValue?: number;
  visible?: boolean;
  radius?: number;
  opacity?: number;
  gradient?: Record<string, string>;
  onLoad?: () => void;
}

/**
 * 天地图热力图图层组件
 */
const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  map,
  data,
  maxValue = 100,
  visible = true,
  radius = 25,
  opacity = 0.7,
  gradient,
  onLoad
}) => {
  const heatmapRef = useRef<any>(null);
  const loadedRef = useRef<boolean>(false);

  // 初始化热力图
  useEffect(() => {
    if (!map || !window.T || !window.T.HeatmapOverlay) {
      console.error('热力图初始化失败: T.HeatmapOverlay不可用，请确保天地图热力图脚本已加载');
      return;
    }
    
    try {
      // 配置热力图
      const options: any = {
        radius: radius || 30,
        opacity: opacity * 100, // 天地图API使用1-100的透明度范围
      };
      
      if (gradient) {
        options.gradient = gradient;
      }
      
      // 创建热力图实例
      heatmapRef.current = new window.T.HeatmapOverlay(options);
      
      // 添加热力图到地图
      map.addOverLay(heatmapRef.current);
      
      // 设置数据
      updateHeatmap();
      
      loadedRef.current = true;
      if (onLoad) onLoad();
      
      console.log('热力图初始化成功');
    } catch (err) {
      console.error('初始化热力图失败:', err);
    }
    
    return () => {
      if (heatmapRef.current) {
        try {
          map.removeOverLay(heatmapRef.current);
        } catch (err) {
          console.error('清理热力图失败:', err);
        }
      }
    };
  }, [map]);

  // 当数据或配置变化时更新热力图
  useEffect(() => {
    updateHeatmap();
  }, [data, maxValue, visible, radius, opacity, gradient]);

  // 更新热力图数据
  const updateHeatmap = () => {
    if (!heatmapRef.current || !loadedRef.current) return;
    
    try {
      // 设置数据
      heatmapRef.current.setDataSet({
        data: data,
        max: maxValue
      });
      
      // 控制显示/隐藏
      if (visible) {
        heatmapRef.current.show();
      } else {
        heatmapRef.current.hide();
      }
    } catch (err) {
      console.error('更新热力图数据失败:', err);
    }
  };

  // 该组件不渲染任何UI元素
  return null;
};

export default HeatmapLayer; 