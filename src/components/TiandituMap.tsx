import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { TIANDITU_API_KEY, TIANDITU_PROXY_URL } from '../config/api-keys';

// 定义接口
interface TiandituMapProps {
  width?: string | number;
  height?: string | number;
  center?: [number, number];
  zoom?: number;
  onMapLoaded?: () => void;
  className?: string;
  style?: React.CSSProperties;
  onBasemapChange?: (type: BasemapType) => void; // 添加底图变更回调
}

// 底图类型
export type BasemapType = 'vec' | 'img' | 'ter';

// 图层缓存
interface LayerCache {
  vec: any[];
  img: any[];
  ter: any[];
}

// 天地图组件 - 纯HTML/JS实现，不依赖Mapbox GL JS
const TiandituMap = forwardRef<any, TiandituMapProps>(({
  width = '100%',
  height = '100%',
  center = [114.0579, 22.5431], // 默认深圳中心
  zoom = 12,
  onMapLoaded,
  className = '',
  style = {},
  onBasemapChange
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('vec');
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const layersRef = useRef<LayerCache>({ vec: [], img: [], ter: [] });

  // 初始化天地图
  useEffect(() => {
    // 如果页面中已经有天地图脚本，则不重复加载
    if (document.getElementById('tianditu-api') && window.T) {
      console.log('天地图API已加载，直接初始化地图');
      initMap();
      return;
    }

    console.log('开始加载天地图API...');
    
    // 添加天地图API引用标识
    window.TIANDITU_API_LOADING = true;
    
    // 加载天地图API - 使用HTTPS版本
    const script = document.createElement('script');
    script.id = 'tianditu-api';
    script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${TIANDITU_API_KEY}&callback=onTiandituLoaded`;
    script.async = true;
    
    // 创建全局回调函数
    window.onTiandituLoaded = () => {
      console.log('天地图API加载成功，通过回调函数');
      window.TIANDITU_API_LOADED = true;
      delete window.TIANDITU_API_LOADING;
      initMap();
    };
    
    script.onload = () => {
      console.log('天地图API脚本加载完成');
      // 如果10秒后回调还未触发，强制初始化
      setTimeout(() => {
        if (!window.TIANDITU_API_LOADED && window.T) {
          console.warn('回调未触发，手动初始化地图');
          delete window.TIANDITU_API_LOADING;
          window.TIANDITU_API_LOADED = true;
          initMap();
        }
      }, 10000);
    };
    
    script.onerror = (e) => {
      console.error('天地图API加载失败', e);
      delete window.TIANDITU_API_LOADING;
      setMapError('天地图API加载失败，请检查网络连接或API密钥是否正确');
    };
    
    document.head.appendChild(script);
    
    return () => {
      // 清理函数 - 如果组件卸载时天地图实例存在，则移除
      if (mapInstanceRef.current) {
        try {
          // 尝试销毁地图实例
          if (typeof mapInstanceRef.current.destroy === 'function') {
            mapInstanceRef.current.destroy();
          }
          mapInstanceRef.current = null;
        } catch (err) {
          console.error('清理天地图实例时出错:', err);
        }
      }
    };
  }, []);

  // 创建图层函数 - 使用天地图内置的图层对象
  const createLayers = () => {
    if (!window.T) return null;
    
    try {
      console.log('创建天地图图层...');
      
      // 使用天地图官方图层并添加API密钥
      // 构建带有API密钥的URL获取函数
      const createTileLayerUrl = (baseType: string) => {
        // 返回获取瓦片URL的函数
        return (x: number, y: number, z: number) => {
          // 使用正确的代理URL格式 - 关键修复
          return `/tianditu/${baseType}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${baseType}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}&tk=${TIANDITU_API_KEY}`;
        };
      };
      
      // 矢量底图及注记
      const vecLayer = new window.T.TileLayer('vec', {
        getTileUrl: createTileLayerUrl('vec'),
        minZoom: 1,
        maxZoom: 18
      });
      
      const cvaLayer = new window.T.TileLayer('cva', {
        getTileUrl: createTileLayerUrl('cva'),
        minZoom: 1,
        maxZoom: 18
      });
      
      // 影像底图及注记
      const imgLayer = new window.T.TileLayer('img', {
        getTileUrl: createTileLayerUrl('img'),
        minZoom: 1,
        maxZoom: 18
      });
      
      const ciaLayer = new window.T.TileLayer('cia', {
        getTileUrl: createTileLayerUrl('cia'),
        minZoom: 1,
        maxZoom: 18
      });
      
      // 地形底图及注记
      const terLayer = new window.T.TileLayer('ter', {
        getTileUrl: createTileLayerUrl('ter'),
        minZoom: 1,
        maxZoom: 18
      });
      
      const ctaLayer = new window.T.TileLayer('cta', {
        getTileUrl: createTileLayerUrl('cta'),
        minZoom: 1,
        maxZoom: 18
      });
      
      return {
        vec: [vecLayer, cvaLayer],
        img: [imgLayer, ciaLayer],
        ter: [terLayer, ctaLayer]
      };
    } catch (err) {
      console.error('创建图层失败:', err);
      return null;
    }
  };

  // 初始化地图函数
  const initMap = () => {
    // 确保天地图API已经加载
    if (!window.T) {
      console.warn('天地图API(window.T)未加载，稍后重试');
      setTimeout(initMap, 500);
      return;
    }

    // 确保容器存在
    if (!mapContainerRef.current) {
      console.error('地图容器元素不存在');
      setMapError('地图容器元素不存在');
      return;
    }

    try {
      console.log('开始初始化天地图实例...');
      
      // 创建天地图实例 - 启用服务数据源控制
      const map = new window.T.Map(mapContainerRef.current.id, {
        datasourcesControl: true, // 启用数据源控制（包括图层管理）
        minZoom: 1,
        maxZoom: 18
      });
      
      // 设置地图中心点和缩放级别
      map.centerAndZoom(new window.T.LngLat(center[0], center[1]), zoom);
      
      // 添加比例尺和缩放控件
      map.addControl(new window.T.Control.Scale());
      map.addControl(new window.T.Control.Zoom());
      
      // 添加地图类型控件 - 始终显示
      const mapTypeControl = new window.T.Control.MapType();
      map.addControl(mapTypeControl);
      
      // 监听地图类型变化事件
      map.addEventListener('maptypechange', (evt: any) => {
        // 根据maptype确定当前底图类型
        let basemapType: BasemapType;
        
        if (evt.maptype === window.T.VECTOR_MAP_TYPE) {
          basemapType = 'vec';
        } else if (evt.maptype === window.T.SATELLITE_MAP_TYPE) {
          basemapType = 'img';
        } else if (evt.maptype === window.T.TERRAIN_MAP_TYPE) {
          basemapType = 'ter';
        } else {
          console.warn(`未知的地图类型: ${evt.maptype}`);
          return;
        }
        
        // 更新当前底图状态
        setCurrentBasemap(basemapType);
        console.log(`底图已变更为: ${basemapType}`);
        
        // 如果有回调函数，则调用它
        if (onBasemapChange) {
          onBasemapChange(basemapType);
        }
      });
      
      // 创建所有图层
      const layers = createLayers();
      if (!layers) {
        throw new Error('创建图层失败');
      }
      
      // 保存图层到ref
      layersRef.current = layers;
      
      // 初始加载矢量图层（默认底图）
      if (currentBasemap === 'vec') {
        layers.vec.forEach(layer => {
          try {
            map.addLayer(layer);
          } catch (err) {
            console.error('添加图层失败:', err);
          }
        });
      } else if (currentBasemap === 'img') {
        layers.img.forEach(layer => {
          try {
            map.addLayer(layer);
          } catch (err) {
            console.error('添加图层失败:', err);
          }
        });
      } else if (currentBasemap === 'ter') {
        layers.ter.forEach(layer => {
          try {
            map.addLayer(layer);
          } catch (err) {
            console.error('添加图层失败:', err);
          }
        });
      }
      
      // 保存地图实例
      mapInstanceRef.current = map;
      
      // 标记地图已加载
      setMapLoaded(true);
      
      // 通知父组件地图已加载完成
      if (onMapLoaded) {
        onMapLoaded();
      }

      console.log('天地图初始化成功');
    } catch (err) {
      console.error('初始化天地图时出错:', err);
      setMapError(`初始化天地图失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  // 移除所有图层
  const removeAllLayers = () => {
    if (!mapInstanceRef.current) return false;
    
    const map = mapInstanceRef.current;
    
    try {
      // 获取当前激活的底图类型的图层
      const activeLayers = layersRef.current[currentBasemap] || [];
      
      // 移除当前激活的图层
      for (const layer of activeLayers) {
        try {
          map.removeLayer(layer);
          console.log(`已移除图层: ${layer.id || '未命名图层'}`);
        } catch (err) {
          console.warn(`移除图层失败(可能已被移除): ${err instanceof Error ? err.message : '未知错误'}`);
          // 继续移除其他图层，不中断流程
        }
      }
      
      return true;
    } catch (err) {
      console.error('移除图层时发生错误:', err);
      return false;
    }
  };

  // 提供给外部的底图切换函数
  const switchBasemap = (type: BasemapType) => {
    if (!mapInstanceRef.current) {
      console.error('地图未初始化，无法切换底图');
      return false;
    }
    
    if (type === currentBasemap) {
      console.log(`当前已是${type}底图，无需切换`);
      return true;
    }
    
    try {
      console.log(`开始切换底图: ${currentBasemap} -> ${type}`);
      const map = mapInstanceRef.current;
      
      // 使用天地图API内置的底图切换方法
      if (type === 'vec') {
        map.setMapType(window.T.VECTOR_MAP_TYPE);
      } else if (type === 'img') {
        map.setMapType(window.T.SATELLITE_MAP_TYPE);
      } else if (type === 'ter') {
        map.setMapType(window.T.TERRAIN_MAP_TYPE);
      }
      
      return true;
    } catch (err) {
      console.error(`底图切换失败:`, err);
      return false;
    }
  };

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    getMap: () => mapInstanceRef.current,
    switchBasemap,
    getCurrentBasemap: () => currentBasemap
  }));

  // 组合样式
  const combinedStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    ...style
  };

  return (
    <div style={combinedStyle} className={`tianditu-map-container ${className}`.trim()}>
      <div id="tianditu-map" ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>
      
      {/* 加载错误提示 */}
      {mapError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          color: 'red',
          padding: '15px',
          borderRadius: '5px',
          maxWidth: '80%',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <strong>地图加载错误:</strong> {mapError}
        </div>
      )}
    </div>
  );
});

export default TiandituMap; 