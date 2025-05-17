import React from 'react';

// Shape data interface
interface DrawingData {
  id: string;
  type: string;
  name: string;
  area?: number;
  perimeter?: number;
  points?: number[][];
  startPoint?: [number, number];
  endPoint?: [number, number];
  createdAt: Date;
}

// Helper function to format numbers nicely
const formatNumber = (num?: number): string => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  
  // Handle very small numbers
  if (Math.abs(num) < 0.01) {
    return num.toExponential(2);
  }
  
  // Round to 2 decimal places
  const rounded = Math.round(num * 100) / 100;
  
  // Format with thousands separators
  return rounded.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

// Shape statistics component
export const ShapeStatistics: React.FC<{ shapes: DrawingData[] }> = ({ shapes }) => {
  if (!shapes || shapes.length === 0) return null;
  
  // Calculate statistics
  let totalArea = 0;
  let totalPerimeter = 0;
  let rectangleCount = 0;
  let circleCount = 0;
  let polygonCount = 0;
  
  // Calculate statistics
  shapes.forEach(shape => {
    totalArea += shape.area || 0;
    totalPerimeter += shape.perimeter || 0;
    
    if (shape.type === 'rectangle') rectangleCount++;
    else if (shape.type === 'circle') circleCount++;
    else if (shape.type === 'polygon') polygonCount++;
  });
  
  return (
    <div style={{ 
      marginBottom: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid #f0f0f0'
    }}>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        gap: '6px'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
          <path d="M22 12A10 10 0 0 0 12 2v10z"/>
        </svg>
        <h3 style={{ margin: 0, fontSize: '16px' }}>形状统计数据</h3>
      </div>
      
      {/* Total statistics cards */}
      <div style={{ 
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: 1,
          minWidth: '120px',
          backgroundColor: '#f0f5ff',
          borderRadius: '6px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>形状总数</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#1890ff',
            display: 'flex',
            alignItems: 'baseline'
          }}>
            {shapes.length}
            <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '4px' }}>个</span>
          </div>
        </div>
        
        <div style={{
          flex: 1,
          minWidth: '120px',
          backgroundColor: '#f6ffed',
          borderRadius: '6px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>总面积</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#52c41a',
            display: 'flex',
            alignItems: 'baseline'
          }}>
            {formatNumber(totalArea)}
            <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '4px' }}>m²</span>
          </div>
        </div>
        
        <div style={{
          flex: 1,
          minWidth: '120px',
          backgroundColor: '#fff7e6',
          borderRadius: '6px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>总周长</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#fa8c16',
            display: 'flex',
            alignItems: 'baseline'
          }}>
            {formatNumber(totalPerimeter)}
            <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '4px' }}>m</span>
          </div>
        </div>
      </div>
      
      {/* Statistics by type */}
      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>按类型统计</div>
      <div style={{ 
        display: 'flex',
        gap: '10px',
        marginBottom: '8px',
        flexWrap: 'wrap'
      }}>
        {rectangleCount > 0 && (
          <div style={{
            backgroundColor: '#e6f7ff',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
            <span style={{ fontWeight: 'bold', color: '#1890ff' }}>矩形:</span>
            <span>{rectangleCount}个</span>
          </div>
        )}
        
        {circleCount > 0 && (
          <div style={{
            backgroundColor: '#f6ffed',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span style={{ fontWeight: 'bold', color: '#52c41a' }}>圆形:</span>
            <span>{circleCount}个</span>
          </div>
        )}
        
        {polygonCount > 0 && (
          <div style={{
            backgroundColor: '#fff2e8',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fa8c16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 19 9 16 16 8 18 2 12 8 5"/>
            </svg>
            <span style={{ fontWeight: 'bold', color: '#fa8c16' }}>多边形:</span>
            <span>{polygonCount}个</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShapeStatistics; 