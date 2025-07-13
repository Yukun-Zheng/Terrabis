import { LayerItem } from '../stores/mapStore';

export function findLayerById(layers: LayerItem[], id: string) {
  return layers.find(l => l.id === id);
} 