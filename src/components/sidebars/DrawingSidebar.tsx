import React, { useState, useEffect, useRef } from 'react';
import { X, Square, Circle, Hexagon, Trash2, Table, Download } from 'lucide-react';

/**
 * 侧边栏样式
 */
const sidebarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '350px',
  height: '100%',
  backgroundColor: 'white',
  boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  transition: 'transform 0.3s ease',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

/**
 * 标题区域样式
 */
const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  borderBottom: '1px solid #e0e0e0'
};

/**
 * 关闭按钮样式
 */
const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

/**
 * 工具列表样式
 */
const toolListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '16px'
};

/**
 * 工具分组样式
 */
const toolGroupStyle: React.CSSProperties = {
  marginBottom: '20px'
};

/**
 * 工具分组标题样式
 */
const toolGroupTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '10px',
  color: '#333'
};

/**
 * 工具按钮容器样式
 */
const toolButtonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap'
};

/**
 * 工具按钮样式
 */
const toolButtonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '5px',
  padding: '10px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#e0e0e0',
  borderRadius: '4px',
  background: 'white',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  width: '80px'
};

/**
 * 激活的工具按钮样式
 */
const activeToolButtonStyle: React.CSSProperties = {
  ...toolButtonStyle,
  background: '#f0f0f0',
  borderColor: '#3388ff'
};

/**
 * 工具图标容器样式
 */
const toolIconContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px'
};

/**
 * 工具名称样式
 */
const toolNameStyle: React.CSSProperties = {
  fontSize: '12px',
  textAlign: 'center'
};

/**
 * 分析结果样式
 */
const analysisResultsStyle: React.CSSProperties = {
  padding: '16px',
  borderTop: '1px solid #e0e0e0',
  overflow: 'auto',
  flex: 1
};

/**
 * 选项卡容器样式
 */
const tabsContainerStyle: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid #e0e0e0'
};

/**
 * 选项卡样式
 */
const tabStyle: React.CSSProperties = {
  padding: '12px 16px',
  cursor: 'pointer',
  borderBottom: '2px solid transparent'
};

/**
 * 激活的选项卡样式
 */
const activeTabStyle: React.CSSProperties = {
  padding: '12px 16px',
  cursor: 'pointer',
  borderBottom: '2px solid #3388ff',
  fontWeight: 'bold',
  color: '#3388ff'
};

/**
 * 表格样式
 */
const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '16px'
};

/**
 * 表头单元格样式
 */
const thStyle: React.CSSProperties = {
  padding: '8px',
  textAlign: 'left',
  borderBottom: '2px solid #e0e0e0',
  fontWeight: 'bold'
};

/**
 * 表格单元格样式
 */
const tdStyle: React.CSSProperties = {
  padding: '8px',
  textAlign: 'left',
  borderBottom: '1px solid #e0e0e0'
};

/**
 * 操作按钮容器样式
 */
const actionsContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px',
  borderTop: '1px solid #e0e0e0'
};

/**
 * 操作按钮样式
 */
const actionButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  background: '#f0f0f0',
  cursor: 'pointer'
};

/**
 * 红色操作按钮样式
 */
const redActionButtonStyle: React.CSSProperties = {
  ...actionButtonStyle,
  background: '#fff2f0',
  color: '#ff4d4f'
};

// 绘制数据类型
export interface DrawingData {
  id: string;
  name: string;
  type: string;
  area?: number;
  perimeter?: number;
  points?: number[][];
  startPoint?: [number, number]; // 起点坐标
  endPoint?: [number, number];   // 终点坐标
  createdAt: Date;
}

// 组件属性
interface DrawingSidebarProps {
  onClose: () => void;
  mapRef?: React.RefObject<any>;
}

/**
 * 绘制侧边栏组件 - 合并ROI和表格功能
 */
