import React from 'react';
import { SearchSidebar } from './SearchSidebar';
import DrawingSidebar from './DrawingSidebar';
import LayersSidebar from './LayersSidebar';
import { useMapStore } from '../../stores/mapStore';

const SidebarContainer: React.FC<{ mapRef: React.MutableRefObject<any> }> = ({ mapRef }) => {
  const sidebar = useMapStore(s => s.sidebar);
  const setSidebar = useMapStore(s => s.setSidebar);
  const layers = useMapStore(s => s.layers);
  const setLayers = useMapStore(s => s.setLayers);
  const setShowDataPanel = useMapStore(s => s.setShowDataPanel);
  const setActiveLayerId = useMapStore(s => s.setActiveLayerId);
  const setSelectedLayerName = useMapStore(s => s.setSelectedLayerName);
  const setLayerData = useMapStore(s => s.setLayerData);

  const handleClose = () => setSidebar({ isOpen: false, type: null });
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
    // setLayerData(layerDataMap[layerId] || []);
  };

  if (!sidebar.isOpen) return null;
  if (sidebar.type === 'search') {
    return <SearchSidebar onClose={handleClose} onLocationSelect={() => {}} />;
  }
  if (sidebar.type === 'draw') {
    return <DrawingSidebar onClose={handleClose} mapRef={mapRef} />;
  }
  if (sidebar.type === 'layers') {
    return (
      <LayersSidebar
        onClose={handleClose}
        layers={layers}
        onToggleLayer={handleLayerToggle}
        onOpacityChange={handleOpacityChange}
        onLayerClick={handleLayerClick}
      />
    );
  }
  return null;
};

export default SidebarContainer; 