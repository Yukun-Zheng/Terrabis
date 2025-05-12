import React from 'react';
import { Map } from 'mapbox-gl';
import { ZoomIn, ZoomOut, Compass, Layers, Search, PenTool, Table } from 'lucide-react';

/**
 * 导航控制样式 - 放在左上角
 */
const controlContainer: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '5px'
};

/**
 * 按钮样式
 */
const controlButton: React.CSSProperties = {
  width: '36px',
  height: '36px',
  border: 'none',
  borderRadius: '4px',
  background: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
};

/**
 * 激活的按钮样式
 */
const activeButtonStyle: React.CSSProperties = {
  ...controlButton,
  background: '#3388ff',
  color: 'white'
};

/**
 * 导航控制组件属性
 */
interface NavigationControlProps {
  onBasemapClick: () => void;
  onSearchClick: () => void;
  onRoiClick: () => void;
  onTableClick: () => void;
  activeTool: string | null;
  map?: Map | null;
}

/**
 * 导航控制组件
 * 
 * 提供放大、缩小、重置方向等功能，以及工具切换按钮
 */
export const NavigationControl: React.FC<NavigationControlProps> = ({
  onBasemapClick,
  onSearchClick,
  onRoiClick,
  onTableClick,
  activeTool,
  map
}) => {
  /**
   * 处理放大
   */
  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  /**
   * 处理缩小
   */
  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

  /**
   * 重置方向到正北
   */
  const handleResetNorth = () => {
    if (map) {
      map.resetNorthPitch();
    }
  };

  // 计算工具按钮样式
  const getToolButtonStyle = (toolId: string) => {
    return activeTool === toolId ? activeButtonStyle : controlButton;
  };

  return (
    <div style={controlContainer}>
      {/* 地图控制按钮 */}
      <button
        onClick={handleZoomIn}
        style={controlButton}
        title="放大"
        aria-label="放大"
      >
        <ZoomIn size={20} />
      </button>
      <button
        onClick={handleZoomOut}
        style={controlButton}
        title="缩小"
        aria-label="缩小"
      >
        <ZoomOut size={20} />
      </button>
      <button
        onClick={handleResetNorth}
        style={controlButton}
        title="重置方向"
        aria-label="重置方向"
      >
        <Compass size={20} />
      </button>
      
      {/* 分割线 */}
      <div style={{ height: '1px', background: '#e0e0e0', margin: '5px 0' }} />
      
      {/* 工具按钮 */}
      <button
        onClick={onBasemapClick}
        style={getToolButtonStyle('basemap')}
        title="切换底图"
        aria-label="切换底图"
      >
        <Layers size={20} />
      </button>
      <button
        onClick={onSearchClick}
        style={getToolButtonStyle('search')}
        title="搜索"
        aria-label="搜索"
      >
        <Search size={20} />
      </button>
      <button
        onClick={onRoiClick}
        style={getToolButtonStyle('roi')}
        title="ROI工具"
        aria-label="ROI工具"
      >
        <PenTool size={20} />
      </button>
      <button
        onClick={onTableClick}
        style={getToolButtonStyle('table')}
        title="表格数据"
        aria-label="表格数据"
      >
        <Table size={20} />
      </button>
    </div>
  );
}; 