# 天地图GIS API接口技术文档

## 1. 项目概述

天地图GIS API是一个基于天地图和Mapbox GL JS的地图服务接口封装，提供了丰富的地图操作和地理数据处理功能。本文档详细说明了如何在项目中集成和使用该API，以及各接口的功能、输入参数和输出结果。

### 1.1 主要功能

- 地图底图管理：支持矢量图、影像图和地形图三种底图类型的切换
- 图层控制：添加、移除和管理不同类型的地图图层
- 数据可视化：支持热力图、蜂窝图、分级设色图等多种数据可视化方式
- GeoJSON处理：加载和展示GeoJSON格式的地理数据
- 事件处理：提供地图事件的监听和处理机制

### 1.2 技术栈

- 前端框架：React + TypeScript + Next.js
- 地图引擎：天地图API + Mapbox GL JS
- 状态管理：Zustand
- 数据处理：GeoJSON

## 2. 快速开始

### 2.1 安装依赖

首先确保已安装必要的依赖包：

```bash
npm install
```

### 2.2 环境配置

在 `.env.local` 文件中设置必要的环境变量：

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 2.3 启动项目

启动开发服务器和代理服务：

```bash
# 同时启动前端应用和代理服务器
npm run dev:all

# 或者分别启动
npm run dev        # 启动Next.js应用
npm run basic-proxy # 启动代理服务器
```

## 3. API接口说明

### 3.1 初始化地图API

#### 示例代码

```tsx
import { useRef } from 'react';
import TiandituMap from '../components/TiandituMap';
import { createMapAPI, MapAPI } from '../api/MapAPI';

const MapComponent = () => {
  const mapRef = useRef<any>(null);
  let mapAPI: MapAPI;
  
  const handleMapLoaded = () => {
    // 创建地图API实例
    mapAPI = createMapAPI(mapRef);
  };
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <TiandituMap
        ref={mapRef}
        width="100%"
        height="100%"
        center={[114.0579, 22.5431]}
        zoom={12}
        onMapLoaded={handleMapLoaded}
      />
    </div>
  );
};
```

### 3.2 地图控制

#### 3.2.1 获取地图实例

```typescript
const map = mapAPI.getMap();
```

**输入**：无
**输出**：天地图地图实例对象

#### 3.2.2 设置地图中心点

```typescript
mapAPI.setCenter([116.3912, 39.9073]); // 北京坐标
```

**输入**：`center: [number, number]` - 经纬度坐标数组
**输出**：无

#### 3.2.3 设置缩放级别

```typescript
mapAPI.setZoom(12);
```

**输入**：`zoom: number` - 缩放级别（1-18）
**输出**：无

#### 3.2.4 切换底图类型

```typescript
// 切换到影像图
const success = mapAPI.switchBasemap('img');
```

**输入**：`type: 'vec' | 'img' | 'ter'` - 底图类型（矢量、影像、地形）
**输出**：`boolean` - 是否切换成功

#### 3.2.5 获取当前底图类型

```typescript
const currentType = mapAPI.getCurrentBasemap();
```

**输入**：无
**输出**：`'vec' | 'img' | 'ter'` - 当前底图类型

#### 3.2.6 调整地图视图范围

```typescript
// 调整地图视图到指定边界
mapAPI.fitBounds([[115.0, 22.0], [115.5, 22.5]]);
```

**输入**：`bounds: [[number, number], [number, number]]` - 西南角和东北角的经纬度坐标
**输出**：无

### 3.3 图层管理

#### 3.3.1 添加图层

```typescript
const layerId = mapAPI.addLayer({
  id: 'my-geojson-layer',
  name: '自定义GeoJSON图层',
  type: 'geojson',
  visible: true,
  opacity: 0.7,
  color: '#ff0000',
  fillColor: 'rgba(255, 0, 0, 0.2)',
  data: geoJsonData // GeoJSON数据对象
});
```

**输入**：`layer: ExtendedLayerItem` - 图层配置对象
**输出**：`string` - 图层ID，如果添加失败则返回空字符串

#### 3.3.2 移除图层

```typescript
const removed = mapAPI.removeLayer('my-geojson-layer');
```

**输入**：`layerId: string` - 要移除的图层ID
**输出**：`boolean` - 是否成功移除

#### 3.3.3 切换图层可见性

