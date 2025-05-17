import React, { useState } from 'react';

interface OpacityControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

/**
 * 透明度控制滑块组件
 */
const OpacityControl: React.FC<OpacityControlProps> = ({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
  label = '透明度'
}) => {
  const [hover, setHover] = useState(false);
  
  // 容器样式
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
    marginBottom: '10px',
    transition: 'background-color 0.2s',
    backgroundColor: hover ? '#f5f5f5' : 'transparent',
    borderRadius: '4px'
  };
  
  // 标签样式
  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 8px'
  };
  
  // 滑块容器样式
  const sliderContainerStyle: React.CSSProperties = {
    padding: '0 8px'
  };
  
  // 滑块样式
  const sliderStyle: React.CSSProperties = {
    width: '100%',
    height: '4px',
    WebkitAppearance: 'none',
    appearance: 'none',
    backgroundColor: '#e6e6e6',
    outline: 'none',
    borderRadius: '2px',
    cursor: 'pointer'
  };
  
  // 百分比显示
  const percentage = Math.round(((value - min) / (max - min)) * 100);
  
  return (
    <div 
      style={containerStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={labelStyle}>
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div style={sliderContainerStyle}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={sliderStyle}
        />
      </div>
    </div>
  );
};

export default OpacityControl; 