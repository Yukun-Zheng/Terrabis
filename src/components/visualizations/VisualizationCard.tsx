import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface VisualizationCardProps {
  title: string;
  icon?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
  actions?: ReactNode;
}

/**
 * 可视化卡片组件
 * 提供统一的标题栏和关闭按钮
 */
const VisualizationCard: React.FC<VisualizationCardProps> = ({
  title,
  icon,
  onClose,
  children,
  actions
}) => {
  // 卡片样式
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '15px',
    overflow: 'hidden',
    border: '1px solid #f0f0f0'
  };
  
  // 卡片头部样式
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fafafa'
  };
  
  // 标题样式
  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    margin: 0
  };
  
  // 内容区域样式
  const contentStyle: React.CSSProperties = {
    padding: '16px'
  };
  
  // 处理鼠标悬停事件
  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#f5f5f5';
    e.currentTarget.style.color = '#666';
  };
  
  // 处理鼠标离开事件
  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = '#999';
  };
  
  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          {icon && <span style={{ display: 'flex' }}>{icon}</span>}
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {actions && <div>{actions}</div>}
          {onClose && (
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                color: '#999'
              }}
              onClick={onClose}
              aria-label="关闭"
              title="关闭"
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default VisualizationCard; 