// 天地图 API 的类型声明
declare namespace T {
  // 地图类型常量
  const VECTOR_MAP_TYPE: string;
  const SATELLITE_MAP_TYPE: string;
  const TERRAIN_MAP_TYPE: string;
  
  // 绘图工具常量
  const DRAWING_RECTANGLE: string;
  const DRAWING_CIRCLE: string;  
  const DRAWING_POLYGON: string;
  
  class Map {
    constructor(container: string, options?: MapOptions);
    centerAndZoom(center: LngLat, zoom: number): void;
    addControl(control: Control.Scale | Control.Zoom | Control.MapType): void;
    clearOverLays(): void;
    addLayer(layer: TileLayer): void;
    removeLayer(layer: TileLayer): void;
    destroy?(): void;
    setMapType(type: string): void;
    addEventListener(eventName: string, handler: Function): void;
    removeEventListener(eventName: string, handler: Function): void;
    loaded(): boolean;
    getOverlays(): any[];
    addOverLay(overlay: any): void;
    removeOverLay(overlay: any): void;
    panTo(lnglat: LngLat, zoom?: number): void;
  }

  interface MapOptions {
    datasourcesControl?: boolean;
    minZoom?: number;
    maxZoom?: number;
    zoom?: number;
  }

  class LngLat {
    constructor(lng: number, lat: number);
    lng: number;
    lat: number;
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
    equals(point: Point): boolean;
    toString(): string;
  }

  class TileLayer {
    constructor(id: string, options: TileLayerOptions);
    id?: string;
    show(): void;
    hide(): void;
  }

  interface TileLayerOptions {
    getTileUrl?: string | ((x: number, y: number, z: number) => string);
    minZoom?: number;
    maxZoom?: number;
    opacity?: number;
    tileSize?: Point;
  }

  class Geocoder {
    constructor(options?: any);
    getLocation(keyword: string, callback: Function): void;
    getPoint(keyword: string, callback: Function): void;
  }

  interface GeocoderResult {
    getStatus(): number;
    getLocationPoint(): Array<GeocoderLocation>;
  }

  interface GeocoderLocation {
    id?: string;
    name?: string;
    address?: string;
    lnt: number; // 经度
    lat: number; // 纬度
  }

  // 标注工具
  class MarkTool {
    constructor(map: Map, options?: MarkToolOptions);
    open(): void;
    close(): void;
    getMarkers(): any[];
  }

  interface MarkToolOptions {
    follow?: boolean;
  }

  // 矩形工具
  class RectangleTool {
    constructor(map: Map, options?: OverlayToolOptions);
    open(): void;
    close(): void;
    on(eventName: string, handler: Function): void;
  }

  // 圆形工具
  class CircleTool {
    constructor(map: Map, options?: OverlayToolOptions);
    open(): void;
    close(): void;
    on(eventName: string, handler: Function): void;
  }

  // 多边形工具
  class PolygonTool {
    constructor(map: Map, options?: OverlayToolOptions);
    open(): void;
    close(): void;
    on(eventName: string, handler: Function): void;
  }

  // 线工具
  class PolylineTool {
    constructor(map: Map, options?: OverlayToolOptions);
    open(): void;
    close(): void;
    on(eventName: string, handler: Function): void;
  }

  interface OverlayToolOptions {
    showLabel?: boolean;
    follow?: boolean;
    color?: string;
    weight?: number;
    opacity?: number;
    fillColor?: string;
    fillOpacity?: number;
  }

  interface RectangleOverlay {
    getBounds(): Bounds;
  }

  interface CircleOverlay {
    getRadius(): number;
    getCenter(): LngLat;
  }

  interface PolygonOverlay {
    getLngLats(): LngLat[];
  }

  interface Bounds {
    getSouthWest(): LngLat;
    getNorthEast(): LngLat;
  }

  namespace Control {
    class Scale {
      constructor(options?: any);
    }

    class Zoom {
      constructor(options?: any);
    }
    
    class MapType {
      constructor(options?: any);
    }
  }
  
  namespace Event {
    interface MapTypeChangeEvent {
      maptype: string;
      type: string;
    }
  }
  
  namespace Tool {
    function getDistance(start: LngLat, end: LngLat): number;
    function getPolygonArea(points: LngLat[]): number;
  }

  // 标记点类
  class Marker {
    constructor(lnglat: LngLat, options?: any);
    addEventListener(eventName: string, handler: Function): void;
    openInfoWindow(infoWindow: InfoWindow): void;
  }

  // 标记图标类
  class Icon {
    constructor(options: {
      iconUrl: string;
      iconSize?: number[];
      iconAnchor?: number[];
      popupAnchor?: number[];
    });
  }

  // 信息窗口类
  class InfoWindow {
    constructor(content: string, options?: any);
    setContent(content: string): void;
  }
  
  // 城市定位类
  class LocalCity {
    constructor(options?: any);
    location(callback: Function): void;
  }

  // 经纬度边界类
  class LngLatBounds {
    constructor(sw: LngLat, ne: LngLat);
    getSouthWest(): LngLat;
    getNorthEast(): LngLat;
    extend(lnglat: LngLat): LngLatBounds;
  }

  // 矩形覆盖物类
  class Rectangle {
    constructor(bounds: LngLatBounds, options?: any);
    addEventListener(eventName: string, handler: Function): void;
    getBounds(): LngLatBounds;
  }

  // 圆形覆盖物类
  class Circle {
    constructor(center: LngLat, radius: number, options?: any);
    addEventListener(eventName: string, handler: Function): void;
    getCenter(): LngLat;
    getRadius(): number;
  }

  // 多边形覆盖物类
  class Polygon {
    constructor(lnglats: LngLat[], options?: any);
    addEventListener(eventName: string, handler: Function): void;
    getLngLats(): LngLat[];
  }

  // 热力图覆盖物类
  class HeatmapOverlay {
    constructor(options?: {
      radius?: number;
      opacity?: number;
      gradient?: Record<string, string>;
    });
    setDataSet(data: { data: any[]; max: number }): void;
    show(): void;
    hide(): void;
  }
}

// 扩展Window接口，使其包含天地图API
interface Window {
  T: typeof T;
} 