import React, { useState, useEffect, useRef } from 'react';
import { X, Square, Circle, Hexagon, Trash2 } from 'lucide-react';

/**
 * 侧边栏样式
 */
const sidebarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '300px',
  height: '100%',
  backgroundColor: 'white',
  boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  transition: 'transform 0.3s ease',
  overflow: 'auto'
};

/**
 * 标题区域样式
 */
const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  borderBottom: '1px solid #e0e0e0'
};

/**
 * 关闭按钮样式
 */
const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

/**
 * 工具列表样式
 */
const toolListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '16px'
};

/**
 * 工具分组样式
 */
const toolGroupStyle: React.CSSProperties = {
  marginBottom: '20px'
};

/**
 * 工具分组标题样式
 */
const toolGroupTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '10px',
  color: '#333'
};

/**
 * 工具按钮容器样式
 */
const toolButtonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap'
};

/**
 * 工具按钮样式
 */
const toolButtonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '5px',
  padding: '10px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#e0e0e0',
  borderRadius: '4px',
  background: 'white',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  width: '80px'
};

/**
 * 激活的工具按钮样式
 */
const activeToolButtonStyle: React.CSSProperties = {
  ...toolButtonStyle,
  background: '#f0f0f0',
  borderColor: '#3388ff'
};

/**
 * 工具图标容器样式
 */
const toolIconContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px'
};

/**
 * 工具名称样式
 */
const toolNameStyle: React.CSSProperties = {
  fontSize: '12px',
  textAlign: 'center'
};

/**
 * 分析结果样式
 */
const analysisResultsStyle: React.CSSProperties = {
  padding: '16px',
  borderTop: '1px solid #e0e0e0'
};

// ROI数据接口
export interface RoiData {
  area?: number;
  perimeter?: number;
  points?: number[][];
  type?: string;
}

// 组件属性
interface RoiSidebarProps {
  onClose: () => void;
  onToolSelect: (toolType: string) => void;
  onClear: () => void;
  roiData?: RoiData;
  activeTool?: string | null;
  mapRef?: React.RefObject<any>;
}

/**
 * 区域感兴趣(ROI)侧边栏组件
 */
