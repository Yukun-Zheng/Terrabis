import React, { useEffect, useRef, useState } from 'react';
import useMapStore from '../stores/useMapStore';
import { SearchSidebar } from './sidebars/SearchSidebar';
import { GeocodeResult } from '../utils/geocodingUtils';
import Debug from './Debug'; // 导入调试组件
import TiandituMap, { BasemapType } from './TiandituMap'; // 导入纯天地图组件
import { BottomControlBar } from './controls/BottomControlBar';
import DrawingSidebar from './sidebars/DrawingSidebar'; // 导入新的绘制侧边栏组件
import { LayerItem } from './controls/LayerControl'; // 保留LayerItem类型接口
import HeatmapLayer from './layers/HeatmapLayer'; // 导入热力图图层
import { chinaCityHeatData, getShenzhenHeatData } from '../data/heatmapData'; // 导入热力图数据
import { chinaFullHeatData } from '../data/chinaFullHeatData'; // 导入完整的中国城市热力图数据
import LayersSidebar from './sidebars/LayersSidebar'; // 导入图层侧边栏组件

/**
 * 侧边栏状态接口
 */
interface SidebarState {
  isOpen: boolean;
  type: 'search' | 'draw' | 'layers' | null;
}

/**
 * 地图容器组件属性接口
 */
interface MapContainerProps {
  hideDefaultControls?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 底部工具栏按钮接口
 */
interface ToolButton {
  id: 'search' | 'draw' | 'layers';
  name: string;
}

/**
 * 地图容器组件
 * 
 * @param props 组件属性
 * @returns JSX元素
 */
const MapContainer: React.FC<MapContainerProps> = ({
  hideDefaultControls = false,
  width = '100%',
  height = '100%',
  className = '',
  style = {}
}) => {
  // 地图容器ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tiandituMapRef = useRef<any>(null);
  
  // 侧边栏状态
  const [sidebar, setSidebar] = useState<SidebarState>({
    isOpen: false,
    type: null
  });
  
  // 当前活动工具
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  // 状态管理
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeBasemapId, setActiveBasemapId] = useState<BasemapType>('vec');
  
  // 图层状态
  const [layers, setLayers] = useState<LayerItem[]>([
    {
      id: 'heatmap-china',
      name: '中国城市热力图',
      isVisible: false,
      onToggle: (visible) => handleLayerToggle('heatmap-china', visible)
    },
    {
      id: 'heatmap-shenzhen',
      name: '深圳热力图',
      isVisible: false,
      onToggle: (visible) => handleLayerToggle('heatmap-shenzhen', visible)
    },
    {
      id: 'heatmap-china-full',
      name: '中国城市热力图(完整版)',
      isVisible: false,
      onToggle: (visible) => handleLayerToggle('heatmap-china-full', visible)
    }
  ]);
  
  // 热力图数据
  const [heatmapData] = useState({
    china: chinaCityHeatData,
    shenzhen: getShenzhenHeatData(200),
    chinaFull: chinaFullHeatData
  });
  
  // 热力图脚本加载状态
  const [heatmapScriptLoaded, setHeatmapScriptLoaded] = useState(false);
  
