import React, { useState } from 'react';
import { X, Eye, EyeOff, ChevronRight, BarChart, MapPin, Globe, Map, PieChart, Sliders } from 'lucide-react';
import { LayerType } from '../MapContainer'; // 导入正确的类型定义
import { chinaCityHeatData, getShenzhenHeatData } from '../../data/heatmapData';
import { chinaFullHeatData } from '../../data/chinaFullHeatData';
import DataVisualization from '../visualizations/DataVisualization';
import { HeatPoint } from '../../data/heatmapData';
import OpacityControl from '../controls/OpacityControl';
import { getChinaHexbinData, getGuangdongHexbinData, getShenzhenHexbinData } from '../../data/hexbinData';
import { getChinaProvinceChoroplethData, FeatureDataPoint } from '../../data/choroplethData';

// 定义我们自己的图层项接口，与MapContainer中的保持一致
interface LayerItem {
  id: string;               // 图层ID
  name: string;             // 图层名称
  type: string;             // 图层类型
  visible: boolean;         // 图层是否可见
  opacity: number;          // 图层不透明度
  source?: string;          // 数据源
  sourceLayer?: string;     // 源图层
  color?: string;           // 颜色
  strokeColor?: string;     // 描边颜色
  strokeWidth?: number;     // 描边宽度
  minZoom?: number;         // 最小缩放级别
  maxZoom?: number;         // 最大缩放级别
  group?: string;           // 图层组
  dataType?: 'population' | 'gdp' | 'urbanization' | 'health' | 'landuse'; // 数据类型
  region?: 'china' | 'guangdong' | 'shenzhen'; // 区域范围
  onToggle?: (visible: boolean) => void; // 切换回调
}

interface LayersSidebarProps {
  onClose: () => void;
  layers: LayerItem[];
  onToggleLayer: (layerId: string, visible: boolean) => void;
  onOpacityChange?: (layerId: string, opacity: number) => void;
  onLayerClick?: (layerId: string) => void; // 新增图层点击回调
}

// 在组件内添加以下新的组件

// 透明度设置面板组件
interface OpacitySettingsPanelProps {
  layers: LayerItem[];
  onOpacityChange: (layerId: string, opacity: number) => void;
}

