import React from 'react';
import { X } from 'lucide-react';
import { BasemapType } from '../TiandituMap';

/**
 * 底图选项接口
 */
interface BasemapOption {
  id: BasemapType;
  name: string;
  thumbnail?: string;
  thumbnailColor?: string; // 添加颜色属性用于生成占位图
  description?: string;
}

/**
 * 生成简单的底图缩略图占位符
 */
const generateThumbnailPlaceholder = (color: string) => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${color.replace('#', '%23')}' /%3E%3C/svg%3E`;
};

/**
 * 底图选项列表 - 天地图官方底图类型
 */
const basemapOptions: BasemapOption[] = [
  {
    id: 'vec',
    name: '矢量底图',
    thumbnailColor: '#e6f2ff',
    description: '清晰的道路和地点标注，适合常规浏览'
  },
  {
    id: 'img',
    name: '影像底图',
    thumbnailColor: '#b4ddb4',
    description: '高清卫星影像，展示真实地貌'
  },
  {
    id: 'ter',
    name: '地形底图',
    thumbnailColor: '#e0c190',
    description: '地形起伏表现，适合观察地形地貌'
  }
];

/**
 * 底图侧边栏组件属性
 */
interface BasemapSidebarProps {
  onClose: () => void;
  onBasemapSelect: (basemapId: string) => void;
  currentBasemap: string;
}

/**
 * 底图侧边栏组件
 */
export const BasemapSidebar: React.FC<BasemapSidebarProps> = ({
  onClose,
  onBasemapSelect,
  currentBasemap
}) => {
  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>选择底图</h2>
        <button 
          onClick={onClose} 
          style={closeButtonStyle}
          aria-label="关闭底图选择器"
        >
          <X size={20} />
        </button>
      </div>
      
      <div style={basemapListStyle}>
        {basemapOptions.map(basemap => (
          <div
            key={basemap.id}
            style={basemap.id === currentBasemap ? selectedBasemapItemStyle : basemapItemStyle}
            onClick={() => onBasemapSelect(basemap.id)}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={basemap.thumbnail || (basemap.thumbnailColor ? generateThumbnailPlaceholder(basemap.thumbnailColor) : '')}
                alt={basemap.name}
                style={thumbnailStyle}
              />
              {basemap.id === currentBasemap && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: '#3388ff',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  已选择
                </div>
              )}
            </div>
            <div style={basemapInfoStyle}>
              <h3 style={basemapNameStyle}>{basemap.name}</h3>
              {basemap.description && (
                <p style={basemapDescriptionStyle}>{basemap.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #ddd', 
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        更多底图选项将在后续更新中添加
      </div>
    </div>
  );
};

// 样式定义
const sidebarStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  right: '0',
  width: '320px',
  height: '100%',
  backgroundColor: 'white',
  boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
  zIndex: 1000,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column'
};

const headerStyle: React.CSSProperties = {
  padding: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #e0e0e0'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const basemapListStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px'
};

const basemapItemStyle: React.CSSProperties = {
  marginBottom: '16px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #e0e0e0',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const selectedBasemapItemStyle: React.CSSProperties = {
  ...basemapItemStyle,
  border: '2px solid #3388ff',
  boxShadow: '0 2px 8px rgba(51, 136, 255, 0.2)'
};

const thumbnailStyle: React.CSSProperties = {
  width: '100%',
  height: '120px',
  objectFit: 'cover',
  display: 'block'
};

const basemapInfoStyle: React.CSSProperties = {
  padding: '12px'
};

const basemapNameStyle: React.CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: '16px'
};

const basemapDescriptionStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '14px',
  color: '#666'
}; 