  // 控件样式表
  useEffect(() => {
    // 添加控件样式的CSS
    const styleElement = document.createElement('style');
    styleElement.id = 'tianditu-controls-style';
    styleElement.textContent = `
      /* 天地图控件通用样式 */
      .tdt-control {
        margin: 10px !important;
      }
      
      /* 自定义定位控件样式 */
      .location-control {
        position: absolute;
        left: 10px;
        top: 80px;
        background: white;
        border-radius: 4px;
        box-shadow: 0 1px 5px rgba(0,0,0,0.4);
        width: 32px;
        height: 32px;
        cursor: pointer;
        z-index: 800;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .location-control:hover {
        background: #f4f4f4;
      }
      
      .location-icon {
        width: 18px;
        height: 18px;
        background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231890ff'%3E%3Cpath d='M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z'/%3E%3C/svg%3E") center center no-repeat;
      }
    `;
    
    // 如果样式表已存在，则不重复添加
    if (!document.getElementById('tianditu-controls-style')) {
      document.head.appendChild(styleElement);
    }
    
    return () => {
      // 清理函数
      const existingStyle = document.getElementById('tianditu-controls-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
  
  // 添加热力图脚本
  useEffect(() => {
    // 等待天地图API加载完成后再加载热力图
    const waitForTiandituAPI = () => {
      if (window.T && window.TIANDITU_API_LOADED) {
        console.log('天地图API已加载，准备加载热力图脚本');
        loadHeatmapScript();
      } else {
        console.log('等待天地图API加载...');
        setTimeout(waitForTiandituAPI, 500);
      }
    };
    
    // 加载热力图脚本
    const loadHeatmapScript = () => {
      // 检查脚本或对象是否已经存在
      if (document.getElementById('tianditu-heatmap-script')) {
        console.log('热力图脚本已存在');
        setHeatmapScriptLoaded(true);
        return;
      }
      
      // 检查HeatmapOverlay对象是否已经存在
      if (window.T && window.T.HeatmapOverlay) {
        console.log('热力图对象已存在');
        setHeatmapScriptLoaded(true);
        return;
      }
      
      console.log('开始加载热力图脚本');
      
      // 加载热力图脚本
      const script = document.createElement('script');
      script.id = 'tianditu-heatmap-script';
      script.src = 'https://lbs.tianditu.gov.cn/api/js4.0/opensource/openlibrary/HeatmapOverlay.js';
      script.async = false; // 设置为同步加载确保顺序正确
      
      script.onload = () => {
        console.log('天地图热力图脚本加载成功');
        
        // 确认HeatmapOverlay对象已创建
        if (window.T && window.T.HeatmapOverlay) {
          console.log('成功获取HeatmapOverlay对象');
          setHeatmapScriptLoaded(true);
        } else {
          console.error('热力图脚本加载完成，但HeatmapOverlay对象不存在');
          
          // 尝试重新检查，可能有延迟
          setTimeout(() => {
            if (window.T && window.T.HeatmapOverlay) {
              console.log('延迟后获取到HeatmapOverlay对象');
              setHeatmapScriptLoaded(true);
            }
          }, 1000);
        }
      };
      
      script.onerror = (error) => {
        console.error('天地图热力图脚本加载失败:', error);
      };
      
      document.head.appendChild(script);
    };
    
    // 开始等待天地图API加载完成
    if (mapLoaded) {
      waitForTiandituAPI();
    }
    
    return () => {
      // 清理函数 - 如果组件卸载则移除脚本
      const heatmapScript = document.getElementById('tianditu-heatmap-script');
      if (heatmapScript) {
        heatmapScript.remove();
      }
    };
  }, [mapLoaded]);
  
  // 底部工具栏配置
  const toolbarItems: ToolButton[] = [
    { id: 'search', name: '搜索' },
    { id: 'draw', name: '绘制' },
    { id: 'layers', name: '图层' }
  ];
  
  // 处理图层切换
  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, isVisible: visible } 
        : layer
    ));
  };
  
  // 处理侧边栏切换
  const handleSidebarToggle = (type: 'search' | 'draw' | 'layers') => {
    setSidebar(prev => {
      // 如果点击当前打开的侧边栏类型，则关闭侧边栏
      if (prev.isOpen && prev.type === type) {
        setActiveTool(null);
        return { isOpen: false, type: null };
      }
      // 否则打开新的侧边栏
      setActiveTool(type);
      return { isOpen: true, type };
    });
  };
  
  // 处理底图变更 - 只更新UI状态
  const handleBasemapChange = (basemapType: BasemapType) => {
    setActiveBasemapId(basemapType);
  };
  
  // 地图加载完成的回调
  const handleMapLoaded = () => {
    console.log('天地图加载完成');
    setMapLoaded(true);
    
    // 地图加载完成后添加额外控件
    addMapControls();
  };
  
  // 添加地图控件（指南针和全屏）
  const addMapControls = () => {
    if (!tiandituMapRef.current) return;
    
    try {
      const map = tiandituMapRef.current.getMap();
      if (!map || !window.T) return;
      
      // 指南针控件也被移除，因为API中可能不存在
      console.log('仅使用天地图默认控件');
    } catch (err) {
      console.error('添加地图控件失败:', err);
    }
  };
  
  // 处理位置选择
  const handleLocationSelect = (location: GeocodeResult) => {
    if (!tiandituMapRef.current) {
      console.error('地图实例不存在，无法定位');
      return;
    }
    
    if (!location.center || !Array.isArray(location.center) || location.center.length < 2) {
      console.error('无效的位置坐标:', location.center);
      return;
    }
    
    const [lng, lat] = location.center;
    
    if (!lng || !lat || isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
      console.error('位置坐标值无效:', lng, lat);
      return;
    }
    
    // 使用天地图的方法进行定位
    const map = tiandituMapRef.current.getMap();
    if (map) {
      try {
        console.log('平移地图到位置:', location.center, '位置名称:', location.name);
        
        // 清除现有的标记，避免叠加
        map.clearOverLays();
        
        // 创建坐标点 - 确保使用正确的经纬度格式
        const lnglat = new window.T.LngLat(lng, lat);
        
        // 设置地图中心和缩放级别 - 使用panTo而不是centerAndZoom来实现平滑的过渡
        map.panTo(lnglat);
        map.setZoom(14); // 设置合适的缩放级别
        
        // 创建标记点
        const marker = new window.T.Marker(lnglat);
        
        // 创建信息窗口，显示位置信息
        const infoWindow = new window.T.InfoWindow(`
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 5px 0;">${location.name}</h4>
            ${location.address ? `<p style="margin: 0; font-size: 12px; color: #666;">${location.address}</p>` : ''}
            <p style="margin: 3px 0 0 0; font-size: 12px; color: #999;">经度: ${lng.toFixed(6)}, 纬度: ${lat.toFixed(6)}</p>
          </div>
        `);
        
        // 添加标记到地图
        map.addOverLay(marker);
        
        // 为标记添加点击事件，显示信息窗口
        marker.addEventListener('click', function() {
          marker.openInfoWindow(infoWindow);
        });
        
        // 延迟一下自动打开信息窗口，确保地图已完成平移
        setTimeout(() => {
          marker.openInfoWindow(infoWindow);
        }, 300);
        
        // 关闭侧边栏
        handleCloseSidebar();
      } catch (err) {
        console.error('定位到搜索位置时出错:', err);
      }
    } else {
      console.warn('无法获取地图实例');
    }
  };
  
