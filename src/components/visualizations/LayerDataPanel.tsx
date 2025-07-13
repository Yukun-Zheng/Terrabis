import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, BarChart, PieChart, List, LineChart, Radar as RadarIcon, Circle, ScatterChart, AreaChart, Layers, Layout } from 'lucide-react';
import { HeatPoint } from '../../data/heatmapData';
import DraggableChart from './DraggableChart';
import { Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';

// 属性接口
interface LayerDataPanelProps {
  layerId: string | null;
  layerName: string;
  data: HeatPoint[];
  maxValue?: number;
  onClose: () => void;
  onEnableGlobalCharts?: () => void;
}

// 图表项接口
interface ChartItem {
  id: string;
  type: ChartType;
  title: string;
  data: any[];
  position: { x: number, y: number };
  size: { width: number, height: number };
}

// 图表类型
export type ChartType = 'pie' | 'bar' | 'line' | 'radar' | 'polarArea' | 'bubble' | 'scatter' | 'area' | 'stackedBar' | 'stackedArea';

// 添加测试数据
const testData = [
  { name: '上海', count: 85, id: '1', color: '#ff5722' },
  { name: '北京', count: 78, id: '2', color: '#2196f3' },
  { name: '广州', count: 65, id: '3', color: '#4caf50' },
  { name: '深圳', count: 62, id: '4', color: '#9c27b0' },
  { name: '杭州', count: 57, id: '5', color: '#ff9800' },
  { name: '成都', count: 52, id: '6', color: '#795548' },
  { name: '武汉', count: 48, id: '7', color: '#607d8b' },
  { name: '西安', count: 45, id: '8', color: '#3f51b5' },
  { name: '重庆', count: 43, id: '9', color: '#009688' },
  { name: '南京', count: 41, id: '10', color: '#e91e63' }
];

/**
 * 图层数据面板组件
 * 直接在地图上显示独立的图表面板
 */
const LayerDataPanel: React.FC<LayerDataPanelProps> = ({
  layerId,
  layerName,
  data,
  maxValue = 100,
  onClose,
  onEnableGlobalCharts
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [charts, setCharts] = useState<ChartItem[]>([]);
  
  // 没有图层或数据时不显示
  if (!layerId || !data) {
    return null;
  }
  
  // 样式定义
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    left: '70px', // 增加左侧距离，避免遮挡定位控件
    top: '10px',
    width: '262px', // 175px * 1.5 = 262.5px
    maxHeight: '85vh',
    backgroundColor: 'white',
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
    borderRadius: '8px', // 5px * 1.5 = 7.5px，取整为8px
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 899, // 确保高于地图但低于侧边栏
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: collapsed ? '5px 8px' : '8px 9px', // 放大1.5倍
    borderBottom: '1px solid #eee',
    backgroundColor: '#f9fcff'
  };
  
  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '16px', // 11px * 1.5 = 16.5px，取整为16px
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
    color: '#333'
  };
  
  // 按钮样式
  const buttonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px', // 1px * 1.5 = 1.5px，取整为2px
    borderRadius: '3px', // 2px * 1.5 = 3px
    color: '#666',
  };
  
  // 图表按钮容器样式
  const chartButtonsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px', // 3px * 1.5 = 4.5px，取整为5px
    padding: '6px', // 4px * 1.5 = 6px
  };
  
  // 图表按钮样式
  const chartButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px', // 3px * 1.5 = 4.5px，取整为5px
    padding: '6px 8px', // 4px * 1.5 = 6px, 5px * 1.5 = 7.5px，取整为8px
    backgroundColor: '#f5f5f5',
    border: '1px solid #e8e8e8',
    borderRadius: '5px', // 3px * 1.5 = 4.5px，取整为5px
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '15px', // 10px * 1.5 = 15px
  };
  
  // 处理鼠标悬停事件
  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#f0f0f0';
  };
  
  const contentStyle: React.CSSProperties = {
    overflowY: 'auto',
    padding: collapsed ? '0' : '9px', // 6px * 1.5 = 9px
    flex: 1,
    display: collapsed ? 'none' : 'block'
  };
  
  // 获取图层图标
  const getLayerIcon = () => {
    if (!layerId) return <BarChart size={15} color="#1890ff" />; // 10px * 1.5 = 15px
    
    if (layerId.includes('heatmap')) {
      return <BarChart size={15} color="#fb8c00" />;
    } else if (layerId.includes('hexbin')) {
      return <BarChart size={15} color="#9c27b0" />;
    } else if (layerId.includes('choropleth')) {
      return <PieChart size={15} color="#0288d1" />;
    } else if (layerId.includes('geojson')) {
      return <List size={15} color="#43a047" />;
    }
    
    return <LineChart size={15} color="#1890ff" />;
  };
  
  // 准备图表数据
  const prepareChartData = (data: any[]) => {
    if (!Array.isArray(data)) {
      console.warn('prepareChartData: 输入不是数组', data);
      return [];
    }
    
    // 过滤有效数据
    const validData = data.filter(item => item && typeof item === 'object');
    console.log(`prepareChartData: 有效数据 ${validData.length}/${data.length}`);
    
    if (validData.length === 0) {
      return [];
    }
    
    return validData.slice(0, 15).map(item => ({
      label: item.name || '未命名',
      value: item.count || 0
    }));
  };
  
  // 创建各种类型的图表
  const createChart = (type: ChartType, index: number) => {
    console.log(`尝试创建图表: ${type}, 当前图表数量: ${charts.length}`);
    
    // 计算每列最多3个图表，超出后横向排列
    const chartsPerCol = 3;
    const chartWidth = 370; // 图表宽度+间距
    const chartHeight = 320; // 图表高度+间距
    const col = Math.floor(charts.length / chartsPerCol);
    const row = charts.length % chartsPerCol;
    const x = window.innerWidth - 320 - 350 - 10 + col * chartWidth;
    const y = 70 + row * chartHeight;
    
    console.log(`计算位置: col=${col}, row=${row}, x=${x}, y=${y}`);

    // 设置类型对应标题
    let title = '数据图表';
    switch (type) {
      case 'pie': title = `${layerName} - 饼图`; break;
      case 'bar': title = `${layerName} - 柱状图`; break;
      case 'line': title = `${layerName} - 折线图`; break;
      case 'radar': title = `${layerName} - 雷达图`; break;
      case 'polarArea': title = `${layerName} - 极地区域图`; break;
      case 'bubble': title = `${layerName} - 气泡图`; break;
      case 'scatter': title = `${layerName} - 散点图`; break;
      case 'area': title = `${layerName} - 面积图`; break;
      case 'stackedBar': title = `${layerName} - 堆叠柱状图`; break;
      case 'stackedArea': title = `${layerName} - 堆叠面积图`; break;
    }
    
    // 使用实际数据或测试数据
    // 如果实际数据为空，尝试使用测试数据
    let chartData;
    if (Array.isArray(data) && data.length > 0) {
      chartData = prepareChartData(data);
      console.log('使用实际数据，处理后长度:', chartData.length);
    } else {
      // 使用测试数据
      chartData = prepareChartData(testData);
      console.log('使用测试数据，长度:', chartData.length);
    }
    
    console.log('图表数据:', chartData);
    
    if (chartData.length === 0) {
      console.error('无有效数据，无法创建图表，请检查数据格式');
      alert('无有效数据，无法创建图表');
      return;
    }

    // 创建新图表
    const newChart: ChartItem = {
      id: `chart-${type}-${Date.now()}`,
      type,
      title,
      data: chartData,
      position: { x, y },
      size: { width: 350, height: 300 }
    };

    console.log('创建图表对象:', newChart);
    setCharts(prev => [...prev, newChart]);
    console.log(`已创建图表: ${title}, 当前图表数量: ${charts.length + 1}`);
  };
  
  // 关闭图表
  const closeChart = (chartId: string) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
  };
  
  // 检查图表是否已存在
  const chartExists = (type: ChartType) => {
    const exists = charts.some(chart => chart.type === type);
    console.log(`检查图表 ${type} 是否存在: ${exists}`);
    return exists;
  };
  
  // 确保组件加载时自动创建所有图表的effect正常工作
  useEffect(() => {
    // 延迟一点创建图表，避免闪烁
    const timer = setTimeout(() => {
      console.log('useEffect重新创建图表，数据:', data);
      
      // 清除旧图表
      setCharts([]);
      
      // 确保data是有效的数组且有数据
      const dataToUse = Array.isArray(data) && data.length > 0 ? data : testData;
      console.log('使用数据:', dataToUse.length > 0 ? '实际数据' : '测试数据', '长度:', dataToUse.length);

      // 创建三个默认类型的图表
      const defaultChartTypes: ChartType[] = ['pie', 'bar', 'line'];
      defaultChartTypes.forEach((type, index) => {
        const chartsPerCol = 3;
        const chartHeight = 320; // 图表高度+间距
        const row = index % chartsPerCol;
        const y = 70 + row * chartHeight;
        
        let title = '数据图表';
        switch (type) {
          case 'pie': title = `${layerName} - 饼图`; break;
          case 'bar': title = `${layerName} - 柱状图`; break;
          case 'line': title = `${layerName} - 折线图`; break;
        }
        
        // 使用实际数据或测试数据
        const chartData = prepareChartData(dataToUse);
        console.log(`创建图表: ${title}，数据长度: ${chartData.length}`);
        
        // 确保prepareChartData正常工作
        if (chartData.length === 0) {
          console.error('处理后的数据为空，无法创建图表');
          return;
        }
        
        const newChart: ChartItem = {
          id: `chart-${type}-${Date.now()}-${index}`, // 增加index避免ID冲突
          type,
          title,
          data: chartData,
          position: { 
            x: window.innerWidth - 320 - 350 - 10, // 侧边栏左侧更远处
            y 
          },
          size: { width: 350, height: 300 } // 略宽于面板
        };
        
        console.log('添加图表:', newChart);
        setCharts(prev => [...prev, newChart]);
      });
      
      console.log('图表创建完成');
    }, 500); // 增加延迟以确保DOM和数据准备好
    
    return () => clearTimeout(timer);
  }, [layerId, data, layerName]); // 显式添加layerName到依赖数组
  
  // 图表按钮区
  const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: 'pie', label: '饼图', icon: <PieChart size={18} color="#e91e63" /> },
    { type: 'bar', label: '柱状图', icon: <BarChart size={18} color="#ff9800" /> },
    { type: 'line', label: '折线图', icon: <LineChart size={18} color="#4caf50" /> },
    { type: 'radar', label: '雷达图', icon: <RadarIcon size={18} color="#2196f3" /> },
    { type: 'polarArea', label: '极地区域图', icon: <Circle size={18} color="#00bcd4" /> },
    { type: 'bubble', label: '气泡图', icon: <ScatterChart size={18} color="#ff9800" /> },
    { type: 'scatter', label: '散点图', icon: <ScatterChart size={18} color="#4caf50" /> },
    { type: 'area', label: '面积图', icon: <AreaChart size={18} color="#2196f3" /> },
    { type: 'stackedBar', label: '堆叠柱状图', icon: <Layers size={18} color="#ff9800" /> },
    { type: 'stackedArea', label: '堆叠面积图', icon: <Layout size={18} color="#00bcd4" /> },
  ];
  
  return (
    <>
      <div style={panelStyle}>
        <div style={headerStyle}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {getLayerIcon()}
              <h3 style={titleStyle}>{layerName}</h3>
            </div>
          )}
          <div style={{ display: 'flex' }}>
            <button 
              style={buttonStyle} 
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "展开" : "收起"}
              onMouseOver={handleMouseOver}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {collapsed ? <ChevronLeft size={15} style={{ transform: 'rotate(180deg)' }} /> : <ChevronLeft size={15} />}
            </button>
            <button 
              style={buttonStyle} 
              onClick={onClose}
              aria-label="关闭"
              onMouseOver={handleMouseOver}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={15} />
            </button>
          </div>
        </div>
        
        <div style={contentStyle}>
          <div style={chartButtonsContainerStyle}>
            {chartTypes.map((ct, idx) => (
              <button
                key={ct.type}
                style={chartButtonStyle}
                onClick={() => !chartExists(ct.type) && createChart(ct.type, idx)}
                onMouseOver={handleMouseOver}
                disabled={chartExists(ct.type)}
              >
                {ct.icon}
                {ct.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 可拖动图表 */}
      {charts.map(chart => (
        <DraggableChart
          key={chart.id}
          data={chart.data}
          type={chart.type as ChartType}
          title={chart.title}
          id={chart.id}
          initialPosition={chart.position}
          initialSize={chart.size}
          onClose={() => closeChart(chart.id)}
        />
      ))}
    </>
  );
};

export default LayerDataPanel; 