export const DrawingSidebar: React.FC<DrawingSidebarProps> = ({
  onClose,
  mapRef
}) => {
  // 绘图工具状态
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'draw' | 'data'>('draw');
  const [shapes, setShapes] = useState<DrawingData[]>([]);
  
  // 绘图工具引用
  const rectangleToolRef = useRef<any>(null);
  const circleToolRef = useRef<any>(null);
  const polygonToolRef = useRef<any>(null);
  const currentToolRef = useRef<any>(null);
  
  // 从localStorage加载保存的形状数据
  useEffect(() => {
    try {
      const savedShapes = localStorage.getItem('tianditu-shapes');
      if (savedShapes) {
        const parsedShapes = JSON.parse(savedShapes);
        // 确保日期对象正确转换
        const formattedShapes = parsedShapes.map((shape: any) => ({
          ...shape,
          createdAt: new Date(shape.createdAt)
        }));
        setShapes(formattedShapes);
        
        // 如果有地图实例，将形状绘制到地图上
        if (mapRef?.current) {
          const map = mapRef.current.getMap();
          if (map) {
            // 首先清除地图上的所有覆盖物
            map.clearOverLays();
            
            // 为每个形状添加编号标记
            formattedShapes.forEach((shape: DrawingData, index: number) => {
              if (shape.points && shape.points.length > 0) {
                try {
                  // 计算图形中心点
                  let centerPoint;
                  if (shape.type === 'circle') {
                    centerPoint = new window.T.LngLat(shape.points[0][0], shape.points[0][1]);
                  } else if (shape.type === 'rectangle') {
                    const minX = Math.min(shape.points[0][0], shape.points[2][0]);
                    const maxX = Math.max(shape.points[0][0], shape.points[2][0]);
                    const minY = Math.min(shape.points[0][1], shape.points[2][1]);
                    const maxY = Math.max(shape.points[0][1], shape.points[2][1]);
                    centerPoint = new window.T.LngLat((minX + maxX) / 2, (minY + maxY) / 2);
                  } else {
                    let sumX = 0, sumY = 0;
                    shape.points.forEach(point => {
                      sumX += point[0];
                      sumY += point[1];
                    });
                    centerPoint = new window.T.LngLat(sumX / shape.points.length, sumY / shape.points.length);
                  }
                  
                  // 根据形状类型绘制图形覆盖物
                  if (shape.type === 'rectangle' && shape.points.length >= 4) {
                    const sw = new window.T.LngLat(
                      Math.min(shape.points[0][0], shape.points[2][0]),
                      Math.min(shape.points[0][1], shape.points[2][1])
                    );
                    const ne = new window.T.LngLat(
                      Math.max(shape.points[0][0], shape.points[2][0]),
                      Math.max(shape.points[0][1], shape.points[2][1])
                    );
                    
                    // 创建矩形并添加到地图
                    const rectangle = new window.T.Rectangle(
                      new window.T.LngLatBounds(sw, ne),
                      {
                        color: "#1890ff",
                        weight: 2,
                        opacity: 0.8,
                        fillColor: "#1890ff",
                        fillOpacity: 0.3
                      }
                    );
                    map.addOverLay(rectangle);
                  } else if (shape.type === 'circle' && shape.perimeter) {
                    // 为圆形计算半径（从周长计算）
                    const radius = shape.perimeter / (2 * Math.PI);
                    
                    // 创建圆形并添加到地图
                    const circle = new window.T.Circle(
                      new window.T.LngLat(shape.points[0][0], shape.points[0][1]),
                      radius,
                      {
                        color: "#1890ff",
                        weight: 2,
                        opacity: 0.8,
                        fillColor: "#1890ff",
                        fillOpacity: 0.3
                      }
                    );
                    map.addOverLay(circle);
                  } else if (shape.type === 'polygon' && shape.points.length > 2) {
                    // 创建多边形点数组
                    const lngLats = shape.points.map(point => new window.T.LngLat(point[0], point[1]));
                    
                    // 创建多边形并添加到地图
                    const polygon = new window.T.Polygon(lngLats, {
                      color: "#1890ff",
                      weight: 2,
                      opacity: 0.8,
                      fillColor: "#1890ff",
                      fillOpacity: 0.3
                    });
                    map.addOverLay(polygon);
                  }
                  
                  // 添加起点和终点标记（如果存在）
                  if (shape.startPoint && Array.isArray(shape.startPoint) && shape.startPoint.length === 2) {
                    const startMarker = new window.T.Marker(
                      new window.T.LngLat(shape.startPoint[0], shape.startPoint[1]), 
                      {
                        icon: new window.T.Icon({
                          iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                              <circle cx="8" cy="8" r="6" fill="#4CAF50" stroke="white" stroke-width="1.5" />
                              <text x="8" y="11" font-family="Arial" font-size="8" text-anchor="middle" fill="white">S</text>
                            </svg>
                          `),
                          iconSize: [16, 16],
                          iconAnchor: [8, 8]
                        })
                      }
                    );
                    map.addOverLay(startMarker);
                    
                    // 添加点击事件，显示起点信息
                    startMarker.addEventListener('click', () => {
                      const startInfoWindow = new window.T.InfoWindow(`
                        <div style="padding: 5px;">
                          <p style="margin: 0; font-weight: bold; font-size: 12px;">起点坐标</p>
                          <p style="margin: 0; font-size: 11px;">${formatCoordinate(shape.startPoint![0])}, ${formatCoordinate(shape.startPoint![1])}</p>
                        </div>
                      `);
                      startMarker.openInfoWindow(startInfoWindow);
                    });
                  }
                  
                  if (shape.endPoint && Array.isArray(shape.endPoint) && shape.endPoint.length === 2) {
                    const endMarker = new window.T.Marker(
                      new window.T.LngLat(shape.endPoint[0], shape.endPoint[1]), 
                      {
                        icon: new window.T.Icon({
                          iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                              <circle cx="8" cy="8" r="6" fill="#F44336" stroke="white" stroke-width="1.5" />
                              <text x="8" y="11" font-family="Arial" font-size="8" text-anchor="middle" fill="white">E</text>
                            </svg>
                          `),
                          iconSize: [16, 16],
                          iconAnchor: [8, 8]
                        })
                      }
                    );
                    map.addOverLay(endMarker);
                    
                    // 添加点击事件，显示终点信息
                    endMarker.addEventListener('click', () => {
                      const endInfoWindow = new window.T.InfoWindow(`
                        <div style="padding: 5px;">
                          <p style="margin: 0; font-weight: bold; font-size: 12px;">终点坐标</p>
                          <p style="margin: 0; font-size: 11px;">${formatCoordinate(shape.endPoint![0])}, ${formatCoordinate(shape.endPoint![1])}</p>
                        </div>
                      `);
                      endMarker.openInfoWindow(endInfoWindow);
                    });
                  }
                  
                  // 创建标记点，显示编号
                  if (centerPoint) {
                    // 创建自定义标记图标
                    const labelIcon = new window.T.Icon({
                      iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                          <circle cx="16" cy="16" r="14" fill="#3388ff" fill-opacity="0.8" />
                          <text x="16" y="20" font-family="Arial" font-size="14" text-anchor="middle" fill="white" font-weight="bold">${index + 1}</text>
                        </svg>
                      `),
                      iconSize: [32, 32],
                      iconAnchor: [16, 16]
                    });
                    
                    // 创建标记并添加到地图
                    const marker = new window.T.Marker(centerPoint, {
                      icon: labelIcon
                    });
                    map.addOverLay(marker);
                    
                    // 创建信息窗口
                    const infoWindow = new window.T.InfoWindow(`
                      <div style="padding: 8px; max-width: 250px;">
                        <h4 style="margin: 0 0 8px 0;">${shape.name}</h4>
                        <p style="margin: 4px 0;">面积: ${formatNumber(shape.area)} m²</p>
                        <p style="margin: 4px 0;">周长: ${formatNumber(shape.perimeter)} m</p>
                        <p style="margin: 4px 0; font-weight: bold; color: #1890ff;">编号: ${index + 1}</p>
                        ${shape.startPoint ? `<p style="margin: 4px 0; font-size: 12px;">起点: ${formatCoordinate(shape.startPoint![0])}, ${formatCoordinate(shape.startPoint![1])}</p>` : ''}
                        ${shape.endPoint ? `<p style="margin: 4px 0; font-size: 12px;">终点: ${formatCoordinate(shape.endPoint![0])}, ${formatCoordinate(shape.endPoint![1])}</p>` : ''}
                        <p style="margin: 4px 0; font-size: 11px; color: #888;">点数: ${shape.points ? shape.points.length : 0}</p>
                      </div>
                    `);
                    
                    // 添加点击事件，显示详细信息
                    marker.addEventListener('click', () => {
                      marker.openInfoWindow(infoWindow);
                    });
                  }
                } catch (err) {
                  console.error('重新创建标记失败:', err);
                }
              }
            });
          }
        }
      }
    } catch (err) {
      console.error('加载保存的形状数据失败:', err);
    }
  }, [mapRef]);
  
  // 初始化天地图绘图工具
  useEffect(() => {
    // 确保天地图API和地图实例都已加载
    if (!window.T || !mapRef?.current) return;
    
    try {
      const map = mapRef.current.getMap();
      if (!map) return;
      
      // 工具共用的样式配置
      const toolConfig = {
        showLabel: true,
        color: "#1890ff", 
        weight: 2, 
        opacity: 0.8, 
        fillColor: "#1890ff", 
        fillOpacity: 0.3
      };
      
      // 创建各种绘图工具
      rectangleToolRef.current = new window.T.RectangleTool(map, toolConfig);
      circleToolRef.current = new window.T.CircleTool(map, toolConfig);
      polygonToolRef.current = new window.T.PolygonTool(map, toolConfig);
      
      // 添加事件监听器 - 矩形工具
      rectangleToolRef.current.on('draw', (e: any) => {
        if (!e.overlay) return;
        
        // 获取绘制的矩形边界
        const bounds = e.overlay.getBounds();
        if (!bounds) return;
        
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        
        // 矩形四角坐标
        const points = [
          [sw.lng, sw.lat],
          [ne.lng, sw.lat],
          [ne.lng, ne.lat],
          [sw.lng, ne.lat],
          [sw.lng, sw.lat]
        ];
        
        // 计算矩形面积和周长
        const width = window.T.Tool.getDistance(
          new window.T.LngLat(sw.lng, sw.lat),
          new window.T.LngLat(ne.lng, sw.lat)
        );
        const height = window.T.Tool.getDistance(
          new window.T.LngLat(sw.lng, sw.lat),
          new window.T.LngLat(sw.lng, ne.lat)
        );
        
        const area = width * height;
        const perimeter = 2 * (width + height);
        
        // 创建新的形状数据
        addNewShape('rectangle', area, perimeter, points);
      });
      
      // 添加事件监听器 - 圆形工具
      circleToolRef.current.on('draw', (e: any) => {
        if (!e.overlay) return;
        
        // 获取圆形半径和中心点
        const radius = e.overlay.getRadius();
        const center = e.overlay.getCenter();
        
        // 计算圆形面积和周长
        const area = Math.PI * radius * radius;
        const perimeter = 2 * Math.PI * radius;
        
        // 创建新的形状数据
        addNewShape('circle', area, perimeter, [[center.lng, center.lat]]);
      });
      
      // 添加事件监听器 - 多边形工具
      polygonToolRef.current.on('draw', (e: any) => {
        if (!e.overlay) return;
        
        // 获取多边形路径
        const path = e.overlay.getLngLats();
        if (!path || !path.length) return;
        
        // 转换点坐标
        const points = path.map((lnglat: any) => [lnglat.lng, lnglat.lat]);
        
        // 计算面积
        let area = 0;
        if (window.T.Tool && window.T.Tool.getPolygonArea) {
          area = window.T.Tool.getPolygonArea(path);
        }
        
        // 计算周长
        let perimeter = 0;
        for (let i = 0; i < path.length; i++) {
          const p1 = path[i];
          const p2 = path[(i + 1) % path.length];
          perimeter += window.T.Tool.getDistance(p1, p2);
        }
        
        // 创建新的形状数据
        addNewShape('polygon', area, perimeter, points);
      });
      
      return () => {
        // 清理函数
        closeAllTools();
      };
    } catch (err) {
      console.error('初始化绘图工具失败:', err);
    }
  }, [mapRef]);
  
  // 添加新形状数据
  const addNewShape = (type: string, area: number, perimeter: number, points: number[][]) => {
    // 获取当前编号
    const shapeNumber = shapes.length + 1;
    
    // 提取起点和终点
    let startPoint: [number, number] | undefined;
    let endPoint: [number, number] | undefined;
    
    if (points && points.length > 0) {
      startPoint = [points[0][0], points[0][1]];
      
      if (type === 'rectangle' || type === 'circle') {
        // 矩形和圆形的终点是对角点
        endPoint = points.length > 1 ? [points[points.length - 1][0], points[points.length - 1][1]] : undefined;
      } else if (type === 'polygon' && points.length > 2) {
        // 多边形的终点是最后一个点
        endPoint = [points[points.length - 1][0], points[points.length - 1][1]];
      }
    }
    
    // 创建新的绘制数据
    const newShape: DrawingData = {
      id: `shape-${Date.now()}`,
      name: `${getShapeTypeName(type)}-${shapeNumber}`,
      type,
      area,
      perimeter,
      points,
      startPoint,
      endPoint,
      createdAt: new Date()
    };
    
    // 添加到数据列表
    setShapes(prev => {
      const updatedShapes = [...prev, newShape];
      
      // 将形状数据保存到localStorage
      try {
        localStorage.setItem('tianditu-shapes', JSON.stringify(updatedShapes));
      } catch (err) {
        console.error('保存绘制数据失败:', err);
      }
      
      return updatedShapes;
    });
    
    // 绘制完成后切换到数据选项卡
    setActiveTab('data');
    
    // 在图形上标记编号
    if (mapRef?.current) {
      const map = mapRef.current.getMap();
      if (map) {
        try {
          // 计算图形中心点
          let centerPoint;
          if (type === 'circle') {
            // 圆形的中心点就是第一个点
            centerPoint = new window.T.LngLat(points[0][0], points[0][1]);
          } else if (type === 'rectangle') {
            // 矩形的中心点是对角线的中点
            const minX = Math.min(points[0][0], points[3][0]);
            const maxX = Math.max(points[0][0], points[3][0]);
            const minY = Math.min(points[0][1], points[3][1]);
            const maxY = Math.max(points[0][1], points[3][1]);
            centerPoint = new window.T.LngLat((minX + maxX) / 2, (minY + maxY) / 2);
          } else {
            // 多边形的中心点是所有点的平均值
            let sumX = 0, sumY = 0;
            points.forEach(point => {
              sumX += point[0];
              sumY += point[1];
            });
            centerPoint = new window.T.LngLat(sumX / points.length, sumY / points.length);
          }
          
          // 创建标记点，显示编号
          if (centerPoint) {
            // 创建自定义标记图标
            const labelIcon = new window.T.Icon({
              iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="#3388ff" fill-opacity="0.8" />
                  <text x="16" y="20" font-family="Arial" font-size="14" text-anchor="middle" fill="white" font-weight="bold">${shapeNumber}</text>
                </svg>
              `),
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });
            
            // 创建标记并添加到地图
            const marker = new window.T.Marker(centerPoint, {
              icon: labelIcon
            });
            map.addOverLay(marker);
            
            // 创建信息窗口
            const infoWindow = new window.T.InfoWindow(`
              <div style="padding: 8px; max-width: 250px;">
                <h4 style="margin: 0 0 8px 0;">${newShape.name}</h4>
                <p style="margin: 4px 0;">面积: ${formatNumber(area)} m²</p>
                <p style="margin: 4px 0;">周长: ${formatNumber(perimeter)} m</p>
                <p style="margin: 4px 0; font-weight: bold; color: #1890ff;">编号: ${shapeNumber}</p>
                ${startPoint ? `<p style="margin: 4px 0; font-size: 12px;">起点: ${formatCoordinate(startPoint[0])}, ${formatCoordinate(startPoint[1])}</p>` : ''}
                ${endPoint ? `<p style="margin: 4px 0; font-size: 12px;">终点: ${formatCoordinate(endPoint[0])}, ${formatCoordinate(endPoint[1])}</p>` : ''}
                <p style="margin: 4px 0; font-size: 11px; color: #888;">点数: ${points.length}</p>
              </div>
            `);
            
            // 添加点击事件，显示详细信息
            marker.addEventListener('click', () => {
              marker.openInfoWindow(infoWindow);
            });
            
            // 自动打开信息窗口
            marker.openInfoWindow(infoWindow);
          }
          
          // 标记起点和终点（如果存在）
          if (startPoint) {
            const startMarker = new window.T.Marker(
              new window.T.LngLat(startPoint[0], startPoint[1]), 
              {
                icon: new window.T.Icon({
                  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                      <circle cx="8" cy="8" r="6" fill="#4CAF50" stroke="white" stroke-width="1.5" />
                      <text x="8" y="11" font-family="Arial" font-size="8" text-anchor="middle" fill="white">S</text>
                    </svg>
                  `),
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })
              }
            );
            map.addOverLay(startMarker);
            
            // 添加点击事件，显示起点信息
            startMarker.addEventListener('click', () => {
              const startInfoWindow = new window.T.InfoWindow(`
                <div style="padding: 5px;">
                  <p style="margin: 0; font-weight: bold; font-size: 12px;">起点坐标</p>
                  <p style="margin: 0; font-size: 11px;">${formatCoordinate(startPoint[0])}, ${formatCoordinate(startPoint[1])}</p>
                </div>
              `);
              startMarker.openInfoWindow(startInfoWindow);
            });
          }
          
          if (endPoint) {
            const endMarker = new window.T.Marker(
              new window.T.LngLat(endPoint[0], endPoint[1]), 
              {
                icon: new window.T.Icon({
                  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                      <circle cx="8" cy="8" r="6" fill="#F44336" stroke="white" stroke-width="1.5" />
                      <text x="8" y="11" font-family="Arial" font-size="8" text-anchor="middle" fill="white">E</text>
                    </svg>
                  `),
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })
              }
            );
            map.addOverLay(endMarker);
            
            // 添加点击事件，显示终点信息
            endMarker.addEventListener('click', () => {
              const endInfoWindow = new window.T.InfoWindow(`
                <div style="padding: 5px;">
                  <p style="margin: 0; font-weight: bold; font-size: 12px;">终点坐标</p>
                  <p style="margin: 0; font-size: 11px;">${formatCoordinate(endPoint[0])}, ${formatCoordinate(endPoint[1])}</p>
                </div>
              `);
              endMarker.openInfoWindow(endInfoWindow);
            });
          }
          
          // 根据形状类型绘制图形轮廓
          if (type === 'rectangle') {
            const sw = new window.T.LngLat(
              Math.min(points[0][0], points[2][0]),
              Math.min(points[0][1], points[2][1])
            );
            const ne = new window.T.LngLat(
              Math.max(points[0][0], points[2][0]),
              Math.max(points[0][1], points[2][1])
            );
            
            // 创建矩形并添加到地图
            const rectangle = new window.T.Rectangle(
              new window.T.LngLatBounds(sw, ne),
              {
                color: "#1890ff",
                weight: 2,
                opacity: 0.8,
                fillColor: "#1890ff",
                fillOpacity: 0.3
              }
            );
            map.addOverLay(rectangle);
          } else if (type === 'circle' && points.length > 0) {
            // 为圆形计算半径（在创建圆形时已经计算了半径，这里直接用周长计算）
            const radius = perimeter / (2 * Math.PI);
            
            // 创建圆形并添加到地图
            const circle = new window.T.Circle(
              new window.T.LngLat(points[0][0], points[0][1]),
              radius,
              {
                color: "#1890ff",
                weight: 2,
                opacity: 0.8,
                fillColor: "#1890ff",
                fillOpacity: 0.3
              }
            );
            map.addOverLay(circle);
          } else if (type === 'polygon' && points.length > 0) {
            // 创建多边形点数组
            const lngLats = points.map(point => new window.T.LngLat(point[0], point[1]));
            
            // 创建多边形并添加到地图
            const polygon = new window.T.Polygon(lngLats, {
              color: "#1890ff",
              weight: 2,
              opacity: 0.8,
              fillColor: "#1890ff",
              fillOpacity: 0.3
            });
            map.addOverLay(polygon);
          }
        } catch (err) {
          console.error('创建图形标记失败:', err);
        }
      }
    }
    
    // 重置绘图工具
    setActiveTool(null);
    closeAllTools();
  };
  
  // 关闭所有绘图工具
  const closeAllTools = () => {
    if (rectangleToolRef.current) rectangleToolRef.current.close();
    if (circleToolRef.current) circleToolRef.current.close();
    if (polygonToolRef.current) polygonToolRef.current.close();
    currentToolRef.current = null;
  };
  
  // 获取形状类型名称
  const getShapeTypeName = (type: string) => {
    switch (type) {
      case 'rectangle': return '矩形';
      case 'circle': return '圆形';
      case 'polygon': return '多边形';
      default: return type;
    }
  };
  
  // 处理工具选择
  const handleToolSelect = (toolId: string) => {
    // 如果选择当前激活的工具，则取消选择
    if (activeTool === toolId) {
      setActiveTool(null);
      closeAllTools();
      return;
    }
    
    // 设置激活工具
    setActiveTool(toolId);
    
    // 首先关闭所有工具
    closeAllTools();
    
    try {
      // 激活选择的工具
      switch (toolId) {
        case 'rectangle':
          if (rectangleToolRef.current) {
            rectangleToolRef.current.open();
            currentToolRef.current = rectangleToolRef.current;
          }
          break;
        case 'circle':
          if (circleToolRef.current) {
            circleToolRef.current.open();
            currentToolRef.current = circleToolRef.current;
          }
          break;
        case 'polygon':
          if (polygonToolRef.current) {
            polygonToolRef.current.open();
            currentToolRef.current = polygonToolRef.current;
          }
          break;
      }
    } catch (err) {
      console.error('设置绘图工具失败:', err);
    }
  };
  
  // 清除所有绘制的形状
  const handleClearAll = () => {
    if (window.confirm('确定要清除所有绘制的形状吗？')) {
      // 清空数据列表
      setShapes([]);
      
      // 清除localStorage中保存的数据
      try {
        localStorage.removeItem('tianditu-shapes');
      } catch (err) {
        console.error('清除保存的数据失败:', err);
      }
      
      // 清除地图上的覆盖物
      if (mapRef?.current) {
        const map = mapRef.current.getMap();
        if (map) {
          map.clearOverLays();
        }
      }
    }
  };
  
  // 导出数据为CSV
  const handleExportCSV = () => {
    if (shapes.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    // 创建CSV内容
    const headers = ['编号', '名称', '类型', '面积(m²)', '周长(m)', '起点坐标', '终点坐标', '点数'];
    const rows = shapes.map((shape, index) => [
      index + 1,
      shape.name,
      getShapeTypeName(shape.type),
      shape.area ? shape.area.toFixed(2) : 'N/A',
      shape.perimeter ? shape.perimeter.toFixed(2) : 'N/A',
      shape.startPoint ? `${formatCoordinate(shape.startPoint[0])},${formatCoordinate(shape.startPoint[1])}` : 'N/A',
      shape.endPoint ? `${formatCoordinate(shape.endPoint[0])},${formatCoordinate(shape.endPoint[1])}` : 'N/A',
      shape.points?.length || 0
    ]);
    
    // 组合CSV内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `地图绘制数据-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 格式化数字
  const formatNumber = (num?: number) => {
    if (num === undefined) return 'N/A';
    return num < 0.01 ? num.toExponential(2) : num.toFixed(2);
  };
  
  // 格式化坐标
  const formatCoordinate = (coordinate: number) => {
    return coordinate.toFixed(6);
  };
  
  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>地图绘制</h2>
        <button 
          onClick={onClose}
          style={closeButtonStyle}
          aria-label="关闭"
        >
          <X size={20} />
        </button>
      </div>
      
      <div style={tabsContainerStyle}>
        <div
          style={activeTab === 'draw' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('draw')}
        >
          绘制工具
        </div>
        <div
          style={activeTab === 'data' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('data')}
        >
          数据 ({shapes.length})
        </div>
      </div>
      
      {activeTab === 'draw' && (
        <div style={toolListStyle}>
          <div style={toolGroupStyle}>
            <div style={toolGroupTitleStyle}>绘制工具</div>
            <div style={toolButtonsContainerStyle}>
              <div
                style={activeTool === 'rectangle' ? activeToolButtonStyle : toolButtonStyle}
                onClick={() => handleToolSelect('rectangle')}
              >
                <div style={toolIconContainerStyle}>
                  <Square size={20} />
                </div>
                <div style={toolNameStyle}>矩形</div>
              </div>
              
              <div
                style={activeTool === 'circle' ? activeToolButtonStyle : toolButtonStyle}
                onClick={() => handleToolSelect('circle')}
              >
                <div style={toolIconContainerStyle}>
                  <Circle size={20} />
                </div>
                <div style={toolNameStyle}>圆形</div>
              </div>
              
              <div
                style={activeTool === 'polygon' ? activeToolButtonStyle : toolButtonStyle}
                onClick={() => handleToolSelect('polygon')}
              >
                <div style={toolIconContainerStyle}>
                  <Hexagon size={20} />
                </div>
                <div style={toolNameStyle}>多边形</div>
              </div>
            </div>
          </div>
          
          <div style={{
            padding: '16px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#666'
          }}>
            <p>选择绘制工具后，在地图上点击并拖动来创建形状。</p>
            <p>绘制完成后，形状数据将自动计算并显示在数据选项卡中。</p>
          </div>
        </div>
      )}
      
      {activeTab === 'data' && (
        <div style={analysisResultsStyle}>
          {shapes.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p>还没有绘制数据</p>
              <p>请使用绘制工具在地图上创建形状</p>
            </div>
          ) : (
            <>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>编号</th>
                    <th style={thStyle}>名称</th>
                    <th style={thStyle}>类型</th>
                    <th style={thStyle}>面积(m²)</th>
                    <th style={thStyle}>周长(m)</th>
                    <th style={thStyle}>坐标信息</th>
                  </tr>
                </thead>
                <tbody>
                  {shapes.map((shape, index) => (
                    <tr key={shape.id}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{shape.name}</td>
                      <td style={tdStyle}>{getShapeTypeName(shape.type)}</td>
                      <td style={tdStyle}>{formatNumber(shape.area)}</td>
                      <td style={tdStyle}>{formatNumber(shape.perimeter)}</td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: '11px' }}>
                          {shape.startPoint && (
                            <div>起点: {formatCoordinate(shape.startPoint[0])}, {formatCoordinate(shape.startPoint[1])}</div>
                          )}
                          {shape.endPoint && (
                            <div>终点: {formatCoordinate(shape.endPoint[0])}, {formatCoordinate(shape.endPoint[1])}</div>
                          )}
                          <div>点数: {shape.points?.length || 0}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {shapes.length > 0 && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '4px'
                }}>
                  <h3 style={{margin: '0 0 10px 0', fontSize: '16px'}}>总计统计</h3>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>
                      <div style={{fontWeight: 'bold'}}>总面积</div>
                      <div>{formatNumber(shapes.reduce((sum, shape) => sum + (shape.area || 0), 0))} m²</div>
                    </div>
                    <div>
                      <div style={{fontWeight: 'bold'}}>形状数量</div>
                      <div>{shapes.length}</div>
                    </div>
                    <div>
                      <div style={{fontWeight: 'bold'}}>平均面积</div>
                      <div>{formatNumber(shapes.reduce((sum, shape) => sum + (shape.area || 0), 0) / shapes.length)} m²</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      <div style={actionsContainerStyle}>
        <button style={redActionButtonStyle} onClick={handleClearAll}>
          <Trash2 size={16} />
          清除所有
        </button>
        
        <button 
          style={{...actionButtonStyle, background: '#e6f7ff', color: '#1890ff'}} 
          onClick={handleExportCSV}
          disabled={shapes.length === 0}
        >
          <Download size={16} />
          导出CSV
        </button>
      </div>
    </div>
  );
};

export default DrawingSidebar; 