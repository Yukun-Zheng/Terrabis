import React from 'react';
import ChartOverlay from '../visualizations/ChartOverlay';
import { useMapStore } from '../../stores/mapStore';

const ChartOverlayManager: React.FC<{ map: any }> = ({ map }) => {
  const chartOverlays = useMapStore(s => s.chartOverlays);
  const setChartOverlays = useMapStore(s => s.setChartOverlays);

  if (!map || !chartOverlays || chartOverlays.length === 0) return null;
  return (
    <>
      {chartOverlays.map((chart, index) => {
        if (!chart || !chart.data || !Array.isArray(chart.data)) return null;
        return (
          <ChartOverlay
            key={`chart-overlay-${index}`}
            map={map}
            data={chart.data}
            position={chart.position}
            title={chart.title}
            type={chart.type || 'bar'}
            visible={true}
            width={300}
            height={200}
            onClose={() => setChartOverlays(chartOverlays.filter((_, i) => i !== index))}
          />
        );
      })}
    </>
  );
};

export default ChartOverlayManager; 