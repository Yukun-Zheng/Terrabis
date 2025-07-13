import React from 'react';
import LayerStatsCard from './LayerStatsCard';
import { LayerItem } from '../MapContainer';

// 属性接口
interface LayerCardsProps {
  layers: LayerItem[];
  layerDataMap: Record<string, { data: any[], maxValue: number }>;
  onLayerClick: (layerId: string) => void;
}

/**
 * 图层卡片组件
 * 显示所有可见图层的统计卡片
 */
const LayerCards: React.FC<LayerCardsProps> = ({
  layers,
  layerDataMap,
  onLayerClick
}) => {
  // 获取可见图层
  const visibleLayers = layers.filter(layer => layer.visible);
  
  // 如果没有可见图层则不显示
  if (visibleLayers.length === 0) {
    return null;
  }
  
  // 样式定义
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '80px',
    left: '10px',
    zIndex: 890,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    maxHeight: 'calc(100vh - 160px)',
    overflowY: 'auto',
    padding: '5px',
    paddingRight: '10px'
  };
  
  return (
    <div style={containerStyle}>
      {visibleLayers.map(layer => (
        layerDataMap[layer.id] && (
          <LayerStatsCard
            key={layer.id}
            layerId={layer.id}
            layerName={layer.name}
            data={layerDataMap[layer.id].data}
            onClick={() => onLayerClick(layer.id)}
          />
        )
      ))}
    </div>
  );
};

export default LayerCards; 