import React, { useRef, useEffect } from 'react';
import TiandituMap from '../components/TiandituMap';
import { createMapAPI, MapAPI } from './MapAPI';

/**
 * 地图API使用示例组件
 */
const MapAPIUsage: React.FC = () => {
  // 地图实例引用
  const mapRef = useRef<any>(null);
  // API实例引用
  const apiRef = useRef<MapAPI | null>(null);

  useEffect(() => {
    // 当地图加载完成后初始化API
    const initAPI = () => {
      if (mapRef.current) {
        // 创建API实例
        const api = createMapAPI(mapRef);
        apiRef.current = api;
        
        // API使用示例
        
        // 1. 设置地图中心点和缩放级别
        api.setCenter([116.3912, 39.9073]); // 北京
        api.setZoom(10);
        
        // 2. 添加事件监听
        api.on('click', (evt: any) => {
          console.log('地图被点击:', evt);
        });
        
        // 3. 切换底图
        setTimeout(() => {
          api.switchBasemap('img'); // 切换到影像图
          console.log('当前底图类型:', api.getCurrentBasemap());
        }, 2000);
        
        // 4. 加载GeoJSON数据
        api.loadGeoJson('/data/中国_省.geojson').then(data => {
          // 创建图层并添加到地图
          if (data) {
            api.addLayer({
              id: 'china-province',
              name: '中国省级行政区',
              type: 'geojson',
              visible: true,
              opacity: 0.7,
              color: '#ff0000',
              fillColor: 'rgba(255, 0, 0, 0.2)',
              data: data
            });
          }
        });
      }
    };
    
    // 监听地图加载状态
    if (mapRef.current && mapRef.current.getMap) {
      initAPI();
    }
    
    return () => {
      // 清理事件监听
      if (apiRef.current) {
        apiRef.current.off('click', () => {});
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <TiandituMap
        ref={mapRef}
        width="100%"
        height="100%"
        center={[114.0579, 22.5431]}
        zoom={8}
        onMapLoaded={() => {
          console.log('地图已加载，初始化API');
          if (mapRef.current) {
            const api = createMapAPI(mapRef);
            apiRef.current = api;
          }
        }}
      />
    </div>
  );
};

export default MapAPIUsage; 