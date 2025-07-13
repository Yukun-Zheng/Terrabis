import { MutableRefObject } from 'react';
import { LayerItem, LayerType } from '../stores/mapStore';

// 扩展LayerItem接口以包含data属性
export interface ExtendedLayerItem extends LayerItem {
  data?: any;
}

// 地图API接口 - 提供核心地图功能
export interface MapAPI {
  // 地图控制
  getMap(): any;
  setCenter(center: [number, number]): void;
  setZoom(zoom: number): void;
  switchBasemap(type: BasemapType): boolean;
  getCurrentBasemap(): BasemapType;
  fitBounds(bounds: [[number, number], [number, number]]): void;
  
  // 图层管理
  addLayer(layer: ExtendedLayerItem): string;
  removeLayer(layerId: string): boolean;
  toggleLayerVisibility(layerId: string, visible: boolean): boolean;
  setLayerOpacity(layerId: string, opacity: number): boolean;
  
  // 数据加载
  loadGeoJson(url: string): Promise<any>;
  loadMultipleGeoJson(urls: string[]): Promise<any[]>;
  
  // 事件订阅
  on(event: MapEventType, callback: (...args: any[]) => void): void;
  off(event: MapEventType, callback: (...args: any[]) => void): void;
}

// 底图类型
export type BasemapType = 'vec' | 'img' | 'ter';

// 地图事件类型
export type MapEventType = 'load' | 'click' | 'move' | 'moveend' | 'zoom' | 'rotate' | 'basemapchange' | 'layeradd' | 'layerremove';

// 声明天地图API全局变量
declare global {
  interface Window {
    T: any;
  }
}

// 地图API实现类 - 封装地图实例
export class TiandituMapAPI implements MapAPI {
  private mapRef: MutableRefObject<any>;

  constructor(mapRef: MutableRefObject<any>) {
    this.mapRef = mapRef;
  }

  // 获取原始地图实例
  getMap(): any {
    return this.mapRef.current?.getMap?.() || null;
  }

  // 设置地图中心点
  setCenter(center: [number, number]): void {
    const map = this.getMap();
    if (map && window.T) {
      map.panTo(new window.T.LngLat(center[0], center[1]));
    }
  }

  // 设置缩放级别
  setZoom(zoom: number): void {
    const map = this.getMap();
    if (map) {
      map.setZoom(zoom);
    }
  }

  // 切换底图类型
  switchBasemap(type: BasemapType): boolean {
    if (this.mapRef.current?.switchBasemap) {
      return this.mapRef.current.switchBasemap(type);
    }
    return false;
  }

  // 获取当前底图类型
  getCurrentBasemap(): BasemapType {
    if (this.mapRef.current?.getCurrentBasemap) {
      return this.mapRef.current.getCurrentBasemap();
    }
    return 'vec'; // 默认返回矢量图
  }

  // 调整地图视图范围
  fitBounds(bounds: [[number, number], [number, number]]): void {
    const map = this.getMap();
    if (map && window.T) {
      const tbounds = new window.T.LngLatBounds(
        new window.T.LngLat(bounds[0][0], bounds[0][1]),
        new window.T.LngLat(bounds[1][0], bounds[1][1])
      );
      map.fitBounds(tbounds);
    }
  }

  // 添加图层
  addLayer(layer: ExtendedLayerItem): string {
    const map = this.getMap();
    if (!map) return '';
    
    // 根据图层类型创建不同的图层
    try {
      if (layer.type === 'geojson' && layer.data) {
        // 检查天地图API是否加载
        if (!window.T) {
          console.error('天地图API未加载');
          return '';
        }
        
        // 创建GeoJSON图层
        const geoJsonLayer = new window.T.GeoJSON({
          geometries: layer.data,
          isMultiPolygon: true
        });
        
        // 设置样式
        if (layer.fillColor || layer.color) {
          const style: Record<string, any> = {};
          if (layer.color) style['color'] = layer.color;
          if (layer.fillColor) style['fillColor'] = layer.fillColor;
          if (layer.opacity) style['opacity'] = layer.opacity;
          geoJsonLayer.setStyle(style);
        }
        
        map.addLayer(geoJsonLayer);
        return layer.id;
      }
      
      // 处理其他类型图层...
      console.warn('未实现的图层类型:', layer.type);
      return '';
    } catch (err) {
      console.error('添加图层失败:', err);
      return '';
    }
  }

