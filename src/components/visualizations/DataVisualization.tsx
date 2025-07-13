import React, { useState } from 'react';
import { BarChart, PieChart, List, LineChart, Radar as RadarIcon, Circle, ScatterChart, AreaChart, Layers, Layout } from 'lucide-react';
import VisualizationCard from './VisualizationCard';
import { Bar, Pie, Line, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title
);

// 扩展可视化类型
export type VisualizationType =
  | 'table'
  | 'bar'
  | 'pie'
  | 'line'
  | 'radar'
  | 'polarArea'
  | 'bubble'
  | 'scatter'
  | 'area'
  | 'stackedBar'
  | 'stackedArea';

// 属性接口
interface DataVisualizationProps {
  data: any[];
  maxValue?: number;
  layerName?: string;
}

const defaultVisible: Record<VisualizationType, boolean> = {
  table: true,
  bar: true,
  pie: true,
  line: true,
  radar: false,
  polarArea: false,
  bubble: false,
  scatter: false,
  area: false,
  stackedBar: false,
  stackedArea: false
};

/**
 * 数据可视化组件
 * 仅用于数据详情查看，不再负责创建可拖动图表
 */
const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  maxValue = 100,
  layerName = '图层数据'
}) => {
  const [visibleCards, setVisibleCards] = useState<{ [key in VisualizationType]: boolean }>(defaultVisible);
  
  // 关闭某个可视化卡片
  const closeCard = (type: VisualizationType) => {
    setVisibleCards(prev => ({ ...prev, [type]: false }));
  };
  
  // 重新打开某个可视化卡片
  const openCard = (type: VisualizationType) => {
    setVisibleCards(prev => ({ ...prev, [type]: true }));
  };
  
  // 过滤无效数据并限制显示数量
  const validData = data && Array.isArray(data) 
    ? data.filter(item => item && item.count !== undefined)
    : [];
  
  // 限制最多显示10条记录
  const limitedData = validData.slice(0, 10);
  
  // 计算数据的实际最大值，用于折线图缩放
  const actualMaxValue = limitedData.length > 0 
    ? Math.max(...limitedData.map(item => item.count))
    : maxValue;
  
  if (limitedData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        暂无数据可显示
      </div>
    );
  }
  
  // 通用数据转换
  const chartLabels = limitedData.map(item => item.name || `点位${item.id || ''}`);
  const chartValues = limitedData.map(item => item.count);
  const chartColors = limitedData.map((item, i) => item.color || `hsl(${i * 360 / limitedData.length}, 70%, 60%)`);
  
  // Chart.js数据结构
  const barData = {
    labels: chartLabels,
    datasets: [
      {
        label: layerName,
        data: chartValues,
        backgroundColor: chartColors
      }
    ]
  };
  const pieData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: chartColors
      }
    ]
  };
  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        label: layerName,
        data: chartValues,
        fill: false,
        borderColor: '#4caf50',
        backgroundColor: '#4caf50',
        tension: 0.4
      }
    ]
  };
  const radarData = {
    labels: chartLabels,
    datasets: [
      {
        label: layerName,
        data: chartValues,
        backgroundColor: 'rgba(33,150,243,0.2)',
        borderColor: '#2196f3',
        pointBackgroundColor: '#2196f3',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#2196f3'
      }
    ]
  };
  const polarAreaData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: chartColors
      }
    ]
  };
  const bubbleData = {
    datasets: limitedData.map((item, i) => ({
      label: item.name || `点位${item.id || ''}`,
      data: [{ x: i + 1, y: item.count, r: Math.max(5, Math.min(30, item.count / 2)) }],
      backgroundColor: item.color || `hsl(${i * 360 / limitedData.length}, 70%, 60%)`
    }))
  };
  const scatterData = {
    datasets: limitedData.map((item, i) => ({
      label: item.name || `点位${item.id || ''}`,
      data: [{ x: i + 1, y: item.count }],
      backgroundColor: item.color || `hsl(${i * 360 / limitedData.length}, 70%, 60%)`
    }))
  };
  const areaData = {
    labels: chartLabels,
    datasets: [
      {
        label: layerName,
        data: chartValues,
        fill: true,
        backgroundColor: 'rgba(76,175,80,0.2)',
        borderColor: '#4caf50',
        tension: 0.4
      }
    ]
  };
  const stackedBarData = {
    labels: chartLabels,
    datasets: [
      {
        label: layerName + ' A',
        data: chartValues.map(v => v * 0.6),
        backgroundColor: 'rgba(33,150,243,0.7)'
      },
      {
        label: layerName + ' B',
        data: chartValues.map(v => v * 0.4),
        backgroundColor: 'rgba(255,152,0,0.7)'
      }
    ]
  };
  const stackedAreaData = {
    labels: chartLabels,
    datasets: [
      {
        label: layerName + ' A',
        data: chartValues.map(v => v * 0.6),
        fill: true,
        backgroundColor: 'rgba(33,150,243,0.2)',
        borderColor: '#2196f3',
        tension: 0.4
      },
      {
        label: layerName + ' B',
        data: chartValues.map(v => v * 0.4),
        fill: true,
        backgroundColor: 'rgba(255,152,0,0.2)',
        borderColor: '#ff9800',
        tension: 0.4
      }
    ]
  };
  
  // Chart.js通用options
  const baseOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const } },
    maintainAspectRatio: false
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '15px' // 增加卡片之间的间距
    }}>
      {/* 表格视图 */}
      {visibleCards.table && (
        <VisualizationCard 
          title="表格视图" 
          icon={<List size={18} color="#2196f3" />}
          onClose={() => closeCard('table')}
        >
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#f5f5f5', padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>名称</th>
                  <th style={{ backgroundColor: '#f5f5f5', padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>数值</th>
                </tr>
              </thead>
              <tbody>
                {limitedData.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>{item.name || `点位 ${index + 1}`}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VisualizationCard>
      )}
      
      {/* 柱状图 */}
      {visibleCards.bar && (
        <VisualizationCard 
          title="柱状图" 
          icon={<BarChart size={18} color="#ff9800" />}
          onClose={() => closeCard('bar')}
        >
          <div style={{ height: '280px' }}>
            <Bar data={barData} options={baseOptions} />
          </div>
        </VisualizationCard>
      )}
      
      {/* 饼图 */}
      {visibleCards.pie && (
        <VisualizationCard 
          title="饼图" 
          icon={<PieChart size={18} color="#e91e63" />}
          onClose={() => closeCard('pie')}
        >
          <div style={{ height: '250px' }}>
            <Pie data={pieData} options={baseOptions} />
          </div>
        </VisualizationCard>
      )}
      
      {/* 折线图 */}
      {visibleCards.line && (
        <VisualizationCard 
          title="折线图" 
          icon={<LineChart size={18} color="#4caf50" />}
          onClose={() => closeCard('line')}
        >
          <div style={{ height: '250px' }}>
            <Line data={lineData} options={baseOptions} />
          </div>
        </VisualizationCard>
      )}
      
      {/* 雷达图 */}
      {visibleCards.radar && (
        <VisualizationCard 
          title="雷达图" 
          icon={<RadarIcon size={18} color="#2196f3" />}
          onClose={() => closeCard('radar')}
        >
          <div style={{ height: '250px' }}>
            <Radar data={radarData} options={baseOptions} />
          </div>
        </VisualizationCard>
      )}
      
      {/* 极地区域图 */}
      {visibleCards.polarArea && (
        <VisualizationCard 
          title="极地区域图" 
          icon={<Circle size={18} color="#00bcd4" />}
          onClose={() => closeCard('polarArea')}
        >
          <div style={{ height: '250px' }}>
            <PolarArea data={polarAreaData} options={baseOptions} />
          </div>
        </VisualizationCard>
      )}
      
      {/* 气泡图 */}
      {visibleCards.bubble && (
        <VisualizationCard 
          title="气泡图" 
          icon={<ScatterChart size={18} color="#ff9800" />}
          onClose={() => closeCard('bubble')}
        >
          <div style={{ height: '250px' }}>
            <Bubble data={bubbleData} options={baseOptions} />
          </div>
        </VisualizationCard>
      )}
      
      {/* 散点图 */}
      {visibleCards.scatter && (
        <VisualizationCard 
          title="散点图" 
          icon={<ScatterChart size={18} color="#4caf50" />}
          onClose={() => closeCard('scatter')}
        >
          <div style={{ height: '250px' }}>
            <Scatter data={scatterData} options={baseOptions} />
          </div>
        </VisualizationCard>
      )}
      
      {/* 面积图 */}
      {visibleCards.area && (
        <VisualizationCard 
          title="面积图" 
          icon={<AreaChart size={18} color="#2196f3" />}
          onClose={() => closeCard('area')}
        >
          <div style={{ height: '250px' }}>
            <Line data={areaData} options={{ ...baseOptions, elements: { line: { fill: true } } }} />
          </div>
        </VisualizationCard>
      )}
      
      {/* 堆叠柱状图 */}
      {visibleCards.stackedBar && (
        <VisualizationCard 
          title="堆叠柱状图" 
          icon={<Layers size={18} color="#ff9800" />}
          onClose={() => closeCard('stackedBar')}
        >
          <div style={{ height: '250px' }}>
            <Bar data={stackedBarData} options={{ ...baseOptions, plugins: { ...baseOptions.plugins }, scales: { x: { stacked: true }, y: { stacked: true } } }} />
          </div>
        </VisualizationCard>
      )}
      
      {/* 堆叠面积图 */}
      {visibleCards.stackedArea && (
        <VisualizationCard 
          title="堆叠面积图" 
          icon={<Layout size={18} color="#00bcd4" />}
          onClose={() => closeCard('stackedArea')}
        >
          <div style={{ height: '250px' }}>
            <Line data={stackedAreaData} options={{ ...baseOptions, elements: { line: { fill: true } }, plugins: { ...baseOptions.plugins }, scales: { x: { stacked: true }, y: { stacked: true } } }} />
          </div>
        </VisualizationCard>
      )}
      
      {/* 已关闭的卡片重新打开按钮 */}
      {Object.entries(visibleCards).some(([_, visible]) => !visible) && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          {!visibleCards.table && (
            <button style={reopenBtnStyle} onClick={() => openCard('table')}><List size={14} color="#2196f3" /><span>显示表格</span></button>
          )}
          {!visibleCards.bar && (
            <button style={reopenBtnStyle} onClick={() => openCard('bar')}><BarChart size={14} color="#ff9800" /><span>显示柱状图</span></button>
          )}
          {!visibleCards.pie && (
            <button style={reopenBtnStyle} onClick={() => openCard('pie')}><PieChart size={14} color="#e91e63" /><span>显示饼图</span></button>
          )}
          {!visibleCards.line && (
            <button style={reopenBtnStyle} onClick={() => openCard('line')}><LineChart size={14} color="#4caf50" /><span>显示折线图</span></button>
          )}
          {!visibleCards.radar && (
            <button style={reopenBtnStyle} onClick={() => openCard('radar')}><RadarIcon size={14} color="#2196f3" /><span>显示雷达图</span></button>
          )}
          {!visibleCards.polarArea && (
            <button style={reopenBtnStyle} onClick={() => openCard('polarArea')}><Circle size={14} color="#00bcd4" /><span>显示极地区域图</span></button>
          )}
          {!visibleCards.bubble && (
            <button style={reopenBtnStyle} onClick={() => openCard('bubble')}><ScatterChart size={14} color="#ff9800" /><span>显示气泡图</span></button>
          )}
          {!visibleCards.scatter && (
            <button style={reopenBtnStyle} onClick={() => openCard('scatter')}><ScatterChart size={14} color="#4caf50" /><span>显示散点图</span></button>
          )}
          {!visibleCards.area && (
            <button style={reopenBtnStyle} onClick={() => openCard('area')}><AreaChart size={14} color="#2196f3" /><span>显示面积图</span></button>
          )}
          {!visibleCards.stackedBar && (
            <button style={reopenBtnStyle} onClick={() => openCard('stackedBar')}><Layers size={14} color="#ff9800" /><span>显示堆叠柱状图</span></button>
          )}
          {!visibleCards.stackedArea && (
            <button style={reopenBtnStyle} onClick={() => openCard('stackedArea')}><Layout size={14} color="#00bcd4" /><span>显示堆叠面积图</span></button>
          )}
        </div>
      )}
    </div>
  );
};

const reopenBtnStyle: React.CSSProperties = {
  padding: '5px 10px',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  backgroundColor: '#f5f5f5',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  marginBottom: '5px'
};

export default DataVisualization; 