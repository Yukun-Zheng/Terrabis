import React, { useRef } from 'react';
import MapInstance from './map/MapInstance';
import LayerManager from './layers/LayerManager';
import DataPanelManager from './panels/DataPanelManager';
import ChartOverlayManager from './charts/ChartOverlayManager';
import SidebarContainer from './sidebars/SidebarContainer';
import LocationControl from './controls/LocationControl';
import { LayerItem } from '../stores/mapStore';
import { chinaCityHeatData, getShenzhenHeatData } from '../data/heatmapData';
import { getChinaHexbinData, getGuangdongHexbinData, getShenzhenHexbinData } from '../data/hexbinData';
import { getChinaProvinceChoroplethData } from '../data/choroplethData';
import { useMapStore } from '../stores/mapStore';
import { useLayerDataMap } from '../hooks/useLayerDataMap';
import { useGeoJsonLoader } from '../hooks/useGeoJsonLoader';
import { BottomControlBar } from './controls/BottomControlBar';
import GeoJsonLayer from './layers/GeoJsonLayer';

/**
 * 地图容器组件属性接口
 */
interface MapContainerProps {
  hideDefaultControls?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

// 定义图层类型
export type LayerType = 'vector' | 'raster' | 'hexbin' | 'choropleth' | 'bubble' | 'heatmap' | 'geojson' | 'other';

// 工厂函数：初始化图层
function initLayers(): LayerItem[] {
  return [
    {
      id: 'tianditu-vec-basic', name: '矢量底图', type: 'vector', visible: true, opacity: 1, group: '基础图层'
    },
    { id: 'heatmap-china', name: '中国城市热力图', type: 'heatmap', visible: false, opacity: 0.7, dataType: 'population', region: 'china', group: '分析图层' },
    { id: 'heatmap-shenzhen', name: '深圳热力图', type: 'heatmap', visible: false, opacity: 0.7, dataType: 'population', region: 'shenzhen', group: '分析图层' },
    { id: 'heatmap-china-full', name: '中国城市热力图(完整版)', type: 'heatmap', visible: false, opacity: 0.7, dataType: 'population', region: 'china', group: '分析图层' },
    { id: 'hexbin-china', name: '中国蜂窝图', type: 'hexbin', visible: false, opacity: 0.7, dataType: 'population', region: 'china', group: '分析图层' },
    { id: 'hexbin-guangdong', name: '广东省蜂窝图', type: 'hexbin', visible: false, opacity: 0.7, dataType: 'population', region: 'guangdong', group: '分析图层' },
    { id: 'hexbin-shenzhen', name: '深圳市蜂窝图', type: 'hexbin', visible: false, opacity: 0.7, dataType: 'population', region: 'shenzhen', group: '分析图层' },
    { id: 'choropleth-china', name: '中国省级分级设色图', type: 'choropleth', visible: false, opacity: 0.7, dataType: 'population', region: 'china', group: '专题图层' },
    { id: 'choropleth-timeseries', name: '时间序列分级设色图', type: 'choropleth', visible: false, opacity: 0.7, dataType: 'population', region: 'china', group: '专题图层' },
    { id: 'geojson-china', name: '中国省级行政区', type: 'geojson', visible: false, opacity: 0.7, color: '#003366', fillColor: 'rgba(51, 136, 255, 0.5)', dataType: 'population', region: 'china', group: '行政区划' },
    { id: 'geojson-guangdong', name: '广东省行政边界', type: 'geojson', visible: false, opacity: 0.7, color: '#003366', fillColor: 'rgba(51, 136, 255, 0.5)', dataType: 'population', region: 'guangdong', group: '行政区划' },
    { id: 'geojson-shenzhen', name: '深圳市行政边界', type: 'geojson', visible: false, opacity: 0.7, color: '#003366', fillColor: 'rgba(51, 136, 255, 0.5)', dataType: 'population', region: 'shenzhen', group: '行政区划' }
  ];
}

// 工厂函数：初始化图层数据映射
function initLayerDataMap() {
  return {
    'heatmap-china': chinaCityHeatData,
    'heatmap-shenzhen': getShenzhenHeatData(200),
    'heatmap-china-full': chinaCityHeatData,
    'hexbin-china': getChinaHexbinData(300),
    'hexbin-guangdong': getGuangdongHexbinData(200),
    'hexbin-shenzhen': getShenzhenHexbinData(250),
    'choropleth-china': getChinaProvinceChoroplethData(),
    // 其他图层可继续补充
  };
}

const MapContainer: React.FC = () => {
  const mapRef = useRef<any>(null);
  // 全局状态
  const mapLoaded = useMapStore(s => s.mapLoaded);
  const setMapLoaded = useMapStore(s => s.setMapLoaded);
  const sidebar = useMapStore(s => s.sidebar);
  const setSidebar = useMapStore(s => s.setSidebar);
  const layers = useMapStore(s => s.layers);
  const setLayers = useMapStore(s => s.setLayers);
  const showDataPanel = useMapStore(s => s.showDataPanel);
  const setShowDataPanel = useMapStore(s => s.setShowDataPanel);
  const activeLayerId = useMapStore(s => s.activeLayerId);
  const setActiveLayerId = useMapStore(s => s.setActiveLayerId);
  const selectedLayerName = useMapStore(s => s.selectedLayerName);
  const setSelectedLayerName = useMapStore(s => s.setSelectedLayerName);
  const layerData = useMapStore(s => s.layerData);
  const setLayerData = useMapStore(s => s.setLayerData);
  const chartOverlays = useMapStore(s => s.chartOverlays);
  const setChartOverlays = useMapStore(s => s.setChartOverlays);
  const geoJsonData = useMapStore(s => s.geoJsonData);

  // 集成全局数据hooks
  const layerDataMap = useLayerDataMap();
  useGeoJsonLoader();

  // 初始化（仅首次）
  React.useEffect(() => {
    setLayers(initLayers());
  }, [setLayers]);

  // 事件回调
  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setLayers(layers.map(layer => layer.id === layerId ? { ...layer, visible } : layer));
  };
  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayers(layers.map(layer => layer.id === layerId ? { ...layer, opacity } : layer));
  };
  const handleLayerClick = (layerId: string) => {
    setActiveLayerId(layerId);
    setShowDataPanel(true);
    setSelectedLayerName(layers.find(l => l.id === layerId)?.name || '');
    setLayerData(layerDataMap[layerId] || []);
  };
  const handleDataPanelClose = () => setShowDataPanel(false);
  const handleSidebarToggle = (type: 'search' | 'draw' | 'layers') => {
    setSidebar(sidebar.isOpen && sidebar.type === type ? { isOpen: false, type: null } : { isOpen: true, type });
  };
  const handleCloseSidebar = () => setSidebar({ isOpen: false, type: null });
  const handleLocationSelect = (location: any) => {/* 省略，交给SidebarContainer内部处理 */};
  const handleChartOverlayClose = (index: number) => {
    setChartOverlays(chartOverlays.filter((_, i) => i !== index));
  };

  const toolbarItems: { id: 'search' | 'draw' | 'layers'; name: string }[] = [
    { id: 'search', name: '搜索' },
    { id: 'draw', name: '绘制' },
    { id: 'layers', name: '图层' }
  ];

  return (
    <div className="map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapInstance
        ref={mapRef}
        onMapLoaded={() => setMapLoaded(true)}
      />
      {/* 自动渲染所有可见的GeoJSON图层 */}
      {mapLoaded && layers.filter(l => l.type === 'geojson' && l.visible).map(layer => {
        const region = layer.region as keyof typeof geoJsonData;
        const data = geoJsonData && region && geoJsonData[region] ? geoJsonData[region] : undefined;
        return (
          <GeoJsonLayer
            key={layer.id}
            map={mapRef.current?.getMap?.()}
            data={data}
            visible={layer.visible}
            opacity={layer.opacity}
            color={layer.color}
            fillColor={layer.fillColor}
          />
        );
      })}
      <LocationControl mapLoaded={mapLoaded} tiandituMapRef={mapRef} />
      <SidebarContainer mapRef={mapRef} />
      {/* <LayerManager />  // 已移除，避免重复渲染 */}
      <DataPanelManager />
      <ChartOverlayManager map={mapRef.current?.getMap?.()} />
      {mapLoaded && (
        <BottomControlBar
          tools={toolbarItems}
          activeTool={sidebar.type}
          onToolSelect={type => setSidebar({ isOpen: true, type })}
        />
      )}
    </div>
  );
};

export default MapContainer; 