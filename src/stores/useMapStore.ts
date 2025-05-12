import { create } from 'zustand';
import { Map } from 'mapbox-gl';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

/**
 * 图层样式接口
 */
export interface LayerStyle {
  id: string;
  name: string;
  style?: any;
  visible?: boolean;
  opacity?: number;
  group?: string;
  imgSrc?: string;
  source?: string;
  sourceLayer?: string;
  status?: number;
  remark?: string;
  popupFields?: string[];
}

/**
 * 地图图层接口
 */
export interface SimpleMapLayer {
  id: string;
  type: string;
  source: string;
  sourceLayer?: string;
  paint?: Record<string, any>;
  layout?: Record<string, any>;
  minzoom?: number;
  maxzoom?: number;
  filter?: any[];
  metadata?: any;
}

/**
 * GeoJSON源规格接口
 */
export interface SimpleGeoJSONSourceSpec {
  id: string;
  data: FeatureCollection | Feature | Geometry | string;
  type: 'geojson';
  cluster?: boolean;
  clusterMaxZoom?: number;
  clusterRadius?: number;
  generateId?: boolean;
  maxzoom?: number;
  tolerance?: number;
  buffer?: number;
  lineMetrics?: boolean;
  promoteId?: string;
}

/**
 * 地图状态接口
 */
interface MapState {
  // 地图实例
  mapInstance: Map | null;
  mapLoaded: boolean;
  setMapInstance: (map: Map | null) => void;
  setMapLoaded: (loaded: boolean) => void;
  
  // 图层状态
  mapLayers: SimpleMapLayer[];
  addMapLayer: (layer: SimpleMapLayer) => void;
  removeMapLayer: (id: string) => void;
  updateMapLayer: (id: string, layer: Partial<SimpleMapLayer>) => void;
  getMapLayer: (id: string) => SimpleMapLayer | undefined;
  toggleLayerVisibility: (id: string) => void;
  
  // 用户绘制的要素状态
  drawnFeatures: Feature[];
  addDrawnFeature: (feature: Feature) => void;
  removeDrawnFeature: (id: string) => void;
  clearAllDrawnFeatures: () => void;

  // ROI状态（感兴趣区域）
  activeRoiId: string | null;
  setActiveRoiId: (id: string | null) => void;
  
  // 底图状态
  activeBasemapId: string;
  setActiveBasemapId: (id: string) => void;
  
  // 选择状态
  highlightedFeature: Feature | null;
  selectedFeature: Feature | null;
  setHighlightedFeature: (feature: Feature | null) => void;
  setSelectedFeature: (feature: Feature | null) => void;
  
  // 其他状态
  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;
  showLabels: boolean;
  toggleLabels: () => void;
  
  // 重置状态
  reset: () => void;
}

/**
 * 使用Zustand创建地图状态store
 */
const useMapStore = create<MapState>((set, get) => ({
  // 地图实例
  mapInstance: null,
  mapLoaded: false,
  setMapInstance: (map) => set({ mapInstance: map }),
  setMapLoaded: (loaded) => set({ mapLoaded: loaded }),
  
  // 图层状态
  mapLayers: [],
  addMapLayer: (layer) => set((state) => ({ 
    mapLayers: [...state.mapLayers, layer] 
  })),
  removeMapLayer: (id) => set((state) => ({ 
    mapLayers: state.mapLayers.filter(layer => layer.id !== id) 
  })),
  updateMapLayer: (id, updates) => set((state) => ({ 
    mapLayers: state.mapLayers.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ) 
  })),
  getMapLayer: (id) => get().mapLayers.find(layer => layer.id === id),
  toggleLayerVisibility: (id) => {
    const map = get().mapInstance;
    if (!map) return;
    
    const layer = get().getMapLayer(id);
    if (!layer) return;
    
    const isVisible = map.getLayoutProperty(id, 'visibility') !== 'none';
    map.setLayoutProperty(id, 'visibility', isVisible ? 'none' : 'visible');
  },
  
  // 用户绘制的要素状态
  drawnFeatures: [],
  addDrawnFeature: (feature) => set((state) => ({ 
    drawnFeatures: [...state.drawnFeatures, feature] 
  })),
  removeDrawnFeature: (id) => set((state) => ({ 
    drawnFeatures: state.drawnFeatures.filter(f => f.id !== id) 
  })),
  clearAllDrawnFeatures: () => set({ drawnFeatures: [] }),
  
  // ROI状态
  activeRoiId: null,
  setActiveRoiId: (id) => set({ activeRoiId: id }),
  
  // 底图状态
  activeBasemapId: 'vec',
  setActiveBasemapId: (id) => set({ activeBasemapId: id }),
  
  // 选择状态
  highlightedFeature: null,
  selectedFeature: null,
  setHighlightedFeature: (feature) => set({ highlightedFeature: feature }),
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
  
  // 其他状态
  isDrawing: false,
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  showLabels: true,
  toggleLabels: () => {
    const map = get().mapInstance;
    if (!map) return;
    
    const showLabels = !get().showLabels;
    
    // 查找所有标注图层并切换可见性
    const style = map.getStyle();
    style.layers.forEach((layer: any) => {
      if (layer.id && (layer.id.includes('CVA') || layer.id.includes('CIA') || layer.id.includes('CTA'))) {
        map.setLayoutProperty(layer.id, 'visibility', showLabels ? 'visible' : 'none');
      }
    });
    
    set({ showLabels });
  },
  
  // 重置状态
  reset: () => set({
    mapLayers: [],
    drawnFeatures: [],
    activeRoiId: null,
    highlightedFeature: null,
    selectedFeature: null,
    isDrawing: false
  })
}));

export default useMapStore; 