import React from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { LayerItem } from '../controls/LayerControl'; // 导入统一的LayerItem接口

interface LayersSidebarProps {
  onClose: () => void;
  layers: LayerItem[];
  onToggleLayer: (layerId: string, visible: boolean) => void;
}

/**
 * 图层侧边栏组件
 * 在右侧显示图层列表，可以控制图层的显示和隐藏
 */
const LayersSidebar: React.FC<LayersSidebarProps> = ({ 
  onClose, 
  layers,
  onToggleLayer
}) => {
  const sidebarStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '280px',
    height: '100%',
    backgroundColor: 'white',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyle: React.CSSProperties = {
    padding: '15px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold'
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: '15px',
    overflow: 'auto'
  };

  const layerItemStyle: React.CSSProperties = {
    padding: '12px 10px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const activeLayerStyle: React.CSSProperties = {
    ...layerItemStyle,
    backgroundColor: '#f9f9f9'
  };

  const layerNameStyle = (isVisible: boolean): React.CSSProperties => ({
    flex: 1,
    marginLeft: '10px',
    fontWeight: isVisible ? 'bold' : 'normal',
    color: isVisible ? '#1890ff' : '#333'
  });

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>图层</h3>
        <button style={closeButtonStyle} onClick={onClose} title="关闭">
          <X size={20} />
        </button>
      </div>
      <div style={contentStyle}>
        {layers.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#999' }}>
            暂无可用图层
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '15px', fontSize: '12px', color: '#666' }}>
              显示/隐藏图层 ({layers.filter(l => l.isVisible).length}/{layers.length})
            </div>
            {layers.map((layer) => (
              <div 
                key={layer.id} 
                style={layer.isVisible ? activeLayerStyle : layerItemStyle}
                onClick={() => {
                  layer.onToggle(!layer.isVisible);
                  onToggleLayer(layer.id, !layer.isVisible);
                }}
              >
                {layer.isVisible ? (
                  <Eye size={18} color="#1890ff" />
                ) : (
                  <EyeOff size={18} color="#999" />
                )}
                <div style={layerNameStyle(layer.isVisible)}>
                  {layer.name}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default LayersSidebar; 