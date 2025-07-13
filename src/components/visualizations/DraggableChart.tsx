import React, { useState, useRef, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Pie, Bar, Line, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';

// 注册ChartJS组件
ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 数据类型接口
interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

// 图表类型
export type ChartType = 'pie' | 'bar' | 'line' | 'radar' | 'polarArea' | 'bubble' | 'scatter' | 'area' | 'stackedBar' | 'stackedArea';

// 组件属性接口
interface DraggableChartProps {
  data: ChartDataItem[];
  type: ChartType;
  title: string;
  id: string;
  initialPosition?: { x: number, y: number };
  initialSize?: { width: number, height: number };
  onClose?: () => void;
}

/**
 * 可拖动图表组件
 * 在页面上创建一个可拖动的图表面板
 */
const DraggableChart: React.FC<DraggableChartProps> = ({
  data,
  type,
  title,
  id,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 300, height: 250 },
  onClose
}) => {
  // 状态管理
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState({
    position: initialPosition,
    size: initialSize
  });
  
  // DOM 引用
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  
  // 准备图表数据
  const labels = data.map(item => item.label);
  const values = data.map(item => item.value);
  const colors = data.map(item => item.color || getRandomColor(item.label));
  
  // 获取随机颜色（基于字符串）
  function getRandomColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 60%)`;
  }
  
  // 拖动开始处理
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    // 防止拖动时选中文本
    e.preventDefault();
  };
  
  // 调整大小开始处理
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    
    setIsResizing(true);
    e.stopPropagation();
    e.preventDefault();
  };
  
  // 最大化/还原处理
  const toggleMaximize = () => {
    if (isMaximized) {
      // 还原到之前的状态
      setPosition(preMaximizeState.position);
      setSize(preMaximizeState.size);
      setIsMaximized(false);
    } else {
      // 保存当前状态并最大化
      setPreMaximizeState({
        position,
        size
      });
      
      // 计算最大化尺寸 (留出一些边距)
      const maxPosition = { x: 20, y: 20 };
      const maxSize = {
        width: window.innerWidth - 40,
        height: window.innerHeight - 40
      };
      
      setPosition(maxPosition);
      setSize(maxSize);
      setIsMaximized(true);
    }
  };
  
  // 鼠标移动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // 拖动图表
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // 边界检查
        const x = Math.max(0, Math.min(window.innerWidth - size.width, newX));
        const y = Math.max(0, Math.min(window.innerHeight - size.height, newY));
        
        setPosition({ x, y });
      } else if (isResizing) {
        // 调整图表大小
        const newWidth = Math.max(200, e.clientX - position.x);
        const newHeight = Math.max(150, e.clientY - position.y);
        
        setSize({
          width: newWidth,
          height: newHeight
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, position, dragOffset, size]);
  
  // 图表数据配置
  const chartData = (() => {
    switch (type) {
      case 'pie':
        return {
          labels,
          datasets: [{ data: values, backgroundColor: colors }]
        };
      case 'bar':
        return {
          labels,
          datasets: [{ label: title, data: values, backgroundColor: colors }]
        };
      case 'line':
        return {
          labels,
          datasets: [{ label: title, data: values, fill: false, borderColor: colors[0], backgroundColor: colors[0], tension: 0.4 }]
        };
      case 'radar':
        return {
          labels,
          datasets: [{ label: title, data: values, backgroundColor: 'rgba(33,150,243,0.2)', borderColor: '#2196f3', pointBackgroundColor: '#2196f3' }]
        };
      case 'polarArea':
        return {
          labels,
          datasets: [{ data: values, backgroundColor: colors }]
        };
      case 'bubble':
        return {
          datasets: data.map((item, i) => ({
            label: item.label,
            data: [{ x: i + 1, y: item.value, r: Math.max(5, Math.min(30, item.value / 2)) }],
            backgroundColor: item.color || colors[i]
          }))
        };
      case 'scatter':
        return {
          datasets: data.map((item, i) => ({
            label: item.label,
            data: [{ x: i + 1, y: item.value }],
            backgroundColor: item.color || colors[i]
          }))
        };
      case 'area':
        return {
          labels,
          datasets: [{ label: title, data: values, fill: true, backgroundColor: 'rgba(76,175,80,0.2)', borderColor: '#4caf50', tension: 0.4 }]
        };
      case 'stackedBar':
        return {
          labels,
          datasets: [
            { label: title + ' A', data: values.map(v => v * 0.6), backgroundColor: 'rgba(33,150,243,0.7)' },
            { label: title + ' B', data: values.map(v => v * 0.4), backgroundColor: 'rgba(255,152,0,0.7)' }
          ]
        };
      case 'stackedArea':
        return {
          labels,
          datasets: [
            { label: title + ' A', data: values.map(v => v * 0.6), fill: true, backgroundColor: 'rgba(33,150,243,0.2)', borderColor: '#2196f3', tension: 0.4 },
            { label: title + ' B', data: values.map(v => v * 0.4), fill: true, backgroundColor: 'rgba(255,152,0,0.2)', borderColor: '#ff9800', tension: 0.4 }
          ]
        };
      default:
        return { labels, datasets: [] };
    }
  })();
  
  // 图表配置项
  const chartOptions = (() => {
    switch (type) {
      case 'stackedBar':
        return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: { x: { stacked: true }, y: { stacked: true } }
        };
      case 'stackedArea':
        return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          elements: { line: { fill: true } },
          scales: { x: { stacked: true }, y: { stacked: true } }
        };
      case 'area':
        return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          elements: { line: { fill: true } }
        };
      default:
        return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        };
    }
  })();
  
  // 渲染图表
  const renderChart = () => {
    switch (type) {
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'radar':
        return <Radar data={chartData} options={chartOptions} />;
      case 'polarArea':
        return <PolarArea data={chartData} options={chartOptions} />;
      case 'bubble':
        return <Bubble data={chartData} options={chartOptions} />;
      case 'scatter':
        return <Scatter data={chartData} options={chartOptions} />;
      case 'area':
        return <Line data={chartData} options={chartOptions} />;
      case 'stackedBar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'stackedArea':
        return <Line data={chartData} options={chartOptions} />;
      default:
        return <div>不支持的图表类型</div>;
    }
  };
  
  return (
    <div
      ref={chartContainerRef}
      className="draggable-chart"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor: 'white',
        borderRadius: '6px',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1000
      }}
    >
      {/* 标题栏 */}
      <div
        className="chart-header"
        style={{
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleDragStart}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Move size={14} color="#666" />
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isMaximized ? (
            <Minimize2
              size={16}
              color="#666"
              style={{ cursor: 'pointer' }}
              onClick={toggleMaximize}
              aria-label="还原"
            />
          ) : (
            <Maximize2
              size={16}
              color="#666"
              style={{ cursor: 'pointer' }}
              onClick={toggleMaximize}
              aria-label="最大化"
            />
          )}
          <X
            size={16}
            color="#666"
            style={{ cursor: 'pointer' }}
            onClick={onClose}
            aria-label="关闭"
          />
        </div>
      </div>
      
      {/* 图表内容 */}
      <div
        className="chart-content"
        style={{
          flex: 1,
          padding: '16px',
          overflow: 'hidden'
        }}
      >
        {renderChart()}
      </div>
      
      {/* 调整大小的手柄 */}
      {!isMaximized && (
        <div
          ref={resizeHandleRef}
          className="resize-handle"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '15px',
            height: '15px',
            cursor: 'nwse-resize',
            zIndex: 10
          }}
          onMouseDown={handleResizeStart}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            style={{
              position: 'absolute',
              right: '3px',
              bottom: '3px',
              pointerEvents: 'none'
            }}
          >
            <path
              d="M0 10L10 10L10 0"
              fill="none"
              stroke="#999"
              strokeWidth="1"
            />
            <path
              d="M3 10L10 10L10 3"
              fill="none"
              stroke="#999"
              strokeWidth="1"
            />
            <path
              d="M6 10L10 10L10 6"
              fill="none"
              stroke="#999"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default DraggableChart; 