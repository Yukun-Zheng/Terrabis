import React from 'react';

interface LocationControlProps {
  mapLoaded: boolean;
  tiandituMapRef: React.MutableRefObject<any>;
}

const LocationControl: React.FC<LocationControlProps> = ({ mapLoaded, tiandituMapRef }) => {
  if (!mapLoaded) return null;
  return (
    <div 
      className="location-control" 
      title="定位到当前城市"
      onClick={() => {
        if (tiandituMapRef.current && window.T) {
          try {
            const map = tiandituMapRef.current.getMap();
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  const lnglat = new window.T.LngLat(lng, lat);
                  map.panTo(lnglat);
                  map.setZoom(13);
                  map.clearOverLays();
                  const marker = new window.T.Marker(lnglat);
                  map.addOverLay(marker);
                  const infoWindow = new window.T.InfoWindow(
                    `<div style=\"padding: 8px;\"><b>您的位置</b><br>经度: ${lng.toFixed(6)}<br>纬度: ${lat.toFixed(6)}</div>`
                  );
                  marker.openInfoWindow(infoWindow);
                },
                (error) => {
                  // 浏览器定位失败，尝试IP定位
                  useIPLocation();
                }
              );
            } else {
              useIPLocation();
            }
            function useIPLocation() {
              let localCityInstance: any = null;
              const localCity = new window.T.LocalCity();
              localCityInstance = localCity;
              localCity.location((result: any) => {
                if (result && result.lnglat) {
                  map.centerAndZoom(result.lnglat, 12);
                  map.clearOverLays();
                  const marker = new window.T.Marker(result.lnglat);
                  map.addOverLay(marker);
                  if (result.cityName) {
                    const infoWindow = new window.T.InfoWindow(
                      `<div style=\"padding: 8px;\"><b>当前城市: ${result.cityName}</b><br>经度: ${result.lnglat.lng.toFixed(6)}<br>纬度: ${result.lnglat.lat.toFixed(6)}</div>`
                    );
                    marker.openInfoWindow(infoWindow);
                  }
                } else {
                  alert('无法获取您的位置，请稍后重试');
                }
              });
            }
          } catch (err) {
            alert('定位服务出错，请稍后重试');
          }
        }
      }}
    >
      <div className="location-icon"></div>
    </div>
  );
};

export default LocationControl; 