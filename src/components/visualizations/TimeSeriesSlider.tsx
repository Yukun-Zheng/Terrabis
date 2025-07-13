import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimeSeriesDataset, TimeSeriesPoint, filterTimeSeriesByTimeRange } from '../../data/TimeSeriesData';

// 时间步长枚举
enum TimeStep {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year'
}

// 播放状态枚举
enum PlayState {
  Stopped,
  Playing,
  Paused
}

// 时间滑块属性接口
interface TimeSeriesSliderProps {
  dataset: TimeSeriesDataset;            // 时间序列数据集
  onChange: (points: TimeSeriesPoint[], currentDate: Date) => void;  // 时间变化回调
  timeStep?: TimeStep;                   // 时间步长
  autoPlay?: boolean;                    // 是否自动播放
  playInterval?: number;                 // 播放间隔(毫秒)
  width?: number | string;               // 宽度
  height?: number | string;              // 高度
  position?: 'top' | 'bottom';           // 位置
  showControls?: boolean;                // 是否显示控制按钮
  showLabels?: boolean;                  // 是否显示标签
  customDateFormat?: (date: Date) => string; // 自定义日期格式化函数
}

/**
 * 时间序列滑块组件
 * 提供时间轴滑块控制，用于显示随时间变化的数据
 */
const TimeSeriesSlider: React.FC<TimeSeriesSliderProps> = ({
  dataset,
  onChange,
  timeStep = TimeStep.Month,
  autoPlay = false,
  playInterval = 1000,
  width = '100%',
  height = 60,
  position = 'bottom',
  showControls = true,
  showLabels = true,
  customDateFormat
}) => {
  // 如果数据集为空，则返回null
  if (!dataset || !dataset.points || dataset.points.length === 0) {
    return null;
  }
  
  // 提取时间范围
  const timeRange = dataset.timeRange || [
    new Date(Math.min(...dataset.points.map(p => p.timestamp))),
    new Date(Math.max(...dataset.points.map(p => p.timestamp)))
  ];
  
  // 计算时间点
  const [timePoints, setTimePoints] = useState<Date[]>([]);
  
  // 当前时间索引
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 播放状态
  const [playState, setPlayState] = useState<PlayState>(
    autoPlay ? PlayState.Playing : PlayState.Stopped
  );
  
  // 定时器ref
  const timerRef = useRef<number | null>(null);
  
  // 计算时间点
  useEffect(() => {
    if (!dataset || !timeRange || timeRange.length !== 2) return;
    
    const [startDate, endDate] = timeRange;
    const points: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      points.push(new Date(currentDate));
      
      // 根据时间步长添加时间
      switch (timeStep) {
        case TimeStep.Day:
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case TimeStep.Week:
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case TimeStep.Month:
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case TimeStep.Quarter:
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
        case TimeStep.Year:
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }
    }
    
    setTimePoints(points);
  }, [dataset, timeRange, timeStep]);
  
  // 当时间点变化时，触发回调
  useEffect(() => {
    if (timePoints.length === 0) return;
    
    const currentDate = timePoints[currentIndex];
    if (!currentDate) return;
    
    // 找出当前时间点的所有数据
    const nextDate = currentIndex < timePoints.length - 1 
      ? timePoints[currentIndex + 1] 
      : new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // 加一天
    
    const points = filterTimeSeriesByTimeRange(dataset, currentDate, nextDate);
    
    // 调用回调函数
    onChange(points, currentDate);
  }, [dataset, timePoints, currentIndex, onChange]);
  
  // 开始播放
  const startPlaying = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setPlayState(PlayState.Playing);
    
    timerRef.current = window.setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        // 如果到达末尾，则停止并重置
        if (nextIndex >= timePoints.length) {
          setPlayState(PlayState.Stopped);
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return nextIndex;
      });
    }, playInterval);
  }, [playInterval, timePoints.length]);
  
  // 暂停播放
  const pausePlaying = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlayState(PlayState.Paused);
  }, []);
  
  // 停止播放
  const stopPlaying = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlayState(PlayState.Stopped);
    setCurrentIndex(0);
  }, []);
  
  // 根据自动播放属性，自动开始播放
  useEffect(() => {
    if (autoPlay && timePoints.length > 0) {
      startPlaying();
    }
    
    // 组件卸载时清理定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoPlay, timePoints, startPlaying]);
  
  // 处理滑块变化
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = Number(event.target.value);
    setCurrentIndex(newIndex);
    
    // 如果正在播放，则暂停
    if (playState === PlayState.Playing) {
      pausePlaying();
    }
  };
  
  // 格式化日期
  const formatDate = (date: Date): string => {
    if (customDateFormat) {
      return customDateFormat(date);
    }
    
    // 默认格式化
    switch (timeStep) {
      case TimeStep.Day:
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      case TimeStep.Week:
        return `${date.getFullYear()}年第${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}周`;
      case TimeStep.Month:
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      case TimeStep.Quarter:
        return `${date.getFullYear()}年Q${Math.floor(date.getMonth() / 3) + 1}`;
      case TimeStep.Year:
        return `${date.getFullYear()}`;
      default:
        return date.toLocaleDateString();
    }
  };
  
  // 容器样式
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(5px)',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    width: width,
    height: height,
    boxSizing: 'border-box',
    ...(position === 'top' ? { top: '10px' } : { bottom: '40px' }),
  };
  
  // 控制按钮样式
  const buttonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px 10px',
    marginRight: '10px',
    borderRadius: '3px',
    backgroundColor: '#f0f0f0',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#333',
  };
  
  // 控制条样式
  const controlsContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  };
  
  // 日期标签样式
  const dateStyle: React.CSSProperties = {
    flex: 1,
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  };
  
  // 滑块容器样式
  const sliderContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };
  
  // 时间标签容器样式
  const timeLabelsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '5px',
    fontSize: '12px',
    color: '#666',
  };
  
  return (
    <div style={containerStyle}>
      {/* 控制按钮 */}
      {showControls && (
        <div style={controlsContainerStyle}>
          {playState === PlayState.Playing ? (
            <button 
              style={buttonStyle} 
              onClick={pausePlaying}
              title="暂停"
            >
              <span style={{ fontSize: '12px' }}>⏸️</span>
            </button>
          ) : (
            <button 
              style={buttonStyle} 
              onClick={startPlaying}
              title="播放"
            >
              <span style={{ fontSize: '12px' }}>▶️</span>
            </button>
          )}
          
          <button 
            style={buttonStyle} 
            onClick={stopPlaying}
            title="停止"
          >
            <span style={{ fontSize: '12px' }}>⏹️</span>
          </button>
          
          {/* 当前日期显示 */}
          <div style={dateStyle}>
            {timePoints[currentIndex] && formatDate(timePoints[currentIndex])}
          </div>
        </div>
      )}
      
      {/* 滑块控制 */}
      <div style={sliderContainerStyle}>
        <input 
          type="range"
          min={0}
          max={timePoints.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          style={{ width: '100%' }}
        />
        
        {/* 时间标签 */}
        {showLabels && timePoints.length > 0 && (
          <div style={timeLabelsStyle}>
            <span>{formatDate(timePoints[0])}</span>
            <span>{formatDate(timePoints[Math.floor(timePoints.length / 2)])}</span>
            <span>{formatDate(timePoints[timePoints.length - 1])}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSeriesSlider; 