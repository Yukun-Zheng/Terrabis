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

// 声明全局变量类型扩展，不使用const T
declare global {
  // 扩展Window接口
  interface Window {
    T: any; // 使用any类型简化，解决类型错误
    TIANDITU_API_LOADED?: boolean;
    TIANDITU_API_LOADING?: boolean;
    onTiandituLoaded?: () => void;
    _drawingState: {
      lastCircleCenter: any;
      lastCircleRadius: number;
      lastRectangleBounds: any;
      lastPolygonPoints: any;
      processedEvents: Set<string>;
    };
    _mapClickRecorder: {
      clicks: Array<{lng: number, lat: number}>;
      active: boolean;
      lastClickTime: number;
    };
    _polygonDrawer: {
      points: Array<{lng: number, lat: number}>;
      active: boolean;
    };
    _polygonPoints: Array<{lng: number, lat: number}>;
  }
}

/**
 * 安全的距离计算函数，不依赖天地图API的Tool.getDistance方法
 */
const calculateDistance = (point1: { lng: number, lat: number }, point2: { lng: number, lat: number }): number => {
  // 使用Haversine公式计算两点之间的距离
  const R = 6371000; // 地球半径，单位米
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

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
  const [lastShapeId, setLastShapeId] = useState<string | null>(null);
  
  // 绘图工具引用
  const rectangleToolRef = useRef<any>(null);
  const circleToolRef = useRef<any>(null);
  const polygonToolRef = useRef<any>(null);
  const currentToolRef = useRef<any>(null);
  const tempCircleRef = useRef<any>(null); // 用于存储临时圆形
  
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
                        ${shape.startPoint ? `<p style="margin: 4px 0; font-size: 12px;">起点: ${formatCoordinate(shape.startPoint[0])}, ${formatCoordinate(shape.startPoint[1])}</p>` : ''}
                        ${shape.endPoint ? `<p style="margin: 4px 0; font-size: 12px;">终点: ${formatCoordinate(shape.endPoint[0])}, ${formatCoordinate(shape.endPoint[1])}</p>` : ''}
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
  
  // 处理圆形绘制完成事件 - 重写以正确获取圆心和半径
  const handleCircleToolDraw = (e: any) => {
    console.log('圆形绘制事件触发', e);
    
    // 防止重复处理
    if (window._drawingState && window._drawingState.processedEvents) {
      const eventSignature = `circle-${Date.now()}`;
      if (window._drawingState.processedEvents.has(eventSignature)) return;
      window._drawingState.processedEvents.add(eventSignature);
      setTimeout(() => window._drawingState.processedEvents.delete(eventSignature), 1000);
    }
    
    try {
      // 从事件中获取圆形覆盖物
      const circle = e.overlay || e.target || e;
      if (!circle) {
        console.error('无法获取圆形覆盖物');
        return;
      }
      
      // 获取圆心和半径 - 尝试多种方法
      let center = null;
      let radius = 0;
      
      // 方法1: 使用对象方法获取
      if (typeof circle.getCenter === 'function' && typeof circle.getRadius === 'function') {
        try {
          center = circle.getCenter();
          radius = circle.getRadius();
          console.log('方法1: 使用getCenter和getRadius方法获取成功', {center, radius});
        } catch (err) {
          console.error('使用getCenter/getRadius方法获取失败:', err);
        }
      }
      
      // 方法2: 访问对象属性
      if (!center && circle.center) {
        center = circle.center;
        console.log('方法2: 从center属性获取成功');
      }
      
      if (radius === 0 && typeof circle.radius === 'number') {
        radius = circle.radius;
        console.log('方法2: 从radius属性获取成功:', radius);
      }
      
      // 方法3: 从overlay属性获取
      if ((!center || radius === 0) && e.overlay) {
        if (e.overlay.center) {
          center = e.overlay.center;
          console.log('方法3: 从e.overlay.center获取成功');
        }
        
        if (typeof e.overlay.radius === 'number') {
          radius = e.overlay.radius;
          console.log('方法3: 从e.overlay.radius获取成功:', radius);
        }
      }
      
      // 方法4: 如果存在latlng属性，将其作为中心点
      if (!center && e.latlng) {
        center = e.latlng;
        console.log('方法4: 使用e.latlng作为圆心');
      }
      
      // 方法5: 从全局状态中获取最后记录的圆心和半径
      if ((!center || radius === 0) && window._drawingState) {
        if (!center && window._drawingState.lastCircleCenter) {
          center = window._drawingState.lastCircleCenter;
          console.log('方法5: 从全局状态获取圆心');
        }
        
        if (radius === 0 && window._drawingState.lastCircleRadius > 0) {
          radius = window._drawingState.lastCircleRadius;
          console.log('方法5: 从全局状态获取半径:', radius);
        }
      }
      
      // 方法6: 如果有记录的点击位置，使用第一个点作为圆心
      if (!center && window._mapClickRecorder && window._mapClickRecorder.clicks.length > 0) {
        const firstClick = window._mapClickRecorder.clicks[0];
        center = new window.T.LngLat(firstClick.lng, firstClick.lat);
        console.log('方法6: 使用记录的点击位置作为圆心');
      }
      
      // 方法7: 如果地图上有鼠标最后位置，使用为圆心
      if (!center && mapRef?.current) {
        const map = mapRef.current.getMap();
        if (map && map._lastMousePosition) {
          center = new window.T.LngLat(map._lastMousePosition.lng, map._lastMousePosition.lat);
          console.log('方法7: 使用地图上鼠标最后位置作为圆心');
        }
      }
      
      // 如果仍然没有获取到中心点或半径，使用地图中心作为圆心和默认半径
      if (!center || radius === 0) {
        if (!center && mapRef?.current) {
          const map = mapRef.current.getMap();
          if (map && typeof map.getCenter === 'function') {
            center = map.getCenter();
            console.log('未能获取圆心，使用地图中心代替');
          }
        }
        
        if (radius === 0) {
          // 使用默认半径 (1000米)
          radius = 1000;
          console.log('未能获取半径，使用默认值:', radius);
        }
      }
      
      // 确保获取到了圆心和半径
      if (!center) {
        console.error('无法获取有效的圆心');
        return;
      }
      
      // 提取中心点坐标
      let centerLng, centerLat;
      
      if (typeof center.lng === 'function' && typeof center.lat === 'function') {
        centerLng = center.lng();
        centerLat = center.lat();
      } else {
        centerLng = center.lng;
        centerLat = center.lat;
      }
      
      // 输出获取到的数据
      console.log('圆形数据:', {
        center: { lng: centerLng, lat: centerLat },
        radius: radius
      });
      
      // 创建点数组，只包含中心点
      const points = [[centerLng, centerLat]];
      
      // 计算圆的周长和面积
      const perimeter = 2 * Math.PI * radius;
      const area = Math.PI * radius * radius;
      
      // 保存数据到全局状态
      if (window._drawingState) {
        window._drawingState.lastCircleCenter = center;
        window._drawingState.lastCircleRadius = radius;
      }
      
      // 添加新形状
      addNewShape('circle', area, perimeter, points);
    } catch (err) {
      console.error('处理圆形绘制时出错:', err);
    }
  };
  
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
      
      // 添加矩形工具事件监听 - 使用多种方式确保事件能被捕获
      if (rectangleToolRef.current) {
        try {
          // 方法1: 使用on方法
          rectangleToolRef.current.on('draw', handleRectangleDrawEnd);
          console.log('矩形绘制工具使用on方法初始化完成');
        } catch (err) {
          console.error('使用on方法注册矩形绘制事件失败:', err);
          
          // 方法2: 使用addEventListener方法
          try {
            if (typeof rectangleToolRef.current.addEventListener === 'function') {
              rectangleToolRef.current.addEventListener('draw', handleRectangleDrawEnd);
              console.log('矩形绘制工具使用addEventListener方法初始化完成');
            }
          } catch (err2) {
            console.error('使用addEventListener方法注册矩形绘制事件也失败:', err2);
          }
        }
      }
      
      // 添加圆形工具事件监听 - 使用多种方式确保事件能被捕获
      if (circleToolRef.current) {
        try {
          // 方法1: 使用on方法
          circleToolRef.current.on('draw', handleCircleToolDraw);
          console.log('圆形绘制工具使用on方法初始化完成');
        } catch (err) {
          console.error('使用on方法注册圆形绘制事件失败:', err);
          
          // 方法2: 使用addEventListener方法
          try {
            if (typeof circleToolRef.current.addEventListener === 'function') {
              circleToolRef.current.addEventListener('draw', handleCircleToolDraw);
              console.log('圆形绘制工具使用addEventListener方法初始化完成');
            }
          } catch (err2) {
            console.error('使用addEventListener方法注册圆形绘制事件也失败:', err2);
          }
        }
        
        // 方法3: 额外监听地图上的圆形覆盖物添加事件
        try {
          map.addEventListener('addoverlay', (e: any) => {
            if (e.overlay && 
               ((typeof e.overlay.getRadius === 'function') || 
               (e.overlay.CLASS_NAME && e.overlay.CLASS_NAME.indexOf('Circle') > -1))) {
              console.log('检测到圆形覆盖物添加到地图', e);
              handleCircleToolDraw(e);
            }
          });
          console.log('添加了地图圆形覆盖物监听');
        } catch (err) {
          console.error('注册地图覆盖物事件失败:', err);
        }
      }
      
      // 添加多边形工具事件监听 - 使用多种方式确保事件能被捕获
      if (polygonToolRef.current) {
        try {
          // 方法1: 使用on方法
          polygonToolRef.current.on('draw', handlePolygonDrawEnd);
          console.log('多边形绘制工具使用on方法初始化完成');
        } catch (err) {
          console.error('使用on方法注册多边形绘制事件失败:', err);
          
          // 方法2: 使用addEventListener方法
          try {
            if (typeof polygonToolRef.current.addEventListener === 'function') {
              polygonToolRef.current.addEventListener('draw', handlePolygonDrawEnd);
              console.log('多边形绘制工具使用addEventListener方法初始化完成');
            }
          } catch (err2) {
            console.error('使用addEventListener方法注册多边形绘制事件也失败:', err2);
          }
        }
        
        // 方法3: 额外监听地图上的多边形覆盖物添加事件
        try {
          map.addEventListener('addoverlay', (e: any) => {
            if (e.overlay && 
               ((typeof e.overlay.getPath === 'function') || 
               (e.overlay.CLASS_NAME && e.overlay.CLASS_NAME.indexOf('Polygon') > -1))) {
              console.log('检测到多边形覆盖物添加到地图', e);
              handlePolygonDrawEnd(e);
            }
          });
          console.log('添加了地图多边形覆盖物监听');
        } catch (err) {
          console.error('注册地图覆盖物事件失败:', err);
        }
      }
      
      // 初始化全局绘图状态
      window._drawingState = {
        lastCircleCenter: null,
        lastCircleRadius: 0,
        lastRectangleBounds: null,
        lastPolygonPoints: null,
        processedEvents: new Set() // 用于防止事件重复处理
      };
      
      console.log('绘图工具初始化完成');
      
      // 添加清理函数
      return () => {
        // 清理事件监听器和工具
        try {
          if (rectangleToolRef.current) {
            rectangleToolRef.current.close();
          }
          if (circleToolRef.current) {
            circleToolRef.current.close();
          }
          if (polygonToolRef.current) {
            polygonToolRef.current.close();
          }
        } catch (err) {
          console.error('清理绘图工具失败:', err);
        }
      };
    } catch (err) {
      console.error('初始化绘图工具失败:', err);
    }
  }, [mapRef]);
  
  // 在useEffect中添加地图点击记录功能
  useEffect(() => {
    // 确保天地图API和地图实例都已加载
    if (!window.T || !mapRef?.current) return;
    
    try {
      const map = mapRef.current.getMap();
      if (!map) return;
      
      // 初始化点击记录器
      if (!window._mapClickRecorder) {
        window._mapClickRecorder = {
          clicks: [],
          active: false,
          lastClickTime: 0
        };
      }
      
      // 添加点击监听器
      const clickHandler = function(e: any) {
        if (!window._mapClickRecorder.active) return;
        
        const now = Date.now();
        // 防抖，忽略300ms内的连续点击
        if (now - window._mapClickRecorder.lastClickTime < 300) return;
        window._mapClickRecorder.lastClickTime = now;
        
        const latlng = e.latlng;
        if (!latlng) return;
        
        const point = {
          lng: typeof latlng.lng === 'function' ? latlng.lng() : latlng.lng,
          lat: typeof latlng.lat === 'function' ? latlng.lat() : latlng.lat
        };
        
        window._mapClickRecorder.clicks.push(point);
        console.log('记录点击位置:', point, '当前共有', window._mapClickRecorder.clicks.length, '个点');
      };
      
      // 添加点击监听器
      map.addEventListener('click', clickHandler);
      
        // 清理函数
      return () => {
        try {
          map.removeEventListener('click', clickHandler);
        } catch (err) {
          console.error('移除点击监听器失败:', err);
        }
      };
    } catch (err) {
      console.error('添加地图点击记录器失败:', err);
    }
  }, [mapRef]);
  
  // 处理工具选择
  const handleToolSelect = (toolId: string) => {
    // 如果选择当前激活的工具，则取消选择
    if (activeTool === toolId) {
      setActiveTool(null);
      closeAllTools();
      
      // 停用点击记录
      if (window._mapClickRecorder) {
        window._mapClickRecorder.active = false;
      }
      
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
            console.log('矩形绘制工具已激活');
          }
          
          // 停用点击记录
          if (window._mapClickRecorder) {
            window._mapClickRecorder.active = false;
            window._mapClickRecorder.clicks = [];
          }
          
          // 显示提示
          showDrawingNotification('矩形绘制模式已激活，点击地图并拖动创建矩形');
          break;
          
        case 'circle':
          if (circleToolRef.current) {
            circleToolRef.current.open();
            currentToolRef.current = circleToolRef.current;
            console.log('圆形绘制工具已激活');
          }
          
          // 停用点击记录
          if (window._mapClickRecorder) {
            window._mapClickRecorder.active = false;
            window._mapClickRecorder.clicks = [];
          }
          
          // 显示提示
          showDrawingNotification('圆形绘制模式已激活，点击地图选择圆心，拖动确定半径');
          break;
          
        case 'polygon':
          if (polygonToolRef.current) {
            polygonToolRef.current.open();
            currentToolRef.current = polygonToolRef.current;
            console.log('多边形绘制工具已激活');
          }
          
          // 激活点击记录
          if (window._mapClickRecorder) {
            window._mapClickRecorder.active = true;
            window._mapClickRecorder.clicks = [];
          }
          
          // 显示提示
          showDrawingNotification('多边形绘制模式已激活，点击地图添加点，双击完成绘制');
          break;
      }
    } catch (err) {
      console.error('设置绘图工具失败:', err);
    }
  };
  
  // 显示绘制提示通知
  const showDrawingNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 128, 255, 0.9);
      color: white;
      padding: 10px 16px;
      border-radius: 4px;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        try {
          document.body.removeChild(notification);
        } catch (e) {}
      }, 300);
    }, 5000);
  };
  
  // 添加新形状数据
  const addNewShape = (type: string, area: number, perimeter: number, points: number[][]) => {
    console.log('添加新形状:', { type, area, perimeter, points });
    
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
      id: `shape-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: `${getShapeTypeName(type)}-${shapeNumber}`,
      type,
      area,
      perimeter,
      points,
      startPoint,
      endPoint,
      createdAt: new Date()
    };
    
    console.log('新创建的形状对象:', newShape);
    
    // 添加到数据列表 - 使用函数式更新保证基于最新状态
    setShapes(prev => {
      const updatedShapes = [...prev, newShape];
      
      // 将形状数据保存到localStorage
      try {
        localStorage.setItem('tianditu-shapes', JSON.stringify(updatedShapes));
        console.log('形状数据已保存到localStorage，当前数量:', updatedShapes.length);
        // 诊断输出：确认保存的数据结构
        console.log('localStorage中的形状数量:', {count: updatedShapes.length});
        
        // 将形状对象的详细信息输出到控制台以便调试
        console.log('保存到localStorage的形状:', 
          updatedShapes.map(s => ({
            id: s.id,
            type: s.type,
            area: s.area,
            perimeter: s.perimeter,
            points: s.points ? s.points.length : 0
          }))
        );
      } catch (err) {
        console.error('保存绘制数据失败:', err);
      }
      
      // 诊断输出：确认React状态更新
      console.log('当前React状态中的形状数量:', {count: updatedShapes.length});
      
      return updatedShapes;
    });
    
    // 记录最新添加的形状ID，用于高亮显示
    setLastShapeId(newShape.id);
    
    // 绘制完成后切换到数据选项卡
    setActiveTab('data');
    
    // 显示成功提示
    showDrawingNotification(`${getShapeTypeName(type)}绘制成功！面积: ${formatNumber(area)}m²，周长: ${formatNumber(perimeter)}m`);
    
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
            
            console.log('矩形已添加到地图', rectangle);
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
            
            console.log('圆形已添加到地图', {
              center: points[0],
              radius: radius,
              circle: circle
            });
          } else if (type === 'polygon' && points.length > 0) {
            // 创建多边形点数组
            const lngLats = points.map(point => new window.T.LngLat(point[0], point[1]));
            
            // 创建多边形并添加到地图
            const polygon = new window.T.Polygon(lngLats, {
              color: "#1890ff",
              weight: 2,
              opacity: 0.8,
              fillColor: "#1890ff",
              fillOpacity: 0.3,
              lineStyle: "solid"
            });
            map.addOverLay(polygon);
            
            console.log('多边形已添加到地图', {
              points: points.length,
              polygon: polygon
            });
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
  
  // 处理矩形绘制完成事件 - 按照天地图API示例重构
  const handleRectangleDrawEnd = (e: any) => {
    console.log('矩形绘制事件触发', e);
    
    // 防止重复处理
    if (window._drawingState && window._drawingState.processedEvents) {
      const eventSignature = `rectangle-${Date.now()}`;
      if (window._drawingState.processedEvents.has(eventSignature)) return;
      window._drawingState.processedEvents.add(eventSignature);
      setTimeout(() => window._drawingState.processedEvents.delete(eventSignature), 1000);
    }
    
    try {
      // 从事件中获取矩形覆盖物
      const rectangle = e.overlay || e.target || e;
      if (!rectangle) {
        console.error('无法获取矩形覆盖物');
        return;
      }
      
      // 获取矩形的边界 - 尝试多种方法
      let bounds = null;
      
      // 方法1: 使用getBounds方法获取边界
      if (typeof rectangle.getBounds === 'function') {
        try {
          bounds = rectangle.getBounds();
          console.log('方法1: 使用getBounds方法获取成功');
        } catch (err) {
          console.error('使用getBounds方法获取失败:', err);
        }
      }
      
      // 方法2: 直接访问bounds属性
      if (!bounds && rectangle.bounds) {
        bounds = rectangle.bounds;
        console.log('方法2: 从bounds属性获取成功');
      }
      
      // 方法3: 从overlay中获取
      if (!bounds && e.overlay && e.overlay.bounds) {
        bounds = e.overlay.bounds;
        console.log('方法3: 从e.overlay.bounds属性获取成功');
      }
      
      // 方法4: 尝试获取矩形的四个角点
      let sw, ne;
      if (!bounds) {
        if (rectangle.getPoints && typeof rectangle.getPoints === 'function') {
          try {
            const points = rectangle.getPoints();
            if (points && points.length >= 2) {
              // 假设points数组包含矩形的对角点
              sw = points[0];
              ne = points[1];
              console.log('方法4: 从getPoints方法获取成功');
            }
          } catch (err) {
            console.error('使用getPoints方法获取失败:', err);
          }
        }
      }
      
      // 方法5: 从全局状态获取最后记录的边界
      if (!bounds && !sw && !ne && window._drawingState && window._drawingState.lastRectangleBounds) {
        const lastBounds = window._drawingState.lastRectangleBounds;
        sw = lastBounds.sw;
        ne = lastBounds.ne;
        console.log('方法5: 从全局状态获取成功');
      }
      
      // 从边界获取西南和东北角点
      if (bounds && !sw && !ne) {
        if (typeof bounds.getSouthWest === 'function' && typeof bounds.getNorthEast === 'function') {
          sw = bounds.getSouthWest();
          ne = bounds.getNorthEast();
        } else if (bounds.sw && bounds.ne) {
          sw = bounds.sw;
          ne = bounds.ne;
        } else if (bounds._southWest && bounds._northEast) {
          sw = bounds._southWest;
          ne = bounds._northEast;
        }
      }
      
      // 如果无法获取角点，创建默认矩形
      if (!sw || !ne) {
        console.error('无法获取矩形角点，将尝试创建默认矩形');
        
        // 获取地图中心
        if (mapRef?.current) {
          const map = mapRef.current.getMap();
          if (map && typeof map.getCenter === 'function') {
            const center = map.getCenter();
            const centerLng = typeof center.lng === 'function' ? center.lng() : center.lng;
            const centerLat = typeof center.lat === 'function' ? center.lat() : center.lat;
            
            // 创建一个以地图中心为中心的矩形，大小约为500米
            const offset = 0.005; // 经纬度偏移约500米
            sw = new window.T.LngLat(centerLng - offset, centerLat - offset);
            ne = new window.T.LngLat(centerLng + offset, centerLat + offset);
            console.log('已创建默认矩形');
          }
        }
        
        if (!sw || !ne) {
          console.error('无法创建默认矩形');
          return;
        }
      }
      
      // 提取经纬度值
      let swLng, swLat, neLng, neLat;
      
      if (typeof sw.lng === 'function' && typeof sw.lat === 'function') {
        swLng = sw.lng();
        swLat = sw.lat();
      } else {
        swLng = sw.lng;
        swLat = sw.lat;
      }
      
      if (typeof ne.lng === 'function' && typeof ne.lat === 'function') {
        neLng = ne.lng();
        neLat = ne.lat();
      } else {
        neLng = ne.lng;
        neLat = ne.lat;
      }
      
      // 记录调试信息
      console.log('矩形角点:', {
        sw: { lng: swLng, lat: swLat },
        ne: { lng: neLng, lat: neLat }
      });
      
      // 构建矩形的点数组
      const points = [
        [swLng, swLat],   // 左下
        [neLng, swLat],   // 右下
        [neLng, neLat],   // 右上
        [swLng, neLat],   // 左上
        [swLng, swLat]    // 回到左下(闭合)
      ];
      
      // 计算矩形的宽度和高度（以米为单位）
      const swPoint = {lng: swLng, lat: swLat};
      const sePoint = {lng: neLng, lat: swLat};
      const nwPoint = {lng: swLng, lat: neLat};
      
      const width = calculateDistance(swPoint, sePoint);
      const height = calculateDistance(swPoint, nwPoint);
      
      // 计算面积和周长
      const area = width * height;
      const perimeter = 2 * (width + height);
      
      console.log('矩形数据:', {
        points,
        width: width.toFixed(2) + 'm',
        height: height.toFixed(2) + 'm',
        area: area.toFixed(2) + 'm²',
        perimeter: perimeter.toFixed(2) + 'm'
      });
      
      // 保存数据到全局状态
      if (window._drawingState) {
        window._drawingState.lastRectangleBounds = { sw, ne };
      }
      
      // 添加新形状
      addNewShape('rectangle', area, perimeter, points);
    } catch (err) {
      console.error('处理矩形绘制时出错:', err);
    }
  };
  
  // 处理多边形绘制完成事件 - 按照天地图API示例重构
  const handlePolygonDrawEnd = (e: any) => {
    console.log('多边形绘制事件触发', e);
    
    // 防止重复处理
    if (window._drawingState && window._drawingState.processedEvents) {
      const eventSignature = `polygon-${Date.now()}`;
      if (window._drawingState.processedEvents.has(eventSignature)) return;
      window._drawingState.processedEvents.add(eventSignature);
      setTimeout(() => window._drawingState.processedEvents.delete(eventSignature), 1000);
    }
    
    try {
      // 从事件中获取多边形覆盖物
      const polygon = e.overlay || e.target || e;
      if (!polygon) {
        console.error('无法获取多边形覆盖物');
        return;
      }
      
      // 尝试获取多边形的路径点 - 尝试多种方法
      let path = null;
      
      // 方法1: 使用getPath方法获取路径
      if (typeof polygon.getPath === 'function') {
        try {
          path = polygon.getPath();
          console.log('方法1: 使用getPath方法获取成功');
        } catch (err) {
          console.error('使用getPath方法获取失败:', err);
        }
      }
      
      // 方法2: 使用getLngLats方法
      if (!path && typeof polygon.getLngLats === 'function') {
        try {
          path = polygon.getLngLats();
          console.log('方法2: 使用getLngLats方法获取成功');
        } catch (err) {
          console.error('使用getLngLats方法获取失败:', err);
        }
      }
      
      // 方法3: 直接访问属性
      if (!path) {
        if (polygon.path) {
          path = polygon.path;
          console.log('方法3: 从path属性获取成功');
        } else if (polygon.points) {
          path = polygon.points;
          console.log('方法3: 从points属性获取成功');
        } else if (polygon.latlngs) {
          path = polygon.latlngs;
          console.log('方法3: 从latlngs属性获取成功');
        }
      }
      
      // 方法4: 从overlay属性获取
      if (!path && e.overlay) {
        if (e.overlay.path) {
          path = e.overlay.path;
          console.log('方法4: 从e.overlay.path获取成功');
        } else if (e.overlay.points) {
          path = e.overlay.points;
          console.log('方法4: 从e.overlay.points获取成功');
        } else if (e.overlay.latlngs) {
          path = e.overlay.latlngs;
          console.log('方法4: 从e.overlay.latlngs获取成功');
        }
      }
      
      // 方法5: 使用记录的点击位置作为路径点
      if ((!path || !Array.isArray(path) || path.length < 3) && 
          window._mapClickRecorder && 
          window._mapClickRecorder.clicks && 
          window._mapClickRecorder.clicks.length >= 3) {
        path = window._mapClickRecorder.clicks;
        console.log('方法5: 使用记录的点击位置作为路径点');
      }
      
      // 方法6: 从全局状态获取最后记录的多边形点
      if ((!path || !Array.isArray(path) || path.length < 3) && 
          window._drawingState && 
          window._drawingState.lastPolygonPoints && 
          window._drawingState.lastPolygonPoints.length >= 3) {
        path = window._drawingState.lastPolygonPoints;
        console.log('方法6: 从全局状态获取成功');
      }
      
      if (!path || !Array.isArray(path) || path.length < 3) {
        console.error('无法获取有效的多边形路径点');
        
        // 方法7: 创建默认三角形
        if (mapRef?.current) {
          const map = mapRef.current.getMap();
          if (map && typeof map.getCenter === 'function') {
            const center = map.getCenter();
            const centerLng = typeof center.lng === 'function' ? center.lng() : center.lng;
            const centerLat = typeof center.lat === 'function' ? center.lat() : center.lat;
            
            // 创建一个以地图中心为中心的三角形
            const offset = 0.005; // 经纬度偏移约500米
            path = [
              {lng: centerLng, lat: centerLat + offset},
              {lng: centerLng - offset, lat: centerLat - offset},
              {lng: centerLng + offset, lat: centerLat - offset}
            ];
            console.log('已创建默认三角形');
          }
        }
        
        if (!path || path.length < 3) {
          console.error('无法创建默认多边形');
          return;
        }
      }
      
      // 转换路径点为标准格式
      const points = path.map((point: any) => {
        if (point && typeof point === 'object') {
          if ('lng' in point && 'lat' in point) {
            // 处理{lng, lat}格式
            const lng = typeof point.lng === 'function' ? point.lng() : point.lng;
            const lat = typeof point.lat === 'function' ? point.lat() : point.lat;
            return [lng, lat];
          } else if (typeof point.getLng === 'function' && typeof point.getLat === 'function') {
            // 处理LngLat对象
            return [point.getLng(), point.getLat()];
          } else if (Array.isArray(point) && point.length >= 2) {
            // 处理[lng, lat]数组
            return [point[0], point[1]];
          }
        }
        console.warn('无法解析点格式:', point);
        return null;
      }).filter((p): p is number[] => p !== null);
      
      // 确保多边形闭合
      if (points.length > 0 && 
          (points[0][0] !== points[points.length - 1][0] || 
           points[0][1] !== points[points.length - 1][1])) {
        points.push([points[0][0], points[0][1]]);
      }
      
      if (points.length < 4) { // 至少需要3个点加1个闭合点
        console.error('有效点数不足以形成多边形');
        return;
      }
      
      // 计算面积
      const area = calculatePolygonArea(points);
      
      // 计算周长
      let perimeter = 0;
      for (let i = 0; i < points.length - 1; i++) {
        perimeter += calculateDistance(
          {lng: points[i][0], lat: points[i][1]},
          {lng: points[i+1][0], lat: points[i+1][1]}
        );
      }
      
      console.log('多边形数据:', {
        points: points.length,
        coordinates: points,
        area: area.toFixed(2) + 'm²',
        perimeter: perimeter.toFixed(2) + 'm'
      });
      
      // 保存数据到全局状态
      if (window._drawingState) {
        window._drawingState.lastPolygonPoints = points;
      }
      
      // 添加新形状
      addNewShape('polygon', area, perimeter, points);
    } catch (err) {
      console.error('处理多边形绘制时出错:', err);
    }
  };
  
  // 辅助函数：计算多边形面积（平面坐标系近似值）
  const calculatePolygonArea = (points: number[][]) => {
    let area = 0;
    // 使用叉乘法计算多边形面积
    for (let i = 0; i < points.length - 1; i++) {
      area += points[i][0] * points[i+1][1] - points[i+1][0] * points[i][1];
    }
    // 取绝对值并除以2
    area = Math.abs(area) / 2;
    
    // 将经纬度面积转换为平方米（近似计算）
    // 经度1度在赤道约为111km，纬度1度恒为111km
    // 由于经度间距随纬度变化，我们取多边形中心纬度来计算
    const avgLat = points.reduce((sum: number, p: number[]) => sum + p[1], 0) / points.length;
    const latFactor = 111000; // 纬度1度约为111000米
    const lngFactor = 111000 * Math.cos(avgLat * Math.PI / 180); // 经度1度的米数
    
    return area * latFactor * lngFactor;
  };
  
  // 交互式圆形绘制模式
  const startCircleDrawMode = () => {
    if (!mapRef?.current || !mapRef.current.getMap()) return;
    
    const map = mapRef.current.getMap();
    
    // 关闭当前工具并打开圆形工具
    closeAllTools();
    
    if (circleToolRef.current) {
      circleToolRef.current.open();
      currentToolRef.current = circleToolRef.current;
    }
    
    // 显示提示消息
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 128, 255, 0.9);
      color: white;
      padding: 10px 16px;
      border-radius: 4px;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    `;
    notification.textContent = '请点击地图选择圆心位置，然后拖动确定半径';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        try {
          document.body.removeChild(notification);
        } catch (e) {}
      }, 300);
    }, 5000);
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

  // 重置所有数据
  const handleResetAll = () => {
    if (window.confirm('确定要重置所有数据吗？这将清除所有形状数据。')) {
      // 清除localStorage
      localStorage.removeItem('tianditu-shapes');
      
      // 清除状态
      setShapes([]);
      
      // 清除地图上的所有覆盖物
      if (mapRef?.current) {
        const map = mapRef.current.getMap();
        if (map && typeof map.clearOverLays === 'function') {
          map.clearOverLays();
        }
      }
      
      console.log('所有数据已重置');
    }
  };

  // 添加鼠标位置跟踪
  useEffect(() => {
    // 确保天地图API和地图实例都已加载
    if (!window.T || !mapRef?.current) return;
    
    try {
      const map = mapRef.current.getMap();
      if (!map) return;
      
      // 添加鼠标移动监听器
      const mouseMoveHandler = function(e: any) {
        if (!e.latlng) return;
        
        // 保存最后的鼠标位置
        map._lastMousePosition = {
          lng: typeof e.latlng.lng === 'function' ? e.latlng.lng() : e.latlng.lng,
          lat: typeof e.latlng.lat === 'function' ? e.latlng.lat() : e.latlng.lat
        };
      };
      
      // 添加监听器
      map.addEventListener('mousemove', mouseMoveHandler);
      
      // 清理函数
      return () => {
        try {
          map.removeEventListener('mousemove', mouseMoveHandler);
        } catch (err) {
          console.error('移除鼠标移动监听器失败:', err);
        }
      };
    } catch (err) {
      console.error('添加鼠标位置跟踪失败:', err);
    }
  }, [mapRef]);

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
              <div style={{
                marginTop: '16px',
                padding: '10px',
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '4px',
                color: '#52c41a',
                fontSize: '13px'
              }}>
                <p>诊断信息:</p>
                <p>React状态中的形状: {shapes.length}</p>
                <p>localStorage中的形状: {(() => {
                  try {
                    const saved = localStorage.getItem('tianditu-shapes');
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      return Array.isArray(parsed) ? parsed.length : '数据不是数组';
                    }
                    return '无数据';
                  } catch (e) {
                    return '读取错误';
                  }
                })()}</p>
                <button 
                  onClick={() => {
                    // 尝试从localStorage重新加载数据
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
                        alert(`已重新加载${formattedShapes.length}个形状`);
                      } else {
                        alert('localStorage中没有保存的形状数据');
                      }
                    } catch (err) {
                      console.error('重新加载数据失败:', err);
                      alert('重新加载数据失败: ' + (err instanceof Error ? err.message : String(err)));
                    }
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#52c41a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  重新加载数据
                </button>
                
                <div style={{marginTop: '10px'}}>
                  <button 
                    onClick={() => {
                      // 测试手动创建形状
                      if (!mapRef?.current) {
                        alert('地图实例未加载');
                        return;
                      }
                      
                      const map = mapRef.current.getMap();
                      if (!map) {
                        alert('无法获取地图对象');
                        return;
                      }
                      
                      try {
                        // 获取地图中心
                        const center = map.getCenter();
                        const centerLng = typeof center.lng === 'function' ? center.lng() : center.lng;
                        const centerLat = typeof center.lat === 'function' ? center.lat() : center.lat;
                        
                        // 创建测试圆形
                        const radius = 1000; // 1000米半径
                        const circle = new window.T.Circle(
                          new window.T.LngLat(centerLng, centerLat),
                          radius,
                          {
                            color: "#ff4500",
                            weight: 2,
                            opacity: 0.8,
                            fillColor: "#ff4500",
                            fillOpacity: 0.3
                          }
                        );
                        
                        // 添加到地图
                        map.addOverLay(circle);
                        
                        // 手动触发圆形处理
                        const mockEvent = {
                          overlay: circle,
                          target: circle
                        };
                        
                        // 调用处理函数
                        handleCircleToolDraw(mockEvent);
                        
                        alert('测试圆形已创建并处理');
                      } catch (err) {
                        console.error('测试创建圆形失败:', err);
                        alert('测试创建圆形失败: ' + (err instanceof Error ? err.message : String(err)));
                      }
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#fa8c16',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}
                  >
                    测试圆形
                  </button>
                  
                  <button 
                    onClick={() => {
                      // 测试手动创建矩形
                      if (!mapRef?.current) {
                        alert('地图实例未加载');
                        return;
                      }
                      
                      const map = mapRef.current.getMap();
                      if (!map) {
                        alert('无法获取地图对象');
                        return;
                      }
                      
                      try {
                        // 获取地图中心
                        const center = map.getCenter();
                        const centerLng = typeof center.lng === 'function' ? center.lng() : center.lng;
                        const centerLat = typeof center.lat === 'function' ? center.lat() : center.lat;
                        
                        // 创建矩形边界
                        const offset = 0.005; // 经纬度偏移约500米
                        const sw = new window.T.LngLat(centerLng - offset, centerLat - offset);
                        const ne = new window.T.LngLat(centerLng + offset, centerLat + offset);
                        const bounds = new window.T.LngLatBounds(sw, ne);
                        
                        // 创建测试矩形
                        const rectangle = new window.T.Rectangle(
                          bounds,
                          {
                            color: "#1890ff",
                            weight: 2,
                            opacity: 0.8,
                            fillColor: "#1890ff",
                            fillOpacity: 0.3
                          }
                        );
                        
                        // 添加到地图
                        map.addOverLay(rectangle);
                        
                        // 手动触发矩形处理
                        const mockEvent = {
                          overlay: rectangle,
                          target: rectangle
                        };
                        
                        // 调用处理函数
                        handleRectangleDrawEnd(mockEvent);
                        
                        alert('测试矩形已创建并处理');
                      } catch (err) {
                        console.error('测试创建矩形失败:', err);
                        alert('测试创建矩形失败: ' + (err instanceof Error ? err.message : String(err)));
                      }
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}
                  >
                    测试矩形
                  </button>
                  
                  <button 
                    onClick={() => {
                      // 测试手动创建多边形
                      if (!mapRef?.current) {
                        alert('地图实例未加载');
                        return;
                      }
                      
                      const map = mapRef.current.getMap();
                      if (!map) {
                        alert('无法获取地图对象');
                        return;
                      }
                      
                      try {
                        // 获取地图中心
                        const center = map.getCenter();
                        const centerLng = typeof center.lng === 'function' ? center.lng() : center.lng;
                        const centerLat = typeof center.lat === 'function' ? center.lat() : center.lat;
                        
                        // 创建多边形点
                        const offset = 0.005; // 经纬度偏移约500米
                        const points = [
                          new window.T.LngLat(centerLng, centerLat + offset),
                          new window.T.LngLat(centerLng - offset, centerLat - offset),
                          new window.T.LngLat(centerLng + offset, centerLat - offset)
                        ];
                        
                        // 创建测试多边形
                        const polygon = new window.T.Polygon(points, {
                          color: "#722ed1",
                          weight: 2,
                          opacity: 0.8,
                          fillColor: "#722ed1",
                          fillOpacity: 0.3
                        });
                        
                        // 添加到地图
                        map.addOverLay(polygon);
                        
                        // 手动触发多边形处理
                        const mockEvent = {
                          overlay: polygon,
                          target: polygon
                        };
                        
                        // 调用处理函数
                        handlePolygonDrawEnd(mockEvent);
                        
                        alert('测试多边形已创建并处理');
                      } catch (err) {
                        console.error('测试创建多边形失败:', err);
                        alert('测试创建多边形失败: ' + (err instanceof Error ? err.message : String(err)));
                      }
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#722ed1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    测试多边形
                  </button>
                </div>
              </div>
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