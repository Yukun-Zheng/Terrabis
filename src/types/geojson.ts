export interface GeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: { [key: string]: any };
}

export interface GeoJson {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
} 