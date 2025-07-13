import React from 'react';
import { BarChart, PieChart, List, LineChart } from 'lucide-react';
import { HeatPoint } from '../../data/heatmapData';

// 属性接口
interface LayerStatsCardProps {
  layerId: string;
  layerName: string;
  data: HeatPoint[];
  onClick: () => void;
}

/**
 * 图层统计卡片组件
 * 在左侧边缘显示图层的简要统计信息
 */
const LayerStatsCard: React.FC<LayerStatsCardProps> = ({
  layerId,
  layerName,
  data,
  onClick
}) => {
  // 计算基本统计数据
  const count = data.length;
  const max = data.length > 0 ? Math.max(...data.map(item => item.count)) : 0;
  const avg = data.length > 0 ? data.reduce((acc, item) => acc + item.count, 0) / data.length : 0;
  
  // 样式定义
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    backgroundColor: 'white',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    borderRadius: '4px',
    padding: '10px',
    margin: '5px 0',
    cursor: 'pointer',
    width: '220px',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    border: '1px solid #e8e8e8'
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    gap: '8px'
  };
  
  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '14px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
  
  const statsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#666'
  };
  
  const statItemStyle: React.CSSProperties = {
    textAlign: 'center'
  };
  
  const statValueStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1890ff'
  };
  
  // 获取图层图标
  const getLayerIcon = () => {
    if (layerId.includes('heatmap')) {
      return <BarChart size={16} color="#fb8c00" />;
    } else if (layerId.includes('hexbin')) {
      return <BarChart size={16} color="#9c27b0" />;
    } else if (layerId.includes('choropleth')) {
      return <PieChart size={16} color="#0288d1" />;
    } else if (layerId.includes('geojson')) {
      return <List size={16} color="#43a047" />;
    }
    
    return <LineChart size={16} color="#1890ff" />;
  };
  
  return (
    <div 
      style={cardStyle} 
      onClick={onClick}
      title={`查看${layerName}详细数据`}
    >
      <div style={headerStyle}>
        {getLayerIcon()}
        <h4 style={titleStyle}>{layerName}</h4>
      </div>
      
      <div style={statsStyle}>
        <div style={statItemStyle}>
          <div>数据点</div>
          <div style={statValueStyle}>{count}</div>
        </div>
        
        <div style={statItemStyle}>
          <div>最大值</div>
          <div style={statValueStyle}>{max.toFixed(0)}</div>
        </div>
        
        <div style={statItemStyle}>
          <div>平均值</div>
          <div style={statValueStyle}>{avg.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
};

export default LayerStatsCard; 