const OpacitySettingsPanel: React.FC<OpacitySettingsPanelProps> = ({ layers, onOpacityChange }) => {
  // 只选择可见的图层显示透明度控制
  const visibleLayers = layers.filter(layer => layer.visible);
  
  if (visibleLayers.length === 0) {
    return <div style={{ padding: '15px', color: '#999', textAlign: 'center' }}>没有可见图层</div>;
  }
  
  return (
    <div style={{ padding: '10px' }}>
      {visibleLayers.map(layer => (
        <div key={layer.id} style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{layer.name}</span>
            <span style={{ fontSize: '12px', color: '#666' }}>{Math.round(layer.opacity * 100)}%</span>
          </div>
          <OpacityControl
            value={layer.opacity}
            onChange={(value) => onOpacityChange(layer.id, value)}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * 图层侧边栏组件
 */
const LayersSidebar: React.FC<LayersSidebarProps> = ({
  onClose,
  layers,
  onToggleLayer,
  onOpacityChange,
  onLayerClick
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<'layers' | 'data' | 'opacity'>('layers');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '基础图层': true,
    '行政区划': true,
    '分析图层': true,
    '专题图层': true
  });
  
  // 分组图层
  const layerGroups = groupLayersByType(layers);
  
  // 计算当前选择的图层的数据
  const selectedLayerData = getLayerData(selectedLayerId);
  
  // 切换分组展开/收起
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  // 选择图层点击处理
  const handleLayerSelect = (layerId: string) => {
    setSelectedLayerId(layerId);
    if (onLayerClick) {
      onLayerClick(layerId);
    }
  };
  
  // 菜单项样式
  const getMenuItemStyle = (menuItem: 'layers' | 'data' | 'opacity') => ({
    padding: '10px 15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    backgroundColor: selectedMenuItem === menuItem ? '#e6f7ff' : 'transparent',
    color: selectedMenuItem === menuItem ? '#1890ff' : '#666',
    borderLeft: selectedMenuItem === menuItem ? '3px solid #1890ff' : '3px solid transparent',
    fontSize: '14px',
    fontWeight: selectedMenuItem === menuItem ? 'bold' : 'normal',
    transition: 'all 0.3s'
  });
  
  // 侧边栏容器样式
  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '320px',
    height: '100%',
    backgroundColor: 'white',
    boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 9999
  };
  
  // 侧边栏头部样式
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#f9fcff'
  };
  
  // 图层列表容器样式
  const contentStyle: React.CSSProperties = {
    overflowY: 'auto',
    flex: 1
  };
  
  // 图层项样式
  const layerItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 15px',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transition: 'background-color 0.2s'
  };
  
  // 选中的图层项样式
  const selectedLayerStyle: React.CSSProperties = {
    ...layerItemStyle,
    backgroundColor: '#e6f7ff',
    borderLeft: '3px solid #1890ff'
  };
  
  // 可见图层项样式
  const activeLayerStyle: React.CSSProperties = {
    ...layerItemStyle,
    backgroundColor: '#f6f6f6'
  };
  
  // 图层名称样式
  const layerNameStyle = (visible: boolean): React.CSSProperties => ({
    flex: 1,
    marginLeft: '10px',
    color: visible ? '#333' : '#999',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  });
  
  // 图层组标题样式
  const groupTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer'
  };
  
  // 底部菜单栏样式
  const bottomMenuStyle: React.CSSProperties = {
    display: 'flex',
    borderTop: '1px solid #f0f0f0',
    backgroundColor: '#fff'
  };
  
  // 获取图层图标
  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'vector':
        return <Map size={16} color="#1890ff" />;
      case 'raster':
        return <Globe size={16} color="#52c41a" />;
      case 'hexbin':
        return <BarChart size={16} color="#722ed1" />;
      case 'choropleth':
        return <PieChart size={16} color="#fa8c16" />;
      case 'heatmap':
        return <BarChart size={16} color="#f5222d" />;
      case 'geojson':
        return <MapPin size={16} color="#eb2f96" />;
      default:
        return <Map size={16} color="#1890ff" />;
    }
  };
  
  // 分组图层
  function groupLayersByType(layers: LayerItem[]) {
    const groups: Record<string, LayerItem[]> = {};
    
    layers.forEach(layer => {
      const group = layer.group || '未分组';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(layer);
    });
    
    return groups;
  }
  
  // 获取图层数据
  function getLayerData(layerId: string | null): HeatPoint[] | FeatureDataPoint[] {
    if (!layerId) return [];
    
    // 根据图层ID获取对应的数据
    if (layerId.includes('heatmap-china')) {
      return chinaCityHeatData;
    } else if (layerId.includes('heatmap-shenzhen')) {
      return getShenzhenHeatData();
    } else if (layerId.includes('heatmap-china-full')) {
      return chinaFullHeatData;
    } else if (layerId.includes('hexbin-china')) {
      return getChinaHexbinData();
    } else if (layerId.includes('hexbin-guangdong')) {
      return getGuangdongHexbinData();
    } else if (layerId.includes('hexbin-shenzhen')) {
      return getShenzhenHexbinData();
    } else if (layerId.includes('choropleth-china')) {
      return getChinaProvinceChoroplethData();
    }
    
    return [];
  }
  
  // 渲染页面
  return (
    <div className="layers-sidebar">
      <div style={headerStyle}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>图层管理</h3>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
          }}
          onClick={onClose}
          title="关闭"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* 内容区域 */}
      <div style={contentStyle}>
        {/* 图层列表 */}
        {selectedMenuItem === 'layers' && (
          <>
            <div style={{ marginBottom: '15px', fontSize: '12px', color: '#666', padding: '10px 15px' }}>
              显示/隐藏图层 ({layers.filter(l => l.visible).length}/{layers.length})
            </div>
            
            {Object.entries(layerGroups).map(([groupName, groupLayers]) => (
              <div key={groupName}>
                <div 
                  style={groupTitleStyle}
                  onClick={() => toggleGroup(groupName)}
                >
                  <ChevronRight 
                    size={16} 
                    style={{ 
                      marginRight: '8px',
                      transform: expandedGroups[groupName] ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s' 
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{groupName}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#999' }}>
                    {groupLayers.filter(l => l.visible).length}/{groupLayers.length}
                  </span>
                </div>
                
                {expandedGroups[groupName] && groupLayers.map(layer => {
                  // 判断使用哪种样式
                  let itemStyle = layerItemStyle;
                  if (layer.id === selectedLayerId) {
                    itemStyle = selectedLayerStyle;
                  } else if (layer.visible) {
                    itemStyle = activeLayerStyle;
                  }
                  
                  return (
                    <div 
                      key={layer.id} 
                      style={itemStyle}
                      onClick={() => handleLayerSelect(layer.id)}
                    >
                      {getLayerIcon(layer.type)}
                      <div 
                        className="eye-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (layer.onToggle) {
                            layer.onToggle(!layer.visible);
                          }
                          onToggleLayer(layer.id, !layer.visible);
                        }}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        {layer.visible ? (
                          <Eye size={18} color="#1890ff" />
                        ) : (
                          <EyeOff size={18} color="#999" />
                        )}
                      </div>
                      <div style={layerNameStyle(layer.visible)}>
                        {layer.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
        
        {/* 数据视图 */}
        {selectedMenuItem === 'data' && selectedLayerId && (
          <div style={{ padding: '15px', overflowY: 'auto' }}>
            <DataVisualization 
              data={selectedLayerData} 
              layerName={layers.find(l => l.id === selectedLayerId)?.name || '未命名图层'}
            />
          </div>
        )}
        
        {/* 透明度设置 */}
        {selectedMenuItem === 'opacity' && onOpacityChange && (
          <OpacitySettingsPanel 
            layers={layers}
            onOpacityChange={onOpacityChange}
          />
        )}
      </div>
      
      {/* 底部菜单 */}
      <div style={bottomMenuStyle}>
        <div 
          style={getMenuItemStyle('layers')}
          onClick={() => setSelectedMenuItem('layers')}
        >
          <Map size={18} />
          图层
        </div>
        <div 
          style={getMenuItemStyle('data')}
          onClick={() => setSelectedMenuItem('data')}
        >
          <BarChart size={18} />
          数据
        </div>
        <div 
          style={getMenuItemStyle('opacity')}
          onClick={() => setSelectedMenuItem('opacity')}
        >
          <Sliders size={18} />
          透明度
        </div>
      </div>
    </div>
  );
};

export default LayersSidebar; 