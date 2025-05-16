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
    constructor(container: string | HTMLElement, options?: MapOptions);
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
    getLocation(keyword: string, callback: (result: GeocoderResult) => void): void;
    getPoint(keyword: string, callback: (result: GeocoderResult) => void): void;
  }

  interface GeocoderResult {
    getStatus(): number;
    getLocationPoint(): GeocoderLocation | GeocoderLocation[] | null;
    getPoiList?(): any[];
    getMessage?(): string;
    getPois?(): PoiResult[];
    getResultType?(): number;
    getSuggests?(): SuggestResult[];
    getStatistics?(): StatisticsResult;
    getArea?(): AreaResult;
  }

  interface GeocoderLocation {
    id?: string;
    name?: string;
    address?: string;
    lnt: number | string; // 经度 - 可能是数字或字符串
    lat: number | string; // 纬度 - 可能是数字或字符串
    phone?: string;
    type?: string;
    tags?: string[];
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

  // 本地搜索类
  class LocalSearch {
    constructor(map: Map, options?: LocalSearchOptions);
    search(keyword: string, type?: number): void;
    searchNearby(keyword: string, center: LngLat, radius: number): void;
    searchInBounds(keyword: string, bounds: LngLatBounds): void;
    clearResults(): void;
    setPageIndex(pageIndex: number): void;
    setPageCapacity(pageCapacity: number): void;
    getPageIndex(): number;
    getPageCapacity(): number;
    getCountNumber(): number;
    getCountPage(): number;
  }

  // 本地搜索配置选项
  interface LocalSearchOptions {
    pageCapacity?: number;
    onSearchComplete?: Function;
    policy?: number;
  }

  // 本地搜索结果接口
  interface LocalSearchResult {
    getType(): string;
    getResultType(): number;
    getPois(): PoiResult[];
    getSuggests(): SuggestResult[];
    getStatistics(): StatisticsResult;
    getArea(): AreaResult;
  }

  // 兴趣点结果接口
  interface PoiResult {
    id?: string;
    name: string;
    address: string;
    lonlat: string; // 格式: "经度 纬度"
    phone?: string;
    website?: string;
    category?: string;
  }

  // 建议结果接口
  interface SuggestResult {
    name: string;
    address: string;
  }

  // 统计结果接口
  interface StatisticsResult {
    priorityCitys?: {
      name: string;
      count: number;
    }[];
  }

  // 区域结果接口
  interface AreaResult {
    // 区域相关属性
    name?: string;
    level?: number;
    boundary?: string;
  }

  // 公交换乘类
  class TransitRoute {
    constructor(map: Map, options?: TransitRouteOptions);
    search(start: string | LngLat, end: string | LngLat): void;
  }

  // 公交换乘配置选项
  interface TransitRouteOptions {
    policy?: number; // 策略：0最少时间，1最少换乘，2最少步行，3最短距离
    onSearchComplete?: Function;
  }
}

// 扩展Window接口，使其包含天地图API
interface Window {
  T: typeof T;
  TIANDITU_API_LOADING?: boolean;
  TIANDITU_API_LOADED?: boolean;
  onTiandituLoaded?: () => void;
} 