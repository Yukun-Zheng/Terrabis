import React from 'react';
import LayerDataPanel from '../visualizations/LayerDataPanel';
import { useMapStore } from '../../stores/mapStore';

const DataPanelManager: React.FC = () => {
  const showDataPanel = useMapStore(s => s.showDataPanel);
  const activeLayerId = useMapStore(s => s.activeLayerId);
  const selectedLayerName = useMapStore(s => s.selectedLayerName);
  const layerData = useMapStore(s => s.layerData);
  const setShowDataPanel = useMapStore(s => s.setShowDataPanel);

  if (!showDataPanel || !activeLayerId) return null;
  return (
    <LayerDataPanel
      layerId={activeLayerId}
      layerName={selectedLayerName}
      data={layerData}
      onClose={() => setShowDataPanel(false)}
    />
  );
};

export default DataPanelManager; 