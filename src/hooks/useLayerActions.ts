import { useMapStore } from '../stores/mapStore';
import { findLayerById } from '../utils/layerUtils';

export function useLayerActions() {
  const layers = useMapStore(s => s.layers);
  const setLayers = useMapStore(s => s.setLayers);

  function setLayerVisible(layerId: string, visible: boolean) {
    setLayers(layers.map(l => l.id === layerId ? { ...l, visible } : l));
  }

  function setLayerOpacity(layerId: string, opacity: number) {
    setLayers(layers.map(l => l.id === layerId ? { ...l, opacity } : l));
  }

  function getLayer(layerId: string) {
    return findLayerById(layers, layerId);
  }

  return { setLayerVisible, setLayerOpacity, getLayer };
} 