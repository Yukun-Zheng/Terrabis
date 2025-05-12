import { Map } from 'mapbox-gl';
import { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * GeoJSON图层样式选项
 */
export interface GeoJsonLayerOptions {
  pointColor?: string;
  pointRadius?: number;
  lineColor?: string;
  lineWidth?: number;
  fillColor?: string;
  fillOpacity?: number;
  outlineColor?: string; // 用于多边形描边
  layerType?: 'circle' | 'line' | 'fill'; // 可选，强制指定图层类型
  minzoom?: number;
  maxzoom?: number;
  filter?: any[];
}

/**
 * 添加GeoJSON图层到地图
 * 
 * @param map Mapbox地图实例
 * @param id 图层ID
 * @param geojsonData GeoJSON数据
 * @param options 样式选项
 */
export const addGeoJsonLayer = (
  map: Map,
  id: string,
  geojsonData: FeatureCollection | Feature | Geometry,
  options: GeoJsonLayerOptions = {}
): void => {
  if (!map) return;

  // 设置默认值
  const {
    pointColor = '#3388ff',
    pointRadius = 6,
    lineColor = '#3388ff',
    lineWidth = 3,
    fillColor = '#3388ff',
    fillOpacity = 0.2,
    outlineColor = '#3388ff',
    layerType,
    minzoom,
    maxzoom,
    filter
  } = options;

  // 如果源已存在则移除
  if (map.getSource(id)) {
    const layers = map.getStyle().layers;
    // 查找并移除所有使用该源的图层
    for (const layer of layers) {
      if (layer.source === id) {
        map.removeLayer(layer.id);
      }
    }
    map.removeSource(id);
  }

  // 添加GeoJSON源
  map.addSource(id, {
    type: 'geojson',
    data: geojsonData
  });

  // 根据几何类型添加图层
  const geometryType = getGeometryType(geojsonData);

  // 点图层
  if (layerType === 'circle' || (!layerType && (geometryType === 'Point' || geometryType === 'MultiPoint'))) {
    map.addLayer({
      id: `${id}-point`,
      type: 'circle',
      source: id,
      paint: {
        'circle-color': pointColor,
        'circle-radius': pointRadius,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
      },
      minzoom,
      maxzoom,
      filter: filter || ['any', ['==', '$type', 'Point'], ['==', '$type', 'MultiPoint']]
    });
  }

  // 线图层
  if (layerType === 'line' || (!layerType && (geometryType === 'LineString' || geometryType === 'MultiLineString'))) {
    map.addLayer({
      id: `${id}-line`,
      type: 'line',
      source: id,
      paint: {
        'line-color': lineColor,
        'line-width': lineWidth
      },
      minzoom,
      maxzoom,
      filter: filter || ['any', ['==', '$type', 'LineString'], ['==', '$type', 'MultiLineString']]
    });
  }

  // 面图层
  if (layerType === 'fill' || (!layerType && (geometryType === 'Polygon' || geometryType === 'MultiPolygon'))) {
    map.addLayer({
      id: `${id}-fill`,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': fillColor,
        'fill-opacity': fillOpacity,
        'fill-outline-color': outlineColor
      },
      minzoom,
      maxzoom,
      filter: filter || ['any', ['==', '$type', 'Polygon'], ['==', '$type', 'MultiPolygon']]
    });
  }
};

/**
 * 获取GeoJSON数据的几何类型
 */
function getGeometryType(geoJson: FeatureCollection | Feature | Geometry): string | null {
  // 如果是Geometry对象
  if ('type' in geoJson && !('features' in geoJson) && !('geometry' in geoJson)) {
    return geoJson.type;
  }

  // 如果是Feature对象
  if ('geometry' in geoJson && geoJson.geometry) {
    return geoJson.geometry.type;
  }

  // 如果是FeatureCollection对象
  if ('features' in geoJson && geoJson.features.length > 0) {
    // 尝试从第一个要素获取类型
    const firstFeature = geoJson.features[0];
    if (firstFeature.geometry) {
      return firstFeature.geometry.type;
    }
  }

  return null;
} 