```typescript
const success = mapAPI.toggleLayerVisibility('my-geojson-layer', false); // 隐藏图层
```

**输入**：
- `layerId: string` - 图层ID
- `visible: boolean` - 是否可见

**输出**：`boolean` - 是否成功切换

#### 3.3.4 设置图层透明度

```typescript
const success = mapAPI.setLayerOpacity('my-geojson-layer', 0.5);
```

**输入**：
- `layerId: string` - 图层ID
- `opacity: number` - 透明度值（0-1）

**输出**：`boolean` - 是否成功设置

### 3.4 数据加载

#### 3.4.1 加载GeoJSON数据

```typescript
const geoJsonData = await mapAPI.loadGeoJson('/data/china.geojson');
```

**输入**：`url: string` - GeoJSON文件的URL
**输出**：`Promise<any>` - 解析后的GeoJSON数据对象

#### 3.4.2 加载多个GeoJSON数据

```typescript
const geoJsonDataArray = await mapAPI.loadMultipleGeoJson([
  '/data/china.geojson',
  '/data/provinces.geojson'
]);
```

**输入**：`urls: string[]` - GeoJSON文件URL数组
**输出**：`Promise<any[]>` - 解析后的GeoJSON数据对象数组

### 3.5 事件处理

#### 3.5.1 注册事件监听

```typescript
// 监听地图点击事件
mapAPI.on('click', (evt) => {
  const { lnglat } = evt;
  console.log('点击位置:', lnglat);
});
```

**输入**：
- `event: MapEventType` - 事件类型
- `callback: (...args: any[]) => void` - 回调函数

**输出**：无

支持的事件类型：
- `'load'` - 地图加载完成
- `'click'` - 地图点击
- `'move'` - 地图移动
- `'moveend'` - 地图移动结束
- `'zoom'` - 地图缩放
- `'rotate'` - 地图旋转
- `'basemapchange'` - 底图切换
- `'layeradd'` - 添加图层
- `'layerremove'` - 移除图层

#### 3.5.2 移除事件监听

```typescript
// 移除地图点击事件监听
mapAPI.off('click', myClickHandler);
```

**输入**：
- `event: MapEventType` - 事件类型
- `callback: (...args: any[]) => void` - 要移除的回调函数

**输出**：无

## 4. 类型定义

### 4.1 图层类型

```typescript
// 图层类型
export type LayerType = 'vector' | 'raster' | 'hexbin' | 'choropleth' | 'bubble' | 'heatmap' | 'geojson' | 'other';

// 扩展图层项接口
export interface ExtendedLayerItem {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  source?: string;
  sourceLayer?: string;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  minZoom?: number;
  maxZoom?: number;
  group?: string;
  dataType?: 'population' | 'gdp' | 'urbanization' | 'health' | 'landuse';
  region?: 'china' | 'guangdong' | 'shenzhen';
  onToggle?: (visible: boolean) => void;
  fillColor?: string;
  data?: any; // GeoJSON数据
}
```

### 4.2 底图类型

```typescript
// 底图类型
export type BasemapType = 'vec' | 'img' | 'ter';
```

### 4.3 事件类型

```typescript
// 地图事件类型
export type MapEventType = 'load' | 'click' | 'move' | 'moveend' | 'zoom' | 'rotate' | 'basemapchange' | 'layeradd' | 'layerremove';
```

## 5. 代理服务器

天地图GIS API提供了代理服务器，用于解决跨域问题和API请求管理。

### 5.1 启动代理服务器

```bash
# 启动基础代理服务器
npm run basic-proxy

# 或启动完整代理服务器
npm run proxy
```

### 5.2 代理服务器端点

- 健康检查: `http://localhost:3001/health`
- 天地图代理: `http://localhost:3001/tianditu` 和 `/t0-t7`
- API信息: `http://localhost:3001/api/version`
- 代理状态: `http://localhost:3001/proxy-status`

## 6. 示例用例

### 6.1 创建简单地图

```tsx
import React, { useRef } from 'react';
import TiandituMap from '../components/TiandituMap';
import { createMapAPI } from '../api/MapAPI';

const SimpleMap = () => {
  const mapRef = useRef<any>(null);
  
  const handleMapLoaded = () => {
    const api = createMapAPI(mapRef);
    console.log('地图已加载完成');
  };
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <TiandituMap
        ref={mapRef}
        width="100%"
        height="100%"
        center={[114.0579, 22.5431]}
        zoom={12}
        onMapLoaded={handleMapLoaded}
      />
    </div>
  );
};
```

