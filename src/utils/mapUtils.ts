import { Map, LngLatBounds } from 'mapbox-gl';
import { Geometry, Feature, GeoJsonProperties } from 'geojson';

/**
 * 缩放地图到指定几何要素范围
 */
export const zoomToGeometry = (
  map: Map | null | undefined,
  geometryOrFeature: Geometry | Feature<Geometry, GeoJsonProperties>,
  padding: number = 50 // 边距像素
) => {
  if (!map) return;

  try {
    // 提取几何部分
    let geometry: Geometry;
    if ('geometry' in geometryOrFeature) {
      geometry = geometryOrFeature.geometry;
    } else {
      geometry = geometryOrFeature;
    }

    // 创建边界框
    const bounds = new LngLatBounds();

    // 根据几何类型处理坐标
    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
      bounds.extend([geometry.coordinates[0], geometry.coordinates[1]]);
    } else if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
      geometry.coordinates.forEach(coord => {
        bounds.extend([coord[0], coord[1]]);
      });
    } else if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
      // 处理多边形的外环
      geometry.coordinates[0].forEach(coord => {
        bounds.extend([coord[0], coord[1]]);
      });
    } else if (geometry.type === 'MultiPoint' && Array.isArray(geometry.coordinates)) {
      geometry.coordinates.forEach(coord => {
        bounds.extend([coord[0], coord[1]]);
      });
    } else if (geometry.type === 'MultiLineString' && Array.isArray(geometry.coordinates)) {
      geometry.coordinates.forEach(line => {
        line.forEach(coord => {
          bounds.extend([coord[0], coord[1]]);
        });
      });
    } else if (geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)) {
      geometry.coordinates.forEach(polygon => {
        // 每个多边形的外环
        polygon[0].forEach(coord => {
          bounds.extend([coord[0], coord[1]]);
        });
      });
    }

    // 如果边界有效，缩放地图
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding,
        maxZoom: 18
      });
    }
  } catch (error) {
    console.error('缩放到几何要素失败:', error);
  }
};

/**
 * 将经纬度转换为瓦片坐标
 */
export const lngLatToTile = (
  lng: number, 
  lat: number, 
  zoom: number
): { x: number; y: number } => {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
};

/**
 * 将瓦片坐标转换为经纬度
 */
export const tileToLngLat = (
  x: number, 
  y: number, 
  zoom: number
): { lng: number; lat: number } => {
  const n = Math.pow(2, zoom);
  const lng = x / n * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
  const lat = latRad * 180 / Math.PI;
  return { lng, lat };
};

/**
 * 计算两点之间的距离（米）
 */
export const calculateDistance = (
  lng1: number, 
  lat1: number, 
  lng2: number, 
  lat2: number
): number => {
  const R = 6371e3; // 地球半径，单位米
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}; 