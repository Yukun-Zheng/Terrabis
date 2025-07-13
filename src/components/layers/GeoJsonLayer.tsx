import React, { useEffect, useRef, useState } from 'react';

interface GeoJsonLayerProps {
  map: any; // 天地图地图实例
  data: any; // GeoJSON数据
  visible?: boolean;
  opacity?: number; // 透明度控制 0-1
  color?: string; // 边界颜色
  fillColor?: string; // 填充颜色
  onClick?: (feature: any, lnglat: any) => void; // 点击回调
  onLoad?: () => void;
}

/**
 * GeoJSON图层组件 - 用于显示行政区域边界
 */
const GeoJsonLayer: React.FC<GeoJsonLayerProps> = ({
  map,
  data,
  visible = true,
  opacity = 0.5,
  color = '#1890ff',
  fillColor = 'rgba(24, 144, 255, 0.2)',
  onClick,
  onLoad
}) => {
  const layerRef = useRef<any>(null);
  const loadedRef = useRef<boolean>(false);
  const [layerId] = useState(`geojson-${Date.now()}`);
  
  // 检查数据有效性
  useEffect(() => {
    if (!data || !data.features || !data.features.length) {
      console.error('GeoJSON数据无效或为空:', data);
    } else {
      console.log(`GeoJSON图层(${layerId})数据有效，包含${data.features.length}个特征`);
    }
  }, [data, layerId]);
  
  // 初始化GeoJSON图层
  useEffect(() => {
    if (!map) {
      console.error('GeoJSON图层初始化失败: 地图实例不存在');
      return;
    }
    
    if (!window.T) {
      console.error('GeoJSON图层初始化失败: 天地图API未加载');
      return;
    }

    // 检查数据是否有效
    if (!data || !data.features || !data.features.length) {
      console.error('GeoJSON图层初始化失败: 数据无效或为空');
      return;
    }

    try {
      console.log('初始化GeoJSON图层...');
      // 创建图层实例
      initGeoJsonLayer();
      // 清理函数
      return () => {
        if (layerRef.current && Array.isArray(layerRef.current)) {
          layerRef.current.forEach((polygon: any) => {
            try {
              map.removeOverLay(polygon);
            } catch (err) {
              console.error('移除GeoJSON多边形失败:', err);
            }
          });
          layerRef.current = [];
          console.log('GeoJSON图层已移除');
        }
      };
    } catch (err) {
      console.error('初始化GeoJSON图层时出错:', err);
    }
  }, [map, data]);

  // 当属性变化时更新图层
  useEffect(() => {
    if (loadedRef.current) {
      updateLayerStyle();
    }
  }, [visible, opacity, color, fillColor]);

  // 初始化GeoJSON图层函数
  const initGeoJsonLayer = () => {
    // 清理旧的
    if (layerRef.current && Array.isArray(layerRef.current)) {
      layerRef.current.forEach((polygon: any) => {
        try {
          map.removeOverLay(polygon);
        } catch (err) {
          console.error('移除现有GeoJSON多边形失败:', err);
        }
      });
    }
    layerRef.current = [];

    try {
      console.log(`开始处理GeoJSON数据，特征数量: ${data.features.length}`);
      // 遍历features
      data.features.forEach((feature: any, index: number) => {
        if (!feature.geometry) {
          console.error('特征没有geometry属性:', feature);
          return;
        }
        if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach((polygonCoords: any) => {
            polygonCoords.forEach((ringCoords: any) => {
              if (!ringCoords || !Array.isArray(ringCoords) || ringCoords.length < 3) {
                console.error('无效的多边形坐标:', ringCoords);
                return;
              }
              const points = ringCoords.map((coord: [number, number]) => new window.T.LngLat(coord[0], coord[1]));
              const polygon = new window.T.Polygon(points, {
                color: color,
                weight: 2,
                opacity: opacity,
                fillColor: fillColor,
                fillOpacity: opacity * 0.5
              });
              (polygon as any).feature = feature;
              (polygon as any).id = `${layerId}-${index}`;
              if (onClick) {
                polygon.addEventListener('click', (e: any) => {
                  onClick(feature, e.lnglat);
                });
              }
              map.addOverLay(polygon);
              layerRef.current.push(polygon);
            });
          });
        } else if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates.forEach((ringCoords: any) => {
            if (!ringCoords || !Array.isArray(ringCoords) || ringCoords.length < 3) {
              console.error('无效的多边形坐标:', ringCoords);
              return;
            }
            const points = ringCoords.map((coord: [number, number]) => new window.T.LngLat(coord[0], coord[1]));
            const polygon = new window.T.Polygon(points, {
              color: color,
              weight: 2,
              opacity: opacity,
              fillColor: fillColor,
              fillOpacity: opacity * 0.5
            });
            (polygon as any).feature = feature;
            (polygon as any).id = `${layerId}-${index}`;
            if (onClick) {
              polygon.addEventListener('click', (e: any) => {
                onClick(feature, e.lnglat);
              });
            }
            map.addOverLay(polygon);
            layerRef.current.push(polygon);
          });
        } else {
          console.warn('不支持的几何类型:', feature.geometry.type);
        }
      });
      // 设置可见性
      if (!visible && layerRef.current) {
        layerRef.current.forEach((polygon: any) => polygon.hide && polygon.hide());
      } else if (visible && layerRef.current) {
        layerRef.current.forEach((polygon: any) => polygon.show && polygon.show());
      }
    } catch (err) {
      console.error('初始化GeoJSON图层时出错:', err);
    }
  };

  // 更新图层样式
  const updateLayerStyle = () => {
    if (!layerRef.current) {
      console.warn('无法更新GeoJSON图层样式: 图层未初始化');
      return;
    }
    
    try {
      // 透明度、颜色等样式更新需要重新创建图层
      // 但天地图API不支持直接更新OverlayGroup的样式
      // 这里可以选择完全重新创建图层来应用新样式
      if (loadedRef.current) {
        console.log('重新创建GeoJSON图层以应用新样式');
        initGeoJsonLayer();
      }
    } catch (err) {
      console.error('更新GeoJSON图层样式失败:', err);
    }
  };

  // 组件不渲染任何UI元素
  return null;
};

export default GeoJsonLayer; 