### 6.2 加载GeoJSON数据

```tsx
import React, { useRef, useEffect } from 'react';
import TiandituMap from '../components/TiandituMap';
import { createMapAPI, MapAPI } from '../api/MapAPI';

const GeoJSONMap = () => {
  const mapRef = useRef<any>(null);
  const apiRef = useRef<MapAPI | null>(null);
  
  useEffect(() => {
    if (mapRef.current && !apiRef.current) {
      const api = createMapAPI(mapRef);
      apiRef.current = api;
      
      // 加载GeoJSON数据
      api.loadGeoJson('/data/china.geojson').then(data => {
        if (data) {
          // 添加GeoJSON图层
          api.addLayer({
            id: 'china-borders',
            name: '中国边界',
            type: 'geojson',
            visible: true,
            opacity: 0.7,
            color: '#0066ff',
            fillColor: 'rgba(0, 102, 255, 0.2)',
            data: data
          });
        }
      });
    }
  }, [mapRef.current]);
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <TiandituMap
        ref={mapRef}
        width="100%"
        height="100%"
        center={[104.195, 35.675]} // 中国中心点
        zoom={4}
        onMapLoaded={() => {
          console.log('地图已加载');
        }}
      />
    </div>
  );
};
```

## 7. 代码解析

### 7.1 核心文件结构

```
src/
  ├── api/
  │   ├── MapAPI.ts              // 地图API封装
  │   └── MapAPIUsage.tsx        // API使用示例
  ├── components/
  │   ├── TiandituMap.tsx        // 天地图组件
  │   └── MapContainer.tsx       // 地图容器组件
  ├── hooks/
  │   ├── useGeoJsonLoader.ts    // GeoJSON加载Hook
  │   └── useLayerDataMap.ts     // 图层数据映射Hook
  ├── stores/
  │   └── mapStore.ts            // 地图状态管理
  ├── types/
  │   └── tianditu.d.ts          // 天地图类型定义
  └── utils/
      └── geoJsonLoader.ts       // GeoJSON加载工具
```

### 7.2 地图API类实现

地图API实现采用了适配器模式，封装了天地图原生API，提供了统一的接口。核心实现如下：

```typescript
// 创建地图API实例的工厂函数
export function createMapAPI(mapRef: MutableRefObject<any>): MapAPI {
  return new TiandituMapAPI(mapRef);
}

// 地图API实现类 - 封装地图实例
export class TiandituMapAPI implements MapAPI {
  private mapRef: MutableRefObject<any>;

  constructor(mapRef: MutableRefObject<any>) {
    this.mapRef = mapRef;
  }
  
  // 实现MapAPI接口的各种方法...
}
```

## 8. 常见问题解答

### 8.1 地图无法加载

**问题**：地图组件无法正常加载或显示

**解决方案**：
1. 确认天地图API密钥已正确设置在`.env.local`文件中
2. 检查代理服务器是否正常运行（`npm run basic-proxy`）
3. 检查浏览器控制台是否有错误信息
4. 尝试清除浏览器缓存

### 8.2 跨域问题

**问题**：加载GeoJSON或其他数据时遇到跨域问题

**解决方案**：
1. 确保代理服务器正常运行
2. 将数据文件放在`public/data`目录下
3. 使用相对路径访问数据（如`/data/file.geojson`）

### 8.3 图层不显示

**问题**：添加图层后在地图上不显示

**解决方案**：
1. 确认图层的`visible`属性设置为`true`
2. 检查图层的`opacity`是否大于0
3. 验证GeoJSON数据格式是否正确
4. 检查图层坐标系与地图坐标系是否匹配

## 9. 性能优化建议

1. **瓦片缓存**：配置适当的缓存策略减少请求数量
2. **延迟加载**：根据视图范围按需加载GeoJSON数据
3. **数据简化**：对于大型GeoJSON数据，使用简化算法减少点数量
4. **图层管理**：根据缩放级别控制图层显示，避免同时渲染过多图层

## 10. 更新和维护

API更新记录将在此文档中维护，请定期查看最新版本。

当前版本：v1.0.0
最后更新：2023年12月15日 