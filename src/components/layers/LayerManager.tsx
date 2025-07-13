import React from 'react';
import LayersSidebar from '../sidebars/LayersSidebar';
import { useMapStore } from '../../stores/mapStore';
import { useLayerActions } from '../../hooks/useLayerActions';

const LayerManager: React.FC = () => {
  const layers = useMapStore(s => s.layers);
  const setSidebar = useMapStore(s => s.setSidebar);
  const setShowDataPanel = useMapStore(s => s.setShowDataPanel);
  const setActiveLayerId = useMapStore(s => s.setActiveLayerId);
  const setSelectedLayerName = useMapStore(s => s.setSelectedLayerName);
  const setLayerData = useMapStore(s => s.setLayerData);
  const { setLayerVisible, setLayerOpacity, getLayer } = useLayerActions();

  // 图层数据映射（如有需要可全局管理）
  // const layerDataMap = ...

  const handleToggleLayer = (layerId: string, visible: boolean) => {
    setLayerVisible(layerId, visible);
  };
  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayerOpacity(layerId, opacity);
  };
  const handleLayerClick = (layerId: string) => {
    setActiveLayerId(layerId);
    setShowDataPanel(true);
    setSelectedLayerName(getLayer(layerId)?.name || '');
    // setLayerData(layerDataMap[layerId] || []);
  };
  const handleClose = () => setSidebar({ isOpen: false, type: null });

  return (
    <div id="layers-sidebar-container" style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      width: '320px', 
      height: '100%', 
      zIndex: 99999,
      pointerEvents: 'auto',
      visibility: 'visible'
    }}>
      <LayersSidebar
        onClose={handleClose}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        onOpacityChange={handleOpacityChange}
        onLayerClick={handleLayerClick}
      />
    </div>
  );
};

export default LayerManager; 