  // 移除图层
  removeLayer(layerId: string): boolean {
    const map = this.getMap();
    if (!map) return false;
    
    try {
      const layer = map.getLayer(layerId);
      if (layer) {
        map.removeLayer(layer);
        return true;
      }
      return false;
    } catch (err) {
      console.error('移除图层失败:', err);
      return false;
    }
  }

  // 切换图层可见性
  toggleLayerVisibility(layerId: string, visible: boolean): boolean {
    const map = this.getMap();
    if (!map) return false;
    
    try {
      const layer = map.getLayer(layerId);
      if (layer) {
        if (visible) {
          layer.show();
        } else {
          layer.hide();
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('切换图层可见性失败:', err);
      return false;
    }
  }

  // 设置图层透明度
  setLayerOpacity(layerId: string, opacity: number): boolean {
    const map = this.getMap();
    if (!map) return false;
    
    try {
      const layer = map.getLayer(layerId);
      if (layer && typeof layer.setOpacity === 'function') {
        layer.setOpacity(opacity);
        return true;
      }
      return false;
    } catch (err) {
      console.error('设置图层透明度失败:', err);
      return false;
    }
  }

  // 加载GeoJSON数据
  async loadGeoJson(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`加载GeoJSON失败: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('加载GeoJSON错误:', error);
      return null;
    }
  }

  // 加载多个GeoJSON数据
  async loadMultipleGeoJson(urls: string[]): Promise<any[]> {
    try {
      const promises = urls.map(url => this.loadGeoJson(url));
      return await Promise.all(promises);
    } catch (error) {
      console.error('加载多个GeoJSON文件错误:', error);
      return [];
    }
  }

  // 注册事件监听
  on(event: MapEventType, callback: (...args: any[]) => void): void {
    const map = this.getMap();
    if (map && typeof map.addEventListener === 'function') {
      // 转换事件名称以匹配天地图API
      const eventMap: Record<MapEventType, string> = {
        'load': 'load',
        'click': 'click',
        'move': 'moving',
        'moveend': 'moveend',
        'zoom': 'zoomend',
        'rotate': 'rotate',
        'basemapchange': 'maptypechange',
        'layeradd': 'layeradd',
        'layerremove': 'layerremove'
      };
      
      const tiandituEvent = eventMap[event] || event;
      map.addEventListener(tiandituEvent, callback);
    }
  }

  // 移除事件监听
  off(event: MapEventType, callback: (...args: any[]) => void): void {
    const map = this.getMap();
    if (map && typeof map.removeEventListener === 'function') {
      // 转换事件名称以匹配天地图API
      const eventMap: Record<MapEventType, string> = {
        'load': 'load',
        'click': 'click',
        'move': 'moving',
        'moveend': 'moveend',
        'zoom': 'zoomend',
        'rotate': 'rotate',
        'basemapchange': 'maptypechange',
        'layeradd': 'layeradd',
        'layerremove': 'layerremove'
      };
      
      const tiandituEvent = eventMap[event] || event;
      map.removeEventListener(tiandituEvent, callback);
    }
  }
}

// 创建地图API实例的工厂函数
export function createMapAPI(mapRef: MutableRefObject<any>): MapAPI {
  return new TiandituMapAPI(mapRef);
}

// 导出Hooks接口
export { useGeoJsonLoader } from '../hooks/useGeoJsonLoader';
export { useLayerDataMap } from '../hooks/useLayerDataMap'; 