  // 关闭侧边栏
  const handleCloseSidebar = () => {
    setSidebar({ isOpen: false, type: null });
    setActiveTool(null);
  };
  
  // 组合所有样式
  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    ...style
  };
  
  // 组合className
  const containerClassName = `map-container ${className}`.trim();
  
  return (
    <div style={containerStyle} className={containerClassName} ref={mapContainerRef}>
      {/* 天地图组件 */}
      <TiandituMap
        ref={tiandituMapRef}
        width="100%"
        height="100%"
        center={[114.0579, 22.5431]} // 深圳中心坐标
        zoom={12}
        onMapLoaded={handleMapLoaded}
        onBasemapChange={handleBasemapChange}
      />
      
      {/* 热力图图层 - 只有在地图加载完成且热力图脚本加载完成后才渲染 */}
      {mapLoaded && heatmapScriptLoaded && tiandituMapRef.current && (
        <>
          {/* 中国城市热力图 */}
          <HeatmapLayer 
            map={tiandituMapRef.current.getMap()} 
            data={heatmapData.china}
            visible={layers.find(l => l.id === 'heatmap-china')?.isVisible || false}
            maxValue={300}
            radius={30}
          />
          
          {/* 深圳热力图 */}
          <HeatmapLayer 
            map={tiandituMapRef.current.getMap()} 
            data={heatmapData.shenzhen}
            visible={layers.find(l => l.id === 'heatmap-shenzhen')?.isVisible || false}
            maxValue={100}
            radius={25}
            gradient={{
              '0.4': 'blue',
              '0.6': 'cyan',
              '0.7': 'lime',
              '0.8': 'yellow',
              '1.0': 'red'
            }}
          />
          
          {/* 中国城市热力图(完整版) */}
          <HeatmapLayer 
            map={tiandituMapRef.current.getMap()} 
            data={heatmapData.chinaFull}
            visible={layers.find(l => l.id === 'heatmap-china-full')?.isVisible || false}
            maxValue={300}
            radius={30}
            gradient={{
              '0.2': 'rgb(0, 255, 255)',
              '0.5': 'rgb(0, 110, 255)',
              '0.8': 'rgb(100, 0, 255)'
            }}
          />
        </>
      )}
      
      {/* 自定义定位控件 */}
      {mapLoaded && (
        <div 
          className="location-control" 
          title="定位到当前城市"
          onClick={() => {
            if (tiandituMapRef.current && window.T) {
              try {
                const map = tiandituMapRef.current.getMap();
                const localCity = new window.T.LocalCity();
                localCity.location((result: any) => {
                  if (result && result.lnglat) {
                    // 定位到当前城市
                    map.centerAndZoom(result.lnglat, 12);
                    
                    // 清除现有标记
                    map.clearOverLays();
                    
                    // 添加定位标记
                    const marker = new window.T.Marker(result.lnglat);
                    map.addOverLay(marker);
                    
                    // 可选: 显示城市名称信息窗口
                    if (result.cityName) {
                      const infoWindow = new window.T.InfoWindow(
                        `<div style="padding: 5px;"><b>当前城市: ${result.cityName}</b></div>`
                      );
                      marker.openInfoWindow(infoWindow);
                    }
                  }
                });
              } catch (err) {
                console.error('定位功能错误:', err);
              }
            }
          }}
        >
          <div className="location-icon"></div>
        </div>
      )}
      
      {/* 底部控制栏 */}
      {!hideDefaultControls && mapLoaded && (
        <BottomControlBar
          tools={toolbarItems}
          activeTool={activeTool}
          onToolSelect={handleSidebarToggle}
        />
      )}
      
      {/* 侧边栏 */}
      {sidebar.isOpen && sidebar.type === 'search' && (
        <SearchSidebar
          onClose={handleCloseSidebar}
          onLocationSelect={handleLocationSelect}
        />
      )}
      
      {sidebar.isOpen && sidebar.type === 'draw' && (
        <DrawingSidebar
          onClose={handleCloseSidebar}
          mapRef={tiandituMapRef}
        />
      )}
      
      {sidebar.isOpen && sidebar.type === 'layers' && (
        <LayersSidebar
          onClose={handleCloseSidebar}
          layers={layers}
          onToggleLayer={handleLayerToggle}
        />
      )}
    </div>
  );
};

export default MapContainer; 