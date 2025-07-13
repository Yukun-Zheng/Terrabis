import React, { useRef, useEffect, forwardRef } from 'react';
import TiandituMap, { BasemapType } from '../TiandituMap';

interface MapInstanceProps {
  onMapLoaded?: () => void;
  onBasemapChange?: (basemapType: BasemapType) => void;
}

const MapInstance = forwardRef<any, MapInstanceProps>(({ onMapLoaded, onBasemapChange }, ref) => {
  // 只用一个ref
  return (
    <TiandituMap
      ref={ref}
      width="100%"
      height="100%"
      center={[114.0579, 22.5431]} // 深圳中心坐标
      zoom={12}
      onMapLoaded={onMapLoaded}
      onBasemapChange={onBasemapChange}
    />
  );
});

export default MapInstance; 