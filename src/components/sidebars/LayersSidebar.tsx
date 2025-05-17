import React, { useState } from 'react';
import { X, Eye, EyeOff, ChevronRight, BarChart, MapPin, Globe, Map } from 'lucide-react';
import { LayerItem } from '../controls/LayerControl'; // 导入统一的LayerItem接口
import { chinaCityHeatData, getShenzhenHeatData } from '../../data/heatmapData';
import { chinaFullHeatData } from '../../data/chinaFullHeatData';
import DataVisualization from '../visualizations/DataVisualization';
import { HeatPoint } from '../../data/heatmapData';
import OpacityControl from '../controls/OpacityControl';

interface LayersSidebarProps {
  onClose: () => void;
  layers: LayerItem[];
  onToggleLayer: (layerId: string, visible: boolean) => void;
  onOpacityChange?: (layerId: string, opacity: number) => void;
}

/**
 * 图层侧边栏组件
 * 在右侧显示图层列表，可以控制图层的显示和隐藏
 */
const LayersSidebar: React.FC<LayersSidebarProps> = ({ 
  onClose, 
  layers,
  onToggleLayer,
  onOpacityChange
}) => {
  // 当前选中的图层ID
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  // 图层数据映射
  const layerDataMap: Record<string, { data: HeatPoint[], maxValue: number }> = {
    'heatmap-china': { data: chinaCityHeatData, maxValue: 300 },
    'heatmap-shenzhen': { data: getShenzhenHeatData(200), maxValue: 100 },
    'heatmap-china-full': { data: chinaFullHeatData, maxValue: 300 }
  };
  
  // 获取当前选中图层的名称
  const getSelectedLayerName = () => {
    if (!selectedLayerId) return '';
    return layers.find(l => l.id === selectedLayerId)?.name || '';
  };

  // 获取图层图标
  const getLayerIcon = (layerId: string) => {
    if (layerId.includes('heatmap')) {
      return <BarChart size={18} color="#fb8c00" />;
    } else if (layerId.includes('china')) {
      return <Globe size={18} color="#1976d2" />;
    } else if (layerId.includes('guangdong')) {
      return <Map size={18} color="#43a047" />;
    } else if (layerId.includes('shenzhen')) {
      return <MapPin size={18} color="#e53935" />;
    }
    return <BarChart size={18} color="#1890ff" />;
  };

  const sidebarStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '450px',
    height: '100%',
    backgroundColor: 'white',
    boxShadow: '-2px 0 15px rgba(0,0,0,0.12)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderLeft: '1px solid #eaeaea',
    transition: 'width 0.3s ease'
  };

  const headerStyle: React.CSSProperties = {
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fcff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: '50%',
    transition: 'background-color 0.2s'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };
  
  const layerListStyle: React.CSSProperties = {
    padding: '15px',
    overflowY: 'auto',
    borderBottom: selectedLayerId ? '1px solid #eee' : 'none',
    maxHeight: selectedLayerId ? '40%' : '100%',
    transition: 'max-height 0.3s ease'
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
  
  const selectedLayerStyle: React.CSSProperties = {
    ...layerItemStyle,
    backgroundColor: '#e6f7ff',
    borderLeft: '3px solid #1890ff',
    padding: '12px 10px 12px 7px'
  };

  const layerNameStyle = (isVisible: boolean): React.CSSProperties => ({
    flex: 1,
    marginLeft: '10px',
    fontWeight: isVisible ? 'bold' : 'normal',
    color: isVisible ? '#1890ff' : '#333'
  });
  
  const dataVisContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '0 15px 15px'
  };
  
  const layerControlsStyle: React.CSSProperties = {
    padding: '10px 15px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #eee'
  };
  
  // 处理图层点击事件
  const handleLayerClick = (layerId: string) => {
    setSelectedLayerId(layerId === selectedLayerId ? null : layerId);
  };

  // 处理透明度变化
  const handleOpacityChange = (opacity: number) => {
    if (selectedLayerId && onOpacityChange) {
      onOpacityChange(selectedLayerId, opacity);
    }
  };

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          {selectedLayerId ? getSelectedLayerName() : '图层管理'}
        </h3>
        <button style={closeButtonStyle} onClick={onClose} title="关闭">
          <X size={20} />
        </button>
      </div>
      <div style={contentStyle}>
        <div style={layerListStyle}>
          {layers.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#999' }}>
              暂无可用图层
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '15px', fontSize: '12px', color: '#666' }}>
                显示/隐藏图层 ({layers.filter(l => l.isVisible).length}/{layers.length})
              </div>
              
              {/* 图层类型分组标签 - 热力图 */}
              {layers.some(layer => layer.id.includes('heatmap')) && (
                <div style={{ padding: '10px 5px 5px 5px', fontSize: '13px', color: '#666', fontWeight: 'bold' }}>
                  热力图图层
                </div>
              )}
              
              {/* 显示热力图图层 */}
              {layers.filter(layer => layer.id.includes('heatmap')).map((layer) => {
                // 判断使用哪种样式
                let itemStyle = layerItemStyle;
                if (layer.id === selectedLayerId) {
                  itemStyle = selectedLayerStyle;
                } else if (layer.isVisible) {
                  itemStyle = activeLayerStyle;
                }
                
                return (
                  <div 
                    key={layer.id} 
                    style={itemStyle}
                    // 判断是点击眼睛图标还是整行
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      // 如果点击的是整行而不是眼睛图标
                      if (!target.closest('.eye-icon')) {
                        handleLayerClick(layer.id);
                      }
                    }}
                  >
                    <div 
                      className="eye-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        layer.onToggle(!layer.isVisible);
                        onToggleLayer(layer.id, !layer.isVisible);
                      }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      {layer.isVisible ? (
                        <Eye size={18} color="#1890ff" />
                      ) : (
                        <EyeOff size={18} color="#999" />
                      )}
                    </div>
                    <div style={layerNameStyle(layer.isVisible)}>
                      {layer.name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {getLayerIcon(layer.id)}
                      <ChevronRight 
                        size={16} 
                        color="#999" 
                        style={{ 
                          transform: selectedLayerId === layer.id ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {/* 图层类型分组标签 - 行政区域 */}
              {layers.some(layer => layer.id.includes('geojson')) && (
                <div style={{ padding: '10px 5px 5px 5px', fontSize: '13px', color: '#666', fontWeight: 'bold' }}>
                  行政区域图层
                </div>
              )}
              
              {/* 显示行政区域图层 */}
              {layers.filter(layer => layer.id.includes('geojson')).map((layer) => {
                // 判断使用哪种样式
                let itemStyle = layerItemStyle;
                if (layer.id === selectedLayerId) {
                  itemStyle = selectedLayerStyle;
                } else if (layer.isVisible) {
                  itemStyle = activeLayerStyle;
                }
                
                return (
                  <div 
                    key={layer.id} 
                    style={itemStyle}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.closest('.eye-icon')) {
                        handleLayerClick(layer.id);
                      }
                    }}
                  >
                    <div 
                      className="eye-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        layer.onToggle(!layer.isVisible);
                        onToggleLayer(layer.id, !layer.isVisible);
                      }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      {layer.isVisible ? (
                        <Eye size={18} color="#1890ff" />
                      ) : (
                        <EyeOff size={18} color="#999" />
                      )}
                    </div>
                    <div style={layerNameStyle(layer.isVisible)}>
                      {layer.name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {getLayerIcon(layer.id)}
                      <ChevronRight 
                        size={16} 
                        color="#999" 
                        style={{ 
                          transform: selectedLayerId === layer.id ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
        
        {/* 图层控制区域 - 只有在选择图层时显示 */}
        {selectedLayerId && (
          <div style={layerControlsStyle}>
            <OpacityControl 
              value={layers.find(l => l.id === selectedLayerId)?.opacity || 0.5}
              onChange={handleOpacityChange}
              label="透明度"
            />
          </div>
        )}
        
        {/* 数据可视化区域 */}
        {selectedLayerId && layerDataMap[selectedLayerId] && (
          <div style={dataVisContainerStyle}>
            <DataVisualization 
              data={layerDataMap[selectedLayerId].data} 
              layerName={getSelectedLayerName()}
              maxValue={layerDataMap[selectedLayerId].maxValue}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersSidebar; 