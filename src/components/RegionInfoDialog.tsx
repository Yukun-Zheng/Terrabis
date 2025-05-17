import React from 'react';

interface RegionInfoDialogProps {
  feature: any; // GeoJSON Feature对象
  position: { lng: number; lat: number } | null; // 点击位置
  onClose: () => void; // 关闭对话框回调
  visible: boolean; // 是否可见
}

/**
 * 行政区域信息对话框
 * 显示区域名称、类型、坐标等信息
 */
const RegionInfoDialog: React.FC<RegionInfoDialogProps> = ({
  feature,
  position,
  onClose,
  visible
}) => {
  if (!visible || !feature || !position) return null;
  
  const { properties } = feature;
  const name = properties?.name || '未知区域';
  const type = getRegionType(feature);
  
  // 样式定义
  const dialogStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    padding: '12px',
    width: '280px',
    left: '20px',
    top: '80px',
    animation: 'fadeIn 0.3s ease-out'
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f0f0f0'
  };
  
  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937'
  };
  
  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: '18px'
  };
  
  const contentStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666'
  };
  
  const labelStyle: React.CSSProperties = {
    fontWeight: 'bold',
    color: '#333',
    marginRight: '8px'
  };
  
  const itemStyle: React.CSSProperties = {
    marginBottom: '6px'
  };

  // 获取区域类型
  function getRegionType(feature: any): string {
    const filename = feature._filename || '';
    console.log('区域文件名:', filename);
    
    if (filename.includes('中国_省')) return '国家';
    if (filename.includes('广东省')) return '省';
    if (filename.includes('深圳市')) return '市';
    
    // 尝试通过properties.name判断
    const name = feature.properties?.name || '';
    console.log('区域名称:', name);
    
    if (name.includes('省')) return '省';
    if (name.includes('市')) return '市';
    if (name.includes('县')) return '县';
    if (name.includes('区')) return '区';
    
    return '行政区域';
  }
  
  return (
    <div style={dialogStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>{name}</h3>
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
      </div>
      <div style={contentStyle}>
        <div style={itemStyle}>
          <span style={labelStyle}>区域类型:</span>
          <span>{type}</span>
        </div>
        {properties.gb && (
          <div style={itemStyle}>
            <span style={labelStyle}>行政代码:</span>
            <span>{properties.gb}</span>
          </div>
        )}
        <div style={itemStyle}>
          <span style={labelStyle}>点击位置:</span>
          <span>经度: {position.lng.toFixed(6)}, 纬度: {position.lat.toFixed(6)}</span>
        </div>
        {properties.area && (
          <div style={itemStyle}>
            <span style={labelStyle}>面积:</span>
            <span>{properties.area} km²</span>
          </div>
        )}
        {properties.population && (
          <div style={itemStyle}>
            <span style={labelStyle}>人口:</span>
            <span>{properties.population}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionInfoDialog; 