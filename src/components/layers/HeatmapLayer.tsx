import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import simpleheat from 'simpleheat';
import ReactDOM from 'react-dom';

interface HeatPoint {
  lng: number;
  lat: number;
  count: number;
}

interface HeatmapLayerProps {
  map: any;
  data: HeatPoint[];
  visible?: boolean;
  opacity?: number;
  radius?: number;
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  map,
  data,
  visible = true,
  opacity = 0.7,
  radius = 25
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatRef = useRef<any>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // 获取地图容器
  useEffect(() => {
    if (!map) return;
    const mapDiv = map.getContainer ? map.getContainer() : document.getElementById('tianditu-map');
    setContainer(mapDiv);
  }, [map]);

  // 绑定地图事件
  useEffect(() => {
    if (!map) return;
    const redraw = () => drawHeatmap();
    map.addEventListener('moveend', redraw);
    map.addEventListener('zoomend', redraw);
    map.addEventListener('resize', redraw);
    map.addEventListener('movestart', redraw);
    map.addEventListener('zoomstart', redraw);
    return () => {
      map.removeEventListener('moveend', redraw);
      map.removeEventListener('zoomend', redraw);
      map.removeEventListener('resize', redraw);
      map.removeEventListener('movestart', redraw);
      map.removeEventListener('zoomstart', redraw);
    };
  }, [map, data]);

  // 绘制热力图
  const drawHeatmap = () => {
    if (!map || !canvasRef.current || !visible) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // 设置canvas大小与地图容器一致
    const mapDiv = container;
    if (!mapDiv) return;
    canvas.width = mapDiv.offsetWidth;
    canvas.height = mapDiv.offsetHeight;
    // 获取当前地图缩放级别
    const zoom = map.getZoom ? map.getZoom() : 12;
    // 计算缩放因子（以12级为基准，每级缩放2倍）
    const baseZoom = 12;
    const scale = Math.pow(2, zoom - baseZoom);
    // 经纬度转像素
    const points = data.map(pt => {
      const pixel = map.lngLatToContainerPoint ? map.lngLatToContainerPoint(new window.T.LngLat(pt.lng, pt.lat)) : map.lngLatToPoint(new window.T.LngLat(pt.lng, pt.lat));
      return [pixel.x, pixel.y, pt.count];
    });
    // 初始化simpleheat
    if (!heatRef.current) {
      heatRef.current = simpleheat(canvas);
    }
    heatRef.current.data(points);
    // 动态调整半径
    heatRef.current.radius(radius * scale, (radius * scale) / 2);
    heatRef.current._max = Math.max(1, ...data.map(pt => pt.count));
    if (canvas.width > 0 && canvas.height > 0) {
      heatRef.current.draw(opacity);
    }
  };

  // 每次数据或可见性变化时重绘
  useEffect(() => {
    drawHeatmap();
  }, [data, visible, opacity, radius, map, container]);

  // 隐藏时清空canvas
  useEffect(() => {
    if (!visible && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [visible]);

  // 通过Portal渲染canvas到地图容器
  if (!container) return null;
  return ReactDOM.createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity
      }}
    />,
    container
  );
};

export default HeatmapLayer; 