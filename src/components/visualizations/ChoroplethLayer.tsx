import React, { useEffect, useRef, useState } from 'react';
import { FeatureDataPoint } from '../../data/choroplethData';

// 颜色分级配置
interface ColorScale {
  range: [number, number];  // 值范围
  color: string;            // 对应颜色
}

// 分级设色图属性
interface ChoroplethLayerProps {
  map: any;                            // 天地图地图实例
  data: FeatureDataPoint[];            // 数据数组
  geoJsonData: any;                    // GeoJSON数据
  visible?: boolean;                   // 是否可见
  idField?: string;                    // GeoJSON中用作ID的字段名
  nameField?: string;                  // GeoJSON中用作名称的字段名
  colorScales?: ColorScale[];          // 颜色分级方案
  defaultColor?: string;               // 默认颜色
  borderColor?: string;                // 边界线颜色
  borderWidth?: number;                // 边界线宽度
  borderOpacity?: number;              // 边界线透明度
  opacity?: number;                    // 填充透明度
  highlightColor?: string;             // 高亮颜色
  onRegionClick?: (feature: any, data: FeatureDataPoint | null, lnglat: any) => void; // 区域点击回调
  onLoad?: () => void;                 // 加载完成回调
}

/**
 * 分级设色图图层组件
 * 根据数值大小对地图区域进行分级着色，用于展示统计数据在地理空间上的分布
 */
