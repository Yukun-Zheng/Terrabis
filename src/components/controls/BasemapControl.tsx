import React from 'react';
import { Layers } from 'lucide-react';

/**
 * 底图控制按钮样式
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
 * 底图控制组件属性
 */
interface BasemapControlProps {
  onClick: () => void;
  currentBasemap: string;
}

/**
 * 底图控制组件
 * 
 * 用于切换底图的悬浮按钮
 */
export const BasemapControl: React.FC<BasemapControlProps> = ({
  onClick,
  currentBasemap
}) => {
  return (
    <div style={controlContainer}>
      <button
        onClick={onClick}
        style={controlButton}
        title="切换底图"
        aria-label="切换底图"
      >
        <Layers size={20} />
      </button>
    </div>
  );
}; 