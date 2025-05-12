import React from 'react';
import { Layers, Search, TableProperties, MapPin } from 'lucide-react';

/**
 * 底部控制栏容器样式
 */
const controlBarContainer: React.CSSProperties = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1,
  display: 'flex',
  gap: '10px',
  background: 'white',
  padding: '5px',
  borderRadius: '4px',
  boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
};

/**
 * 按钮样式
 */
const controlButton: React.CSSProperties = {
  width: '40px',
  height: '40px',
  border: 'none',
  borderRadius: '4px',
  background: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#666',
};

/**
 * 激活按钮样式
 */
const activeButtonStyle: React.CSSProperties = {
  ...controlButton,
  background: '#f0f0f0',
  color: '#3388ff',
  boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.1)',
};

/**
 * 底部信息栏样式
 */
const infoBarStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  background: 'rgba(255, 255, 255, 0.8)',
  padding: '5px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  color: '#666',
  boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
  pointerEvents: 'none'
};

interface ToolButton {
  id: 'search' | 'draw';
  name: string;
}

interface BottomControlBarProps {
  tools: ToolButton[];
  activeTool: string | null;
  onToolSelect: (toolId: 'search' | 'draw') => void;
}

/**
 * 底部控制栏组件
 * 在地图底部居中展示工具按钮
 */
export const BottomControlBar: React.FC<BottomControlBarProps> = ({
  tools,
  activeTool,
  onToolSelect
}) => {
  // 控制栏容器样式
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    display: 'flex',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    padding: '6px'
  };
  
  // 控制按钮样式
  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    margin: '0 5px',
    padding: '8px 15px',
    backgroundColor: isActive ? '#1890ff' : 'transparent',
    color: isActive ? 'white' : '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  });
  
  // 获取对应按钮的图标
  const getButtonIcon = (toolId: string) => {
    switch(toolId) {
      case 'search': return <Search size={16} />;
      case 'draw': return <MapPin size={16} />;
      default: return null;
    }
  };
  
  return (
    <div style={containerStyle}>
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          style={buttonStyle(tool.id === activeTool)}
        >
          {getButtonIcon(tool.id)}
          {tool.name}
        </button>
      ))}
    </div>
  );
};

export default BottomControlBar; 