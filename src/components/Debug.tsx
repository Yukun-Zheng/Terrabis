import React, { useState, useEffect } from 'react';
import useMapStore from '../stores/useMapStore';
import { TIANDITU_API_KEY, API_BASE_URL } from '../config/api-keys';
import { Map as MapboxMap } from 'mapbox-gl';

/**
 * 状态面板样式
 */
const statusPanelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.9)',
  padding: '10px',
  borderRadius: '4px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  width: '300px',
  fontFamily: 'monospace',
  fontSize: '12px',
  border: '1px solid #e0e0e0',
};

/**
 * 状态信息项样式
 */
const statusItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '2px 5px',
  borderBottom: '1px solid #eee',
};

/**
 * 切换按钮样式
 */
const toggleButtonStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '10px',
  right: '10px',
  background: 'rgba(255, 255, 255, 0.9)',
  color: '#666',
  border: '1px solid #ddd',
  padding: '5px 10px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  zIndex: 1000,
  boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
};

/**
 * 操作按钮样式
 */
const actionButtonStyle: React.CSSProperties = {
  marginTop: '5px',
  padding: '3px 8px',
  background: '#f0f0f0',
  border: '1px solid #ddd',
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: '11px',
  marginRight: '5px'
};

/**
 * 地图状态组件
 */
