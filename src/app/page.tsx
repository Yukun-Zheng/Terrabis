"use client"; // 地图组件通常需要客户端渲染

import MapContainer from "@/components/MapContainer"; // 使用别名导入
import React, { useEffect } from "react";
// 移除 Mapbox GL CSS 引入
// import 'mapbox-gl/dist/mapbox-gl.css';

export default function Home() {
  // 清除潜在的旧数据
  useEffect(() => {
    // 版本检查，用于控制迁移
    const CURRENT_VERSION = 'mapversion-1.1.0'; // 更新版本号表示使用天地图
    const storedVersion = localStorage.getItem('map-version');
    
    // 如果版本不匹配或不存在，执行迁移
    if (storedVersion !== CURRENT_VERSION) {
      console.log('检测到版本变更，重置地图配置');
      // 清除旧的存储
      localStorage.removeItem('map-layer-storage');
      localStorage.removeItem('map-draw-features');
      localStorage.removeItem('map-last-position');
      // 更新版本
      localStorage.setItem('map-version', CURRENT_VERSION);
    }
  }, []);

  return (
    <main style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 渲染MapContainer组件 */}
      <MapContainer />
    </main>
  );
} 