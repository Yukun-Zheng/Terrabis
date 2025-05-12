import { useState, useEffect } from 'react';
import mapboxgl, { Map, RasterSourceSpecification, MapboxEvent, ErrorEvent } from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN } from '../config/api-keys';

/**
 * 地图类型 - 预留给将来扩展
 */
export enum MAP_SOURCE_TYPE {
  DEFAULT = 'default'
}

/**
 * 地图初始化配置参数
 */
interface UseMapInitializationProps {
  containerId: string;
  showScaleControl?: boolean;
  showNavigationControl?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
  style?: string;
  mapSourceType?: MAP_SOURCE_TYPE; // 地图源类型参数
}

/**
 * 地图初始化钩子
 */
export default function useMapInitialization({ 
  containerId,
  showScaleControl = true,
  showNavigationControl = true,
  initialCenter = [116.39, 39.91], // 默认北京中心
  initialZoom = 10,
  style = 'mapbox://styles/mapbox/streets-v12',
  mapSourceType = MAP_SOURCE_TYPE.DEFAULT
}: UseMapInitializationProps) {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [currentMapSource, setCurrentMapSource] = useState<MAP_SOURCE_TYPE>(mapSourceType);

  useEffect(() => {
    // 设置Mapbox访问令牌
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    // 防止重复初始化
    if (mapInstance) return;

    // 彻底解决 this.errorCb 相关问题
    // 1. 添加全局错误处理器到 mapboxgl
    // 注意：对于 mapboxgl 3.x 版本，我们需要不同的解决方案
    // @ts-ignore
    if (!globalThis._hasPatchedMapboxGLError) {
      const originalMapConstructor = mapboxgl.Map;
      // @ts-ignore
      mapboxgl.Map = function(...args) {
        const instance = new originalMapConstructor(...args);
        
        // 添加默认错误处理函数
        const originalOn = instance.on.bind(instance);
        instance.on = function(type, listener) {
          if (type === 'error' && !listener) {
            return originalOn('error', (e) => {
              console.log('Mapbox GL 默认错误处理:', e);
              return false;
            });
          }
          return originalOn(type, listener);
        };
        
        return instance;
      };
      
      // 保留原始的原型
      mapboxgl.Map.prototype = originalMapConstructor.prototype;
      
      // 标记已修补全局错误处理
      // @ts-ignore
      globalThis._hasPatchedMapboxGLError = true;
    }

    /**
     * 初始化地图
     */
    const initMap = () => {
      try {
        console.log('初始化地图...');
        
        // 检查容器是否存在
        const container = document.getElementById(containerId);
        if (!container) {
          throw new Error(`地图容器不存在: ${containerId}`);
        }

        // 处理初始化错误的通用函数
        const errorHandler = (e: any) => {
          console.error('地图错误:', e?.error || e);
          const errorMessage = e?.error?.message || (e instanceof Error ? e.message : '未知错误');
          setError(`地图加载失败: ${errorMessage}`);
          setLoading(false);
        };
        
        // 创建新的地图实例 - 使用简单样式但添加必要的属性避免错误
        const map = new mapboxgl.Map({
          container: containerId,
          style: {
            version: 8,
            sources: {},
            layers: [],
            glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
          },
          center: initialCenter,
          zoom: initialZoom,
          minZoom: 3,
          maxZoom: 18,
          attributionControl: false,
          localIdeographFontFamily: "'SimHei', 'Microsoft YaHei', sans-serif",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: true
        });
        
        // 确保错误处理逻辑存在 - 这是关键
        if (!map._events || !map._events.error || map._events.error.length === 0) {
          map.on('error', errorHandler);
        }

        // 添加控件
        if (showScaleControl) {
          map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
        }

        if (showNavigationControl) {
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        // 监听样式事件，确保地图在样式加载完成后初始化
        map.on('styledata', () => {
          console.log('样式数据已加载');
        });

        // 地图加载完成时的处理
        map.on('load', () => {
          console.log('地图基础加载完成');
          
          // 设置地图实例
          setMapInstance(map);
          setIsMapLoaded(true);
          setLoading(false);
        });

        return map;
      } catch (err: any) {
        console.error('地图初始化错误:', err);
        setError(`地图初始化失败: ${err.message || '未知错误'}`);
        setLoading(false);
        return null;
      }
    };

    // 初始化地图
    const map = initMap();

    // 清理函数 - 组件卸载时删除地图
    return () => {
      if (map) {
        try {
          map.remove();
        } catch (err) {
          console.error('移除地图时发生错误:', err);
        }
      }
    };
  }, [containerId, initialCenter, initialZoom, showNavigationControl, showScaleControl, style, mapSourceType, mapInstance]);

  return { 
    mapInstance, 
    loading, 
    error, 
    isMapLoaded,
    currentMapSource
  };
}