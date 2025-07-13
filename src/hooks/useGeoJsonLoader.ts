import { useEffect } from 'react';
import { useMapStore } from '../stores/mapStore';
import { loadGeoJson } from '../utils/geoJsonLoader';

export function useGeoJsonLoader() {
  const setGeoJsonData = useMapStore(s => s.setGeoJsonData);
  const setGeoJsonLoading = useMapStore(s => s.setGeoJsonLoading);

  useEffect(() => {
    async function loadAll() {
      setGeoJsonLoading(true);
      const china = await loadGeoJson('/data/中国_省.geojson');
      const guangdong = await loadGeoJson('/data/广东省_省.geojson');
      const shenzhen = await loadGeoJson('/data/深圳市_市.geojson');
      setGeoJsonData({ china, guangdong, shenzhen });
      setGeoJsonLoading(false);
    }
    loadAll();
  }, [setGeoJsonData, setGeoJsonLoading]);
} 