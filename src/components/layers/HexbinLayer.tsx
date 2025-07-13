import React, { useEffect, useRef, useState } from 'react';
import { hexbin as d3hexbin } from 'd3-hexbin';
// @ts-ignore
// d3-hexbin无类型声明，直接用any
import ReactDOM from 'react-dom';

interface HexPoint {
  lng: number;
  lat: number;
  count: number;
}

interface HexbinLayerProps {
  map: any;
  data: HexPoint[];
  visible?: boolean;
  opacity?: number;
  resolution?: number;
  colorRange?: string[];
}

const defaultColorRange = ['#e0ecf4', '#9ebcda', '#8c96c6', '#8856a7', '#810f7c'];

const HexbinLayer: React.FC<HexbinLayerProps> = ({
  map,
  data,
  visible = true,
  opacity = 0.7,
  resolution = 30,
  colorRange = defaultColorRange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  
  // 获取地图容器
  useEffect(() => {
    if (!map) return;
    const mapDiv = map.getContainer ? map.getContainer() : document.getElementById('tianditu-map');
    setContainer(mapDiv);
  }, [map]);

  useEffect(() => {
    if (!map) return;
    const redraw = () => drawHexbin();
    map.addEventListener('moveend', redraw);
    map.addEventListener('zoomend', redraw);
    return () => {
      map.removeEventListener('moveend', redraw);
      map.removeEventListener('zoomend', redraw);
    };
  }, [map, data]);

  const drawHexbin = () => {
    if (!map || !canvasRef.current || !visible) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const mapDiv = container;
    if (!mapDiv) return;
    canvas.width = mapDiv.offsetWidth;
    canvas.height = mapDiv.offsetHeight;
    const points: [number, number, number][] = data.map(pt => {
      const pixel = map.lngLatToContainerPoint ? map.lngLatToContainerPoint(new window.T.LngLat(pt.lng, pt.lat)) : map.lngLatToPoint(new window.T.LngLat(pt.lng, pt.lat));
      return [pixel.x, pixel.y, pt.count];
    });
    const hexbin: any = d3hexbin().radius(resolution).extent([[0,0],[canvas.width,canvas.height]]);
    const bins: any[] = hexbin(points);
    const maxCount = Math.max(1, ...bins.map((bin: any) => bin.reduce((sum: number, d: [number, number, number]) => sum + d[2], 0)));
    const color = (v: number) => {
      const idx = Math.floor((v / maxCount) * (colorRange.length-1));
      return colorRange[idx];
    };
    ctx.clearRect(0,0,canvas.width,canvas.height);
    bins.forEach((bin: any) => {
      const count = bin.reduce((sum: number, d: [number, number, number]) => sum + d[2], 0);
      ctx.beginPath();
      (hexbin.hexagon() as string).split('M').slice(1).forEach((seg: string) => {
        const [x, y] = seg.split(',').map(Number);
        ctx.lineTo(bin.x + x, bin.y + y);
      });
      ctx.closePath();
      ctx.fillStyle = color(count);
      ctx.globalAlpha = opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  };

  useEffect(() => {
    drawHexbin();
  }, [data, visible, opacity, resolution, colorRange, map, container]);

  useEffect(() => {
    if (!visible && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [visible]);

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

export default HexbinLayer; 