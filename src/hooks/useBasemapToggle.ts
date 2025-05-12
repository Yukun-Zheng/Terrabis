import { useState, useCallback } from 'react';
import { Map } from 'mapbox-gl';
import { API_BASE_URL, TIANDITU_PROXY_URL, TIANDITU_API_KEY } from '../config/api-keys';

/**
 * 底图选项接口
 */
export interface BasemapOption {
  id: string;
  name: string;
  type: 'style' | 'sources';
  style?: any;
  sources?: string[];
  thumbnail?: string;
  category?: string;
  description?: string;
}

// 天地图层定义 - 完全按照官方示例格式
const TIANDITU_LAYERS = {
  // 矢量图层 (vec)
  vec: {
    base: `${TIANDITU_PROXY_URL}/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_API_KEY}`,
    label: `${TIANDITU_PROXY_URL}/cva_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_API_KEY}`
  },
  // 影像图层 (img)
  img: {
    base: `${TIANDITU_PROXY_URL}/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_API_KEY}`,
    label: `${TIANDITU_PROXY_URL}/cia_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_API_KEY}`
  },
  // 地形图层 (ter)
  ter: {
    base: `${TIANDITU_PROXY_URL}/ter_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_API_KEY}`,
    label: `${TIANDITU_PROXY_URL}/cta_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_API_KEY}`
  }
};

/**
 * 底图切换钩子
 */
export default function useBasemapToggle(mapInstance: Map | null) {
  const [currentBasemap, setCurrentBasemap] = useState<string>('vec'); // 默认矢量底图
  const [isBasemapLoading, setIsBasemapLoading] = useState<boolean>(false);

  // 添加天地图图层 - 完全按照官方示例
  const addTiandituLayers = useCallback((map: Map, type: 'vec' | 'img' | 'ter') => {
    try {
      console.log(`开始添加${type}图层...`);
      // 获取图层配置
      const layers = TIANDITU_LAYERS[type];
      
      // 检查源是否已存在，如果存在则删除
      const removeIfExists = (sourceId: string, layerId: string) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      };
      
      // 移除已存在的图层
      removeIfExists(`${type}-base`, `${type}-base-layer`);
      removeIfExists(`${type}-label`, `${type}-label-layer`);
      
      // 添加底图源和图层
      map.addSource(`${type}-base`, {
        type: 'raster',
        tiles: [layers.base],
        tileSize: 256
      });
      
      // 添加底图图层，确保添加在最底部
      const firstLayerId = map.getStyle().layers[0]?.id;
      map.addLayer({
        id: `${type}-base-layer`,
        type: 'raster',
        source: `${type}-base`,
        minzoom: 0,
        maxzoom: 18,
        paint: {
          'raster-opacity': 1
        }
      }, firstLayerId);
      
      // 添加标注源和图层
      map.addSource(`${type}-label`, {
        type: 'raster',
        tiles: [layers.label],
        tileSize: 256
      });
      
      // 添加标注图层，确保添加在最顶部
      map.addLayer({
        id: `${type}-label-layer`,
        type: 'raster',
        source: `${type}-label`,
        minzoom: 0,
        maxzoom: 18,
        paint: {
          'raster-opacity': 1
        }
      });
      
      console.log(`已成功添加${type}图层`);
      return true;
    } catch (error) {
      console.error(`添加${type}图层失败:`, error);
      return false;
    }
  }, []);
  
  // 清除现有底图图层
  const clearExistingBasemaps = useCallback((map: Map) => {
    try {
      const basemapTypes = ['vec', 'img', 'ter'];
      
      // 移除所有图层和源
      basemapTypes.forEach(type => {
        const removeIfExists = (sourceId: string, layerId: string) => {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        };
        
        removeIfExists(`${type}-base`, `${type}-base-layer`);
        removeIfExists(`${type}-label`, `${type}-label-layer`);
      });
      
      console.log('已清除现有底图图层');
      return true;
    } catch (error) {
      console.error('清除底图图层失败:', error);
      return false;
    }
  }, []);

  /**
   * 切换底图 - 添加天地图底图功能
   */
  const toggleBasemap = useCallback((basemapId: string) => {
    if (!mapInstance) {
      console.error('地图实例不存在，无法切换底图');
      return;
    }
    
    // 检查地图是否已加载
    if (!mapInstance.loaded()) {
      console.log('地图尚未加载完成，请稍后再试');
      return;
    }
    
    setIsBasemapLoading(true);
    console.log(`开始切换底图到: ${basemapId}`);

    try {
      // 只支持vec、img和ter三种底图类型
      if (!['vec', 'img', 'ter'].includes(basemapId)) {
        console.error(`不支持的底图类型: ${basemapId}`);
        setIsBasemapLoading(false);
        return;
      }
      
      // 如果已经是当前底图，则不执行切换
      if (basemapId === currentBasemap) {
        console.log(`已经是${basemapId}底图，无需切换`);
        setIsBasemapLoading(false);
        return;
      }
      
      // 清除现有底图
      const cleared = clearExistingBasemaps(mapInstance);
      if (!cleared) {
        console.error('清除现有底图失败，无法继续切换');
        setIsBasemapLoading(false);
        return;
      }
      
      // 添加新底图
      const added = addTiandituLayers(mapInstance, basemapId as 'vec' | 'img' | 'ter');
      if (!added) {
        console.error('添加新底图失败');
        setIsBasemapLoading(false);
        return;
      }
      
      // 更新当前底图状态
      setCurrentBasemap(basemapId);
      console.log(`底图已切换为: ${basemapId}`);
    } catch (error) {
      console.error('底图切换错误:', error);
    } finally {
      setIsBasemapLoading(false);
    }
  }, [mapInstance, currentBasemap, addTiandituLayers, clearExistingBasemaps]);

  return {
    currentBasemap,
    isBasemapLoading,
    toggleBasemap
  };
} 