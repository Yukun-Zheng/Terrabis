import React, { useState } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

/**
 * 图层项接口
 */
export interface LayerItem {
  id: string;
  name: string;
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
}

/**
 * 图层控件属性
 */
interface LayerControlProps {
  layers: LayerItem[];
  onToggleLayer?: (layerId: string, visible: boolean) => void;
}

/**
 * 图层控件组件
 */
const LayerControl: React.FC<LayerControlProps> = ({ layers, onToggleLayer }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 切换图层可见性
  const handleToggleLayer = (layerId: string, visible: boolean) => {
    if (onToggleLayer) {
      onToggleLayer(layerId, visible);
    }
  };

  return (
    <div
      className="layer-control"
      style={{
        position: 'absolute',
        bottom: '100px',  // 调整到底部控制栏上方
        right: '10px',
        zIndex: 1000,     // 增加z-index确保显示在最顶层
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}
    >
      {/* 图层面板 */}
      {isOpen && (
        <div
          style={{
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '10px',
            width: '250px',
            border: '1px solid #ddd'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>图层控制</span>
            <span style={{ fontSize: '12px', color: '#666' }}>{layers.filter(l => l.isVisible).length} / {layers.length} 显示</span>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {layers.map((layer) => (
              <div key={layer.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '8px',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: layer.isVisible ? '#f9f9f9' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => {
                layer.onToggle(!layer.isVisible);
                handleToggleLayer(layer.id, !layer.isVisible);
              }}
              >
                <div style={{ marginRight: '10px' }}>
                  {layer.isVisible ? (
                    <Eye size={18} color="#1890ff" />
                  ) : (
                    <EyeOff size={18} color="#999" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: layer.isVisible ? 'bold' : 'normal',
                    color: layer.isVisible ? '#1890ff' : '#333' 
                  }}>{layer.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div 
        className="layer-control-button"
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          border: '1px solid #ddd'
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="图层控制"
      >
        <Layers size={20} color={isOpen ? '#1890ff' : '#333'} />
      </div>
    </div>
  );
};

export default LayerControl; 