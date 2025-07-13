import { create } from 'zustand';

// LayerItem类型定义
export type LayerType = 'vector' | 'raster' | 'hexbin' | 'choropleth' | 'bubble' | 'heatmap' | 'geojson' | 'other';
export interface LayerItem {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  source?: string;
  sourceLayer?: string;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  minZoom?: number;
  maxZoom?: number;
  group?: string;
  dataType?: 'population' | 'gdp' | 'urbanization' | 'health' | 'landuse';
  region?: 'china' | 'guangdong' | 'shenzhen';
  onToggle?: (visible: boolean) => void;
  fillColor?: string;
}

interface MapState {
  mapLoaded: boolean;
  setMapLoaded: (v: boolean) => void;

  layers: LayerItem[];
  setLayers: (layers: LayerItem[]) => void;

  sidebar: { isOpen: boolean; type: 'search' | 'draw' | 'layers' | null };
  setSidebar: (sidebar: { isOpen: boolean; type: 'search' | 'draw' | 'layers' | null }) => void;

  showDataPanel: boolean;
  setShowDataPanel: (v: boolean) => void;

  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;

  selectedLayerName: string;
  setSelectedLayerName: (name: string) => void;

  layerData: any[];
  setLayerData: (data: any[]) => void;

  chartOverlays: any[];
  setChartOverlays: (overlays: any[]) => void;

  geoJsonData: { [key: string]: any };
  setGeoJsonData: (data: { [key: string]: any }) => void;
  geoJsonLoading: boolean;
  setGeoJsonLoading: (loading: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  mapLoaded: false,
  setMapLoaded: (v) => set({ mapLoaded: v }),

  layers: [],
  setLayers: (layers) => set({ layers }),

  sidebar: { isOpen: false, type: null },
  setSidebar: (sidebar) => set({ sidebar }),

  showDataPanel: false,
  setShowDataPanel: (v) => set({ showDataPanel: v }),

  activeLayerId: null,
  setActiveLayerId: (id) => set({ activeLayerId: id }),

  selectedLayerName: '',
  setSelectedLayerName: (name) => set({ selectedLayerName: name }),

  layerData: [],
  setLayerData: (data) => set({ layerData: data }),

  chartOverlays: [],
  setChartOverlays: (overlays) => set({ chartOverlays: overlays }),

  geoJsonData: {},
  setGeoJsonData: (data) => set({ geoJsonData: data }),
  geoJsonLoading: false,
  setGeoJsonLoading: (loading) => set({ geoJsonLoading: loading }),
})); 