const ChoroplethLayer: React.FC<ChoroplethLayerProps> = ({
  map,
  data,
  geoJsonData,
  visible = true,
  idField = 'id',
  nameField = 'name',
  colorScales = [
    { range: [0, 20], color: '#FFEDA0' },
    { range: [20, 40], color: '#FED976' },
    { range: [40, 60], color: '#FEB24C' },
    { range: [60, 80], color: '#FD8D3C' },
    { range: [80, 100], color: '#FC4E2A' },
    { range: [100, 150], color: '#E31A1C' },
    { range: [150, Infinity], color: '#BD0026' }
  ],
  defaultColor = '#F2F2F2',
  borderColor = '#FFFFFF',
  borderWidth = 1,
  borderOpacity = 0.8,
  opacity = 0.7,
  highlightColor = '#3388ff',
  onRegionClick,
  onLoad
}) => {
  // 存储图层引用
  const layerRef = useRef<any[]>([]);
  // 存储数据映射
  const dataMapRef = useRef<Map<string, FeatureDataPoint>>(new Map());
  
  // 初始化时加载图层
  useEffect(() => {
    if (!map || !geoJsonData || !data) {
      console.error('分级设色图初始化失败: 地图实例不存在、数据无效或GeoJSON无效');
      return;
    }
    
    // 创建数据映射（ID -> 数据点）
    createDataMapping();
    
    // 渲染分级设色图
    renderChoroplethLayer();
    
    // 更新可见性
    updateVisibility(visible);
    
    // 触发加载完成回调
    if (onLoad) onLoad();
    
    // 组件卸载时清理
    return () => {
      clearLayers();
    };
  }, [map, data, geoJsonData]);
  
  // 当属性变化时更新
  useEffect(() => {
    updateVisibility(visible);
  }, [visible]);
  
  // 当数据变化时重新渲染
  useEffect(() => {
    if (layerRef.current.length > 0) {
      // 重新创建数据映射
      createDataMapping();
      // 更新样式
      updateStyles();
    }
  }, [data, colorScales, opacity]);
  
  // 创建数据映射
  const createDataMapping = () => {
    const dataMap = new Map<string, FeatureDataPoint>();
    data.forEach(item => {
      dataMap.set(item.id, item);
    });
    dataMapRef.current = dataMap;
  };
  
  // 清理图层
  const clearLayers = () => {
    if (layerRef.current.length > 0) {
      layerRef.current.forEach(polygon => {
        if (map) map.removeOverLay(polygon);
      });
      layerRef.current = [];
    }
  };
  
  // 获取区域颜色
  const getColorForValue = (value: number): string => {
    // 找到匹配的颜色区间
    for (const scale of colorScales) {
      if (value >= scale.range[0] && value < scale.range[1]) {
        return scale.color;
      }
    }
    return defaultColor;
  };
  
  // 渲染分级设色图
  const renderChoroplethLayer = () => {
    // 清理已有图层
    clearLayers();
    
    if (!geoJsonData || !geoJsonData.features || !Array.isArray(geoJsonData.features)) {
      console.error('无效的GeoJSON数据');
      return;
    }
    
    const polygons: any[] = [];
    
    // 遍历GeoJSON特征
    geoJsonData.features.forEach((feature: any) => {
      if (!feature.geometry) return;
      
      // 获取特征属性中的ID
      const featureId = feature.properties?.[idField] || feature.id;
      // 获取特征属性中的名称
      const featureName = feature.properties?.[nameField] || feature.properties?.name || 'Unknown';
      
      // 获取对应的数据点
      const dataPoint = dataMapRef.current.get(featureId);
      
      // 确定填充颜色
      const fillColor = dataPoint 
        ? getColorForValue(dataPoint.value) 
        : defaultColor;
      
      try {
        // 创建多边形
        const polygon = createPolygonFromFeature(feature, {
          color: borderColor,
          weight: borderWidth,
          opacity: borderOpacity,
          fillColor,
          fillOpacity: opacity
        });
        
        if (polygon) {
          // 存储关联数据
          (polygon as any).featureData = {
            feature,
            dataPoint
          };
          
          // 添加交互事件
          addPolygonInteraction(polygon);
          
          // 添加到地图
          map.addOverLay(polygon);
          
          // 保存引用
          polygons.push(polygon);
        }
      } catch (err) {
        console.error(`创建区域 ${featureName} (${featureId}) 时出错:`, err);
      }
    });
    
    // 保存所有多边形引用
    layerRef.current = polygons;
    
    console.log(`分级设色图层创建成功，共 ${polygons.length} 个区域`);
  };
  
  // 从GeoJSON特征创建多边形
  const createPolygonFromFeature = (feature: any, options: any): any => {
    const { geometry } = feature;
    
    if (!geometry) return null;
    
    try {
      // 根据几何类型处理
      switch (geometry.type) {
        case 'Polygon':
          return createPolygonFromCoordinates(geometry.coordinates[0], options);
        
        case 'MultiPolygon':
          // 为多多边形创建多个多边形并返回第一个（简化处理）
          const polygons = geometry.coordinates.map((coords: any) => 
            createPolygonFromCoordinates(coords[0], options)
          );
          return polygons[0]; // 返回第一个多边形
          
        default:
          console.warn(`不支持的几何类型: ${geometry.type}`);
          return null;
      }
    } catch (err) {
      console.error('从GeoJSON创建多边形时出错:', err);
      return null;
    }
  };
  
  // 从坐标数组创建多边形
  const createPolygonFromCoordinates = (coordinates: number[][], options: any): any => {
    // 转换坐标为天地图LngLat对象
    const points = coordinates.map((coord: number[]) => 
      new window.T.LngLat(coord[0], coord[1])
    );
    
    // 创建多边形
    return new window.T.Polygon(points, options);
  };
  
  // 添加多边形交互事件
  const addPolygonInteraction = (polygon: any) => {
    // 高亮状态
    let isHighlighted = false;
    const originalFillColor = polygon.getFillColor();
    
    // 鼠标进入事件
    polygon.addEventListener('mouseover', () => {
      if (!isHighlighted) {
        isHighlighted = true;
        polygon.setFillColor(highlightColor);
        polygon.setFillOpacity(opacity * 1.2);
      }
    });
    
    // 鼠标离开事件
    polygon.addEventListener('mouseout', () => {
      if (isHighlighted) {
        isHighlighted = false;
        polygon.setFillColor(originalFillColor);
        polygon.setFillOpacity(opacity);
      }
    });
    
    // 点击事件
    if (onRegionClick) {
      polygon.addEventListener('click', (e: any) => {
        const { feature, dataPoint } = polygon.featureData;
        onRegionClick(feature, dataPoint, e.lnglat);
      });
    }
  };
  
  // 更新图层可见性
  const updateVisibility = (isVisible: boolean) => {
    if (layerRef.current.length === 0) return;
    
    layerRef.current.forEach(polygon => {
      if (isVisible) {
        polygon.show();
      } else {
        polygon.hide();
      }
    });
  };
  
  // 更新样式
  const updateStyles = () => {
    if (layerRef.current.length === 0) return;
    
    layerRef.current.forEach(polygon => {
      const { feature, dataPoint } = polygon.featureData;
      
      // 确定填充颜色
      const fillColor = dataPoint 
        ? getColorForValue(dataPoint.value) 
        : defaultColor;
      
      // 更新样式
      polygon.setFillColor(fillColor);
      polygon.setFillOpacity(opacity);
    });
  };

  // 组件不渲染任何UI
  return null;
};

export default ChoroplethLayer; 