import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { HeatPoint } from '../../data/heatmapData';

// 注册ChartJS组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// 可视化类型
type VisualizationType = 'table' | 'bar' | 'pie' | 'line';

// 属性接口
interface DataVisualizationProps {
  data: HeatPoint[];
  layerName: string;
  maxValue?: number;
}

/**
 * 数据可视化组件
 * 
 * 提供多种可视化方式：表格、柱状图、饼图、折线图
 */
const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  layerName,
  maxValue = 100
}) => {
  // 当前选择的可视化类型
  const [visType, setVisType] = useState<VisualizationType>('table');
  
  // 当前表格页码
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // 表格分页数据
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);
  
  // 为图表准备数据
  // 选取最高的10条数据用于可视化
  const top10Data = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
    
  const chartLabels = top10Data.map(item => item.name);
  const chartValues = top10Data.map(item => item.count);
  
  // 为条形图准备数据
  const barData = {
    labels: chartLabels,
    datasets: [
      {
        label: '热力值',
        data: chartValues,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // 为饼图准备数据
  const pieData = {
    labels: chartLabels,
    datasets: [
      {
        label: '热力值',
        data: chartValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
          'rgba(83, 102, 255, 0.7)',
          'rgba(40, 159, 64, 0.7)',
          'rgba(210, 105, 30, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 105, 30, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // 为折线图准备数据
  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        label: '热力值',
        data: chartValues,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };
  
  // 图表配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${layerName} - 热力数据(Top 10)`,
      },
    },
  };
  
  // 基本样式
  const containerStyle: React.CSSProperties = {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  };
  
  const chartContainerStyle: React.CSSProperties = {
    height: '300px',
    marginTop: '15px',
  };
  
  const tabStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid #eee',
    marginBottom: '15px',
  };
  
  const tabItemStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    cursor: 'pointer',
    borderBottom: active ? '2px solid #1890ff' : 'none',
    color: active ? '#1890ff' : '#666',
    fontWeight: active ? 'bold' : 'normal',
    transition: 'all 0.3s',
  });
  
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  };
  
  const thStyle: React.CSSProperties = {
    padding: '12px 15px',
    textAlign: 'left',
    backgroundColor: '#f5f7fa',
    color: '#606266',
    fontWeight: 'bold',
    borderBottom: '1px solid #ebeef5',
  };
  
  const tdStyle: React.CSSProperties = {
    padding: '10px 15px',
    borderBottom: '1px solid #ebeef5',
  };
  
  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15px',
    gap: '10px',
  };
  
  const pageButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 10px',
    border: active ? '1px solid #1890ff' : '1px solid #d9d9d9',
    backgroundColor: active ? '#1890ff' : 'white',
    color: active ? 'white' : '#666',
    cursor: 'pointer',
    borderRadius: '4px',
  });
  
  // 数据分析
  const statsData = {
    count: data.length,
    max: Math.max(...data.map(item => item.count)),
    min: Math.min(...data.map(item => item.count)),
    avg: data.reduce((acc, item) => acc + item.count, 0) / data.length,
  };
  
  const statCardStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  };
  
  const statItemStyle: React.CSSProperties = {
    flex: 1,
    textAlign: 'center',
    borderRight: '1px solid #f0f0f0',
    padding: '0 10px',
  };
  
  // 渲染页面
  return (
    <div style={containerStyle}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
        {layerName} 数据可视化 ({data.length} 条)
      </h3>
      
      {/* 数据统计卡片 */}
      <div style={statCardStyle}>
        <div style={statItemStyle}>
          <div style={{ fontSize: '12px', color: '#909399' }}>数据点数</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>{statsData.count}</div>
        </div>
        <div style={statItemStyle}>
          <div style={{ fontSize: '12px', color: '#909399' }}>最大值</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>{statsData.max.toFixed(0)}</div>
        </div>
        <div style={statItemStyle}>
          <div style={{ fontSize: '12px', color: '#909399' }}>最小值</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>{statsData.min.toFixed(0)}</div>
        </div>
        <div style={{ ...statItemStyle, borderRight: 'none' }}>
          <div style={{ fontSize: '12px', color: '#909399' }}>平均值</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14' }}>{statsData.avg.toFixed(1)}</div>
        </div>
      </div>
      
      {/* 可视化类型选择器 */}
      <div style={tabStyle}>
        <div
          style={tabItemStyle(visType === 'table')}
          onClick={() => setVisType('table')}
        >
          表格
        </div>
        <div
          style={tabItemStyle(visType === 'bar')}
          onClick={() => setVisType('bar')}
        >
          柱状图
        </div>
        <div
          style={tabItemStyle(visType === 'pie')}
          onClick={() => setVisType('pie')}
        >
          饼图
        </div>
        <div
          style={tabItemStyle(visType === 'line')}
          onClick={() => setVisType('line')}
        >
          折线图
        </div>
      </div>
      
      {/* 表格视图 */}
      {visType === 'table' && (
        <>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>序号</th>
                <th style={thStyle}>名称</th>
                <th style={thStyle}>经度</th>
                <th style={thStyle}>纬度</th>
                <th style={thStyle}>热力值</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 ? '#fafafa' : 'white' }}>
                  <td style={tdStyle}>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td style={tdStyle}>{item.name || `位置${index+1}`}</td>
                  <td style={tdStyle}>{item.lng.toFixed(4)}</td>
                  <td style={tdStyle}>{item.lat.toFixed(4)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: `${(item.count / maxValue) * 100}%`,
                        maxWidth: '100px',
                        height: '6px',
                        background: `linear-gradient(90deg, #108ee9 0%, #87d068 100%)`,
                        marginRight: '8px',
                        borderRadius: '3px'
                      }} />
                      {item.count}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* 分页控件 */}
          {totalPages > 1 && (
            <div style={paginationStyle}>
              <button
                style={{ ...pageButtonStyle(false), opacity: currentPage === 1 ? 0.5 : 1 }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                上一页
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // 计算要显示哪些页码按钮
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    style={pageButtonStyle(currentPage === pageNum)}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                style={{ ...pageButtonStyle(false), opacity: currentPage === totalPages ? 0.5 : 1 }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
      
      {/* 柱状图视图 */}
      {visType === 'bar' && (
        <div style={chartContainerStyle}>
          <Bar data={barData} options={chartOptions} />
        </div>
      )}
      
      {/* 饼图视图 */}
      {visType === 'pie' && (
        <div style={chartContainerStyle}>
          <Pie data={pieData} options={chartOptions} />
        </div>
      )}
      
      {/* 折线图视图 */}
      {visType === 'line' && (
        <div style={chartContainerStyle}>
          <Line data={lineData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default DataVisualization; 