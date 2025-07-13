import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// 注册ChartJS组件
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// 数据类型接口
interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

// 图表类型
type ChartType = 'pie' | 'bar';

// 组件属性接口
interface ChartOverlayProps {
  map: any;                       // 天地图地图实例
  data: ChartDataItem[];          // 图表数据
  position: [number, number];     // 图表位置 [经度, 纬度]
  type?: ChartType;               // 图表类型
  title?: string;                 // 图表标题
  width?: number;                 // 图表宽度
  height?: number;                // 图表高度
  visible?: boolean;              // 是否可见
  backgroundColor?: string;       // 背景色
  borderColor?: string;           // 边框色
  borderWidth?: number;           // 边框宽度
  offset?: [number, number];      // 偏移量 [x, y]
  zIndex?: number;                // 层级
  onClose?: () => void;           // 关闭回调
}

/**
 * 图表叠加层组件
 * 在地图的指定经纬度位置显示统计图表
 */
const ChartOverlay: React.FC<ChartOverlayProps> = ({
  map,
  data,
  position,
  type = 'pie',
  title,
  width = 200,
  height = 200,
  visible = true,
  backgroundColor = 'rgba(255, 255, 255, 0.9)',
  borderColor = '#ccc',
  borderWidth = 1,
  offset = [0, 0],
  zIndex = 1000,
  onClose
}) => {
  // 图表容器ref
  const containerRef = useRef<HTMLDivElement | null>(null);
  // 图表叠加物ref
  const overlayRef = useRef<any>(null);
  
  // 创建图表叠加物
  useEffect(() => {
    if (!map || !Array.isArray(data) || data.length === 0) {
      console.error('图表叠加层初始化失败: 地图实例不存在或数据无效');
      return;
    }
    
    // 创建图表容器
    const container = document.createElement('div');
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.backgroundColor = backgroundColor;
    container.style.borderRadius = '4px';
    container.style.border = `${borderWidth}px solid ${borderColor}`;
    container.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
    container.style.padding = '10px';
    container.style.boxSizing = 'border-box';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    
    // 设置容器ID - 使用时间戳确保唯一性
    const containerId = `chart-overlay-${Date.now()}`;
    container.id = containerId;
    
    // 添加关闭按钮
    if (onClose) {
      const closeButton = document.createElement('div');
      closeButton.innerHTML = '✕';
      closeButton.style.position = 'absolute';
      closeButton.style.right = '8px';
      closeButton.style.top = '5px';
      closeButton.style.fontSize = '16px';
      closeButton.style.fontWeight = 'bold';
      closeButton.style.color = '#666';
      closeButton.style.cursor = 'pointer';
      closeButton.style.zIndex = '1';
      closeButton.style.lineHeight = '1';
      
      closeButton.addEventListener('click', () => {
        if (onClose) onClose();
      });
      
      container.appendChild(closeButton);
    }
    
    // 添加标题
    if (title) {
      const titleElement = document.createElement('div');
      titleElement.textContent = title;
      titleElement.style.fontSize = '14px';
      titleElement.style.fontWeight = 'bold';
      titleElement.style.marginBottom = '10px';
      titleElement.style.color = '#333';
      titleElement.style.textAlign = 'center';
      titleElement.style.paddingRight = '20px'; // 为关闭按钮留出空间
      container.appendChild(titleElement);
    }
    
    // 创建图表容器
    const chartContainer = document.createElement('div');
    chartContainer.style.width = '100%';
    chartContainer.style.height = title ? 'calc(100% - 30px)' : '100%';
    container.appendChild(chartContainer);
    containerRef.current = container;
    
    // 创建自定义覆盖物
    try {
      if (window.T && (window.T as any).OverlayBase) {
        const [lng, lat] = position;
        const [offsetX, offsetY] = offset;
        
        // 创建自定义覆盖物类
        class ChartOverlayClass extends ((window.T as any).OverlayBase) {
          // 添加类属性声明
          private _map: any;
          private _div: any = null;
          
          initialize(map: any) {
            this._map = map;
            this._div = container;
            map.getPanes().overlayPane.appendChild(container);
            return container;
          }
          
          getDiv() {
            return this._div;
          }
          
          getMap() {
            return this._map;
          }
          
          _getPixel() {
            const lnglat = new window.T.LngLat(lng, lat);
            return this._map.lngLatToLayerPoint(lnglat);
          }
          
          draw() {
            const pixel = this._getPixel();
            const x = pixel.x + offsetX - width / 2;
            const y = pixel.y + offsetY - height;
            
            this._div.style.left = `${x}px`;
            this._div.style.top = `${y}px`;
            this._div.style.position = 'absolute';
            this._div.style.zIndex = String(zIndex);
          }
        }
        
        // 创建覆盖物实例
        const overlay = new ChartOverlayClass();
        map.addOverLay(overlay);
        overlayRef.current = overlay;
        
        // 监听地图拖动结束事件以更新位置
        map.addEventListener('moveend', () => {
          if (overlay) overlay.draw();
        });
        
        // 监听地图缩放结束事件以更新位置
        map.addEventListener('zoomend', () => {
          if (overlay) overlay.draw();
        });
        
        // 设置可见性
        if (!visible) {
          container.style.display = 'none';
        }
      } else {
        console.error('天地图API未加载');
      }
    } catch (err) {
      console.error('创建图表叠加层时出错:', err);
    }
    
    // 组件卸载时清理
    return () => {
      if (overlayRef.current && map) {
        map.removeOverLay(overlayRef.current);
        overlayRef.current = null;
      }
      
      if (containerRef.current) {
        const parent = containerRef.current.parentNode;
        if (parent) {
          parent.removeChild(containerRef.current);
        }
        containerRef.current = null;
      }
    };
  }, [map, position]);
  
  // 更新可见性
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.display = visible ? 'block' : 'none';
    }
  }, [visible]);
  
  // 准备图表数据
  const labels = data.map(item => item.label);
  const values = data.map(item => item.value);
  const colors = data.map(item => item.color || getRandomColor(item.label));
  
  // 获取随机颜色（基于字符串）
  function getRandomColor(str: string): string {
    // 使用字符串生成一个确定性的颜色
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // 将哈希值转换为颜色
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 60%)`;
  }
  
  // 饼图数据
  const pieData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.6', '1')),
        borderWidth: 1,
      },
    ],
  };
  
  // 柱状图数据
  const barData = {
    labels,
    datasets: [
      {
        label: title || '数值',
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.6', '1')),
        borderWidth: 1,
      },
    ],
  };
  
  // 图表配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'pie',
        position: 'bottom' as const,
        labels: {
          boxWidth: 10,
          padding: 5,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        enabled: true
      }
    },
    scales: type === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 8
          }
        }
      }
    } : undefined
  };
  
  // 渲染图表
  React.useEffect(() => {
    const renderChart = () => {
      if (!containerRef.current) return;
      
      const chartContainer = containerRef.current.querySelector('div:last-child');
      if (!chartContainer) return;
      
      // 清空容器
      while (chartContainer.firstChild) {
        chartContainer.removeChild(chartContainer.firstChild);
      }
      
      // 创建canvas元素
      const canvas = document.createElement('canvas');
      chartContainer.appendChild(canvas);
      
      // 创建图表
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      if (type === 'pie') {
        new ChartJS(ctx, {
          type: 'pie',
          data: pieData,
          options: chartOptions
        });
      } else {
        new ChartJS(ctx, {
          type: 'bar',
          data: barData,
          options: chartOptions
        });
      }
    };
    
    // 渲染图表
    setTimeout(renderChart, 0);
  }, [data, type, title]);

  return null;
};

export default ChartOverlay; 