const Debug: React.FC = () => {
  const mapStore = useMapStore();
  const [showPanel, setShowPanel] = useState(false);
  const [mapErrors, setMapErrors] = useState<string[]>([]);
  const [mapInfo, setMapInfo] = useState<any>(null);
  const [networkTestResult, setNetworkTestResult] = useState<{status: string, url: string} | null>(null);
  const [mapInstance, setMapInstance] = useState<MapboxMap | null>(null);

  // 收集地图错误信息
  useEffect(() => {
    if (mapStore.mapInstance) {
      const errorHandler = (e: any) => {
        if (e.error) {
          setMapErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: ${e.error.message || 'Unknown error'}`]);
        }
      };
      
      mapStore.mapInstance.on('error', errorHandler);
      
      return () => {
        mapStore.mapInstance?.off('error', errorHandler);
      };
    }
  }, [mapStore.mapInstance]);

  const togglePanel = () => {
    setShowPanel(!showPanel);
  };
  
  const getMapInfo = () => {
    if (!mapStore.mapInstance) {
      setMapInfo({ error: '地图实例未初始化' });
      return;
    }
    
    try {
      // 检查地图是否已经加载
      const isLoaded = mapStore.mapInstance.loaded();
      
      // 获取地图基本信息，即使样式可能未加载
      const basicInfo = {
        center: mapStore.mapInstance.getCenter(),
        zoom: mapStore.mapInstance.getZoom(),
        bounds: mapStore.mapInstance.getBounds(),
        loaded: isLoaded,
        container: mapStore.mapInstance.getContainer() ? '已挂载' : '未挂载'
      };
      
      if (!isLoaded) {
        setMapInfo({ 
          ...basicInfo,
          warning: '地图尚未完全加载，样式信息不可用'
        });
        return;
      }
      
      // 尝试获取样式信息
      let styleInfo;
      try {
        styleInfo = mapStore.mapInstance.getStyle();
        
        if (!styleInfo) {
          setMapInfo({ 
            ...basicInfo,
            error: '样式对象为空',
            mapInstanceExists: true
          });
          return;
        }
        
        // 安全地获取源和图层
        const sources = styleInfo.sources ? Object.keys(styleInfo.sources) : [];
        const layers = styleInfo.layers ? styleInfo.layers.map(l => l.id) : [];
        
        setMapInfo({
          ...basicInfo,
          sources: sources,
          layers: layers,
          sourceCount: sources.length,
          layerCount: layers.length,
          version: styleInfo.version,
          glyphs: styleInfo.glyphs,
          transition: styleInfo.transition
        });
      } catch (styleErr: any) {
        console.error('获取样式失败:', styleErr);
        setMapInfo({ 
          ...basicInfo,
          styleError: styleErr.message,
          styleAvailable: false
        });
      }
    } catch (err: any) {
      console.error('获取地图信息失败:', err);
      setMapInfo({ 
        error: err.message || '获取地图信息时出错',
        mapInstanceExists: mapStore.mapInstance ? true : false 
      });
    }
  };
  
  const retryBasemaps = () => {
    if (!mapStore.mapInstance) {
      console.error('地图实例不存在，无法重试加载底图');
      setMapErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: 地图实例不存在，无法重试加载底图`]);
      return;
    }
    
    // 尝试重新加载当前底图
    try {
      // 检查地图是否已经加载
      if (!mapStore.mapInstance.loaded()) {
        console.warn('地图尚未完全加载，等待加载完成');
        setMapErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: 地图尚未完全加载，等待加载完成`]);
        return;
      }
      
      // 重新加载底图
      const mapInstance = mapStore.mapInstance;
      
      // 强制重新设置地图中心点和缩放级别
      mapInstance.setCenter([116.39, 39.91]);
      mapInstance.setZoom(10);
      
      // 触发样式重新加载
      const currentStyle = mapInstance.getStyle();
      if (currentStyle) {
        console.log('重新应用当前样式');
        mapInstance.setStyle(currentStyle);
      } else {
        console.warn('当前样式不可用，设置空样式');
        mapInstance.setStyle({
          version: 8,
          sources: {},
          layers: [],
          glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
        });
      }
      
      // 触发重新绘制
      mapInstance.triggerRepaint();
      
      console.log('底图重试操作完成');
      setMapErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: 已尝试重新加载底图`]);
    } catch (err: any) {
      console.error('重试加载底图失败:', err);
      setMapErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: 重试加载底图失败: ${err.message}`]);
    }
  };
  
  const clearErrors = () => {
    setMapErrors([]);
  };

  // 测试天地图网络请求
  const testTiandituRequest = async () => {
    // 创建一个测试瓦片URL
    const testUrl = `${API_BASE_URL}/t0/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX=1&TILEROW=0&TILECOL=0&tk=${TIANDITU_API_KEY}`;
    
    setNetworkTestResult({ status: '测试中...', url: testUrl });
    
    try {
      const response = await fetch(testUrl);
      if (response.ok) {
        setNetworkTestResult({ status: '成功 ✅', url: testUrl });
      } else {
        setNetworkTestResult({ status: `失败 ❌ (${response.status})`, url: testUrl });
      }
    } catch (error: any) {
      setNetworkTestResult({ status: `错误 ❌ (${error.message})`, url: testUrl });
    }
  };
  
  // 测试原始天地图请求（不经过代理）
  const testDirectTiandituRequest = async () => {
    // 创建一个测试瓦片URL（直接访问天地图服务器）
    const testUrl = `https://t0.tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX=1&TILEROW=0&TILECOL=0&tk=${TIANDITU_API_KEY}`;
    
    setNetworkTestResult({ status: '测试中...', url: testUrl });
    
    try {
      const response = await fetch(testUrl);
      if (response.ok) {
        setNetworkTestResult({ status: '成功 ✅', url: testUrl });
      } else {
        setNetworkTestResult({ status: `失败 ❌ (${response.status})`, url: testUrl });
      }
    } catch (error: any) {
      setNetworkTestResult({ status: `错误 ❌ (${error.message})`, url: testUrl });
    }
  };
  
  // 重置地图
  const resetMap = () => {
    if (!mapStore.mapInstance) {
      setMapErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: 地图实例不存在，无法重置`]);
      return;
    }
    
    try {
      // 获取容器元素
      const container = mapStore.mapInstance.getContainer();
      
      // 先安全地移除现有地图 - 防止错误
      try {
        mapStore.mapInstance.remove();
      } catch (removeErr) {
        console.warn('移除地图实例时出错:', removeErr);
        // 继续执行，不要中断重置过程
      }
      
      // 设置mapInstance为null以避免后续使用已销毁的实例
      setMapInstance(null);
      
      // 清空容器内容
      if (container) {
        try {
          container.innerHTML = '';
        } catch (clearErr) {
          console.warn('清空容器内容时出错:', clearErr);
        }
      }
      
      // 重新加载页面
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error: any) {
      console.error('重置地图失败:', error);
      setMapErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: 重置地图失败: ${error.message}`]);
      
      // 即使失败也尝试重新加载页面
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };
  
  return (
    <>
      {showPanel && (
        <div style={statusPanelStyle}>
          <div style={{ marginBottom: '5px', borderBottom: '1px solid #f00', paddingBottom: '3px', color: '#f00' }}>
            调试信息
          </div>
          
          <div style={statusItemStyle}>
            <span>地图状态:</span>
            <span>{mapStore.mapLoaded ? '已加载' : '未加载'}</span>
          </div>
          
          <div style={statusItemStyle}>
            <span>地图对象:</span>
            <span>{mapStore.mapInstance ? (mapStore.mapInstance.loaded() ? '已加载完成' : '加载中') : '未初始化'}</span>
          </div>
          
          <div style={statusItemStyle}>
            <span>当前底图:</span>
            <span>{mapStore.activeBasemapId || '未知'}</span>
          </div>
          
          <div style={statusItemStyle}>
            <span>图层数量:</span>
            <span>{mapStore.mapLayers.length}</span>
          </div>
          
          <div style={statusItemStyle}>
            <span>要素数量:</span>
            <span>{mapStore.drawnFeatures?.length || 0}</span>
          </div>
          
          <div style={statusItemStyle}>
            <span>标签显示:</span>
            <span>{mapStore.showLabels ? '是' : '否'}</span>
          </div>
          
          <div style={statusItemStyle}>
            <span>当前正在绘制:</span>
            <span>{mapStore.isDrawing ? '是' : '否'}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button style={actionButtonStyle} onClick={getMapInfo}>检查地图</button>
            <button style={actionButtonStyle} onClick={retryBasemaps}>重试底图</button>
            <button style={actionButtonStyle} onClick={clearErrors}>清空错误</button>
            <button style={actionButtonStyle} onClick={testTiandituRequest}>测试代理</button>
            <button style={actionButtonStyle} onClick={testDirectTiandituRequest}>测试直连</button>
            <button style={actionButtonStyle} onClick={resetMap}>重置地图</button>
          </div>
          
          {mapInfo && (
            <div style={{ marginTop: '8px', fontSize: '11px', maxHeight: '150px', overflow: 'auto', background: '#f5f5f5', padding: '5px' }}>
              <pre>{JSON.stringify(mapInfo, null, 2)}</pre>
            </div>
          )}
          
          {networkTestResult && (
            <div style={{ marginTop: '8px', fontSize: '11px', maxHeight: '120px', overflow: 'auto', background: '#f0f8ff', padding: '5px' }}>
              <div style={{ fontWeight: 'bold', color: '#00a' }}>请求测试:</div>
              <div style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                <div>URL: {networkTestResult.url}</div>
                <div>状态: {networkTestResult.status}</div>
              </div>
            </div>
          )}
          
          {mapErrors.length > 0 && (
            <div style={{ marginTop: '8px', maxHeight: '120px', overflow: 'auto', background: '#fff0f0', padding: '5px', fontSize: '11px' }}>
              <div style={{ fontWeight: 'bold', color: '#d00' }}>错误日志:</div>
              {mapErrors.map((err, i) => (
                <div key={i} style={{ borderBottom: '1px solid #eee', padding: '2px 0' }}>{err}</div>
              ))}
            </div>
          )}
          
          <div 
            style={{ marginTop: '5px', fontSize: '11px', color: '#666', textAlign: 'center', cursor: 'pointer' }}
            onClick={togglePanel}
          >
            关闭
          </div>
        </div>
      )}
      
      {!showPanel && (
        <button 
          style={toggleButtonStyle}
          onClick={togglePanel}
        >
          打开地图状态控制台
        </button>
      )}
    </>
  );
};

export default Debug; 