export const RoiSidebar: React.FC<RoiSidebarProps> = ({
  onClose,
  onToolSelect,
  onClear,
  roiData,
  activeTool,
  mapRef
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'data'>('draw');
  const [drawTools, setDrawTools] = useState<Array<{id: string, name: string, icon: string}>>([
    { id: 'rectangle', name: '矩形', icon: '□' },
    { id: 'circle', name: '圆形', icon: '○' },
    { id: 'polygon', name: '多边形', icon: '△' }
  ]);
  
  // 绘图工具的引用
  const rectangleToolRef = useRef<any>(null);
  const circleToolRef = useRef<any>(null);
  const polygonToolRef = useRef<any>(null);
  const currentToolRef = useRef<any>(null);
  
  // 初始化天地图ROI工具
  useEffect(() => {
    // 确保天地图API和地图实例都已加载
    if (!window.T || !mapRef?.current) return;
    
    try {
      const map = mapRef.current.getMap();
      if (!map) return;
      
      // 工具共用的样式配置
      const toolConfig = {
        showLabel: true,
        color: "#1890ff", 
        weight: 2, 
        opacity: 0.8, 
        fillColor: "#1890ff", 
        fillOpacity: 0.3
      };
      
      // 创建各种绘图工具
      rectangleToolRef.current = new window.T.RectangleTool(map, toolConfig);
      circleToolRef.current = new window.T.CircleTool(map, toolConfig);
      polygonToolRef.current = new window.T.PolygonTool(map, toolConfig);
      
      // 添加事件监听器 - 矩形工具
      rectangleToolRef.current.on('draw', (e: any) => {
        if (!e.overlay) return;
        
        // 获取绘制的矩形边界
        const bounds = e.overlay.getBounds();
        if (!bounds) return;
        
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        
        // 矩形四角坐标
        const points = [
          [sw.lng, sw.lat],
          [ne.lng, sw.lat],
          [ne.lng, ne.lat],
          [sw.lng, ne.lat],
          [sw.lng, sw.lat]
        ];
        
        // 计算矩形面积和周长
        const width = window.T.Tool.getDistance(
          new window.T.LngLat(sw.lng, sw.lat),
          new window.T.LngLat(ne.lng, sw.lat)
        );
        const height = window.T.Tool.getDistance(
          new window.T.LngLat(sw.lng, sw.lat),
          new window.T.LngLat(sw.lng, ne.lat)
        );
        
        const area = width * height;
        const perimeter = 2 * (width + height);
        
        // 更新ROI数据 - 触发完成事件
        if (onToolSelect) {
          onToolSelect('completed');
        }
      });
      
      // 添加事件监听器 - 圆形工具
      circleToolRef.current.on('draw', (e: any) => {
        if (!e.overlay) return;
        
        // 更新ROI数据 - 触发完成事件
        if (onToolSelect) {
          onToolSelect('completed');
        }
      });
      
      // 添加事件监听器 - 多边形工具
      polygonToolRef.current.on('draw', (e: any) => {
        if (!e.overlay) return;
        
        // 更新ROI数据 - 触发完成事件
        if (onToolSelect) {
          onToolSelect('completed');
        }
      });
      
      return () => {
        // 清理函数
        closeAllTools();
      };
    } catch (err) {
      console.error('初始化绘图工具失败:', err);
    }
  }, [mapRef, onToolSelect]);
  
  // 关闭所有绘图工具
  const closeAllTools = () => {
    if (rectangleToolRef.current) rectangleToolRef.current.close();
    if (circleToolRef.current) circleToolRef.current.close();
    if (polygonToolRef.current) polygonToolRef.current.close();
    currentToolRef.current = null;
  };
  
  // 处理工具选择
  const handleToolSelect = (toolId: string) => {
    // 首先关闭所有工具
    closeAllTools();
    
    try {
      // 激活选择的工具
      switch (toolId) {
        case 'rectangle':
          if (rectangleToolRef.current) {
            rectangleToolRef.current.open();
            currentToolRef.current = rectangleToolRef.current;
          }
          break;
        case 'circle':
          if (circleToolRef.current) {
            circleToolRef.current.open();
            currentToolRef.current = circleToolRef.current;
          }
          break;
        case 'polygon':
          if (polygonToolRef.current) {
            polygonToolRef.current.open();
            currentToolRef.current = polygonToolRef.current;
          }
          break;
        default:
          break;
      }
      
      // 通知父组件
      if (onToolSelect) {
        onToolSelect(toolId);
      }
    } catch (err) {
      console.error('选择绘图工具失败:', err);
    }
  };
  
  // 处理清除
  const handleClear = () => {
    try {
      closeAllTools();
      
      // 清除地图上的覆盖物
      if (mapRef?.current) {
        const map = mapRef.current.getMap();
        if (map) {
          map.clearOverLays();
        }
      }
      
      // 通知父组件
      if (onClear) {
        onClear();
      }
    } catch (err) {
      console.error('清除绘图失败:', err);
    }
  };
  
  // 格式化数字
  const formatNumber = (num?: number) => {
    if (num === undefined) return '—';
    return num.toFixed(2);
  };
  
  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>区域工具</h2>
        <button 
          onClick={onClose} 
          style={closeButtonStyle}
          aria-label="关闭区域工具"
        >
          <X size={20} />
        </button>
      </div>
      
      <div style={toolListStyle}>
        <div style={toolGroupStyle}>
          <h3 style={toolGroupTitleStyle}>绘制工具</h3>
          <div style={toolButtonsContainerStyle}>
            {drawTools.map(tool => (
              <div
                key={tool.id}
                style={activeTool === tool.id ? activeToolButtonStyle : toolButtonStyle}
                onClick={() => handleToolSelect(tool.id)}
              >
                <div style={toolIconContainerStyle}>
                  {tool.icon}
                </div>
                <span style={toolNameStyle}>{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div style={toolGroupStyle}>
          <h3 style={toolGroupTitleStyle}>操作</h3>
          <div style={toolButtonsContainerStyle}>
            <div
              style={toolButtonStyle}
              onClick={handleClear}
            >
              <div style={toolIconContainerStyle}>
                <Trash2 size={20} />
              </div>
              <span style={toolNameStyle}>清除</span>
            </div>
          </div>
        </div>
      </div>
      
      {roiData && (
        <div style={analysisResultsStyle}>
          <h3 style={{ margin: '0 0 10px 0' }}>区域信息</h3>
          {roiData.area !== undefined && (
            <div style={{ marginBottom: '8px' }}>
              <strong>面积：</strong> {formatNumber(roiData.area)} 平方米
            </div>
          )}
          {roiData.perimeter !== undefined && (
            <div style={{ marginBottom: '8px' }}>
              <strong>周长：</strong> {formatNumber(roiData.perimeter)} 米
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 