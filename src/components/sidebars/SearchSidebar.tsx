import React, { useState, useEffect, useRef } from 'react';
import { TIANDITU_API_KEY } from '../../config/api-keys';
import { GeocodeResult } from '../../utils/geocodingUtils';
import { debounce } from '../../utils/debounceUtils';

/**
 * 侧边栏样式
 */
const sidebarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '300px',
  height: '100%',
  backgroundColor: 'white',
  boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  transition: 'transform 0.3s ease',
  overflow: 'auto'
};

/**
 * 标题区域样式
 */
const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  borderBottom: '1px solid #e0e0e0'
};

/**
 * 关闭按钮样式
 */
const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

/**
 * 搜索表单样式
 */
const searchFormStyle: React.CSSProperties = {
  padding: '16px',
  borderBottom: '1px solid #e0e0e0'
};

/**
 * 搜索输入框容器样式
 */
const inputContainerStyle: React.CSSProperties = {
  display: 'flex',
  position: 'relative',
};

/**
 * 搜索输入框样式
 */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 16px',
  borderRadius: '4px',
  border: '1px solid #e0e0e0',
  fontSize: '16px',
};

/**
 * 搜索按钮样式
 */
const searchButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#666',
};

/**
 * 结果列表样式
 */
const resultsListStyle: React.CSSProperties = {
  padding: '0',
  margin: '0',
  listStyle: 'none',
};

/**
 * 结果项样式
 */
const resultItemStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #e0e0e0',
  cursor: 'pointer',
};

/**
 * 结果项悬停样式
 */
const resultItemHoverStyle: React.CSSProperties = {
  ...resultItemStyle,
  backgroundColor: '#f5f5f5',
};

/**
 * 搜索侧边栏组件属性
 */
interface SearchSidebarProps {
  onClose: () => void;
  onLocationSelect: (location: GeocodeResult) => void;
}

/**
 * 搜索侧边栏组件
 */
export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  onClose,
  onLocationSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const localSearchRef = useRef<any>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  
  // 监控isLoading状态变化，同步到ref
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // 初始化本地搜索
  useEffect(() => {
    const initializeSearch = () => {
      // 创建一个隐藏的地图容器，用于LocalSearch API
      if (!mapDivRef.current || !window.T) {
        console.warn('地图容器或天地图API未就绪，稍后重试');
        return false;
      }
      
      try {
        // 确保地图容器有唯一ID
        const containerId = `map-search-container-${Date.now()}`;
        mapDivRef.current.id = containerId;
        
        console.log(`创建搜索地图容器，ID: ${containerId}`);
        
        // 初始化一个小地图，它不会显示但会用于搜索
        const miniMap = new window.T.Map(containerId);
        
        // 设置为中国中心位置以获取更好的搜索结果
        miniMap.centerAndZoom(new window.T.LngLat(116.40969, 39.89945), 12);
        
        // 创建LocalSearch对象
        const searchConfig = {
          pageCapacity: 10,
          onSearchComplete: handleSearchComplete
        };
        
        localSearchRef.current = new window.T.LocalSearch(miniMap, searchConfig);
        console.log('LocalSearch已初始化');
        return true;
      } catch (err) {
        console.error('初始化LocalSearch失败:', err);
        setError('搜索功能初始化失败，请刷新页面重试');
        return false;
      }
    };
    
    // 如果天地图API已加载完成，则立即初始化
    if (window.T && typeof window.T.Map === 'function') {
      console.log('天地图API已就绪，初始化搜索功能');
      initializeSearch();
      return;
    }
    
    // 天地图API尚未加载完成，我们需要等待加载
    console.log('等待天地图API加载...');
    
    // 检查API是否正在加载中
    if (window.TIANDITU_API_LOADING) {
      // 如果正在加载，则使用轮询检查
      const checkInterval = setInterval(() => {
        if (window.T && typeof window.T.Map === 'function') {
          console.log('检测到天地图API已加载，初始化搜索功能');
          clearInterval(checkInterval);
          initializeSearch();
        }
      }, 500);
      
      // 10秒后如果还没加载成功，则清除定时器
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!localSearchRef.current) {
          console.error('等待天地图API超时');
          setError('地图API加载超时，请刷新页面重试');
        }
      }, 10000);
      
      return () => clearInterval(checkInterval);
    } else {
      // 可能页面没有使用天地图地图，此时搜索功能将不可用
      console.warn('天地图API未在加载中，搜索功能可能不可用');
      setError('搜索功能不可用，请刷新页面重试');
    }
  }, []);

  // 加载最近搜索记录
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('recent-searches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (err) {
      console.error('加载最近搜索记录失败:', err);
    }
  }, []);
  
  // 保存搜索记录
  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    
    try {
      // 添加到最近搜索数组前面，避免重复，并限制长度为5
      const updatedSearches = [
        term,
        ...recentSearches.filter(s => s !== term)
      ].slice(0, 5);
      
      setRecentSearches(updatedSearches);
      localStorage.setItem('recent-searches', JSON.stringify(updatedSearches));
    } catch (err) {
      console.error('保存搜索记录失败:', err);
    }
  };
  
  // 使用天地图API搜索地点
  const searchLocation = async (term: string) => {
    if (!term.trim()) return;
    
    setIsLoading(true);
    setError(null);
    console.log('===== 开始搜索地点 =====');
    console.log(`搜索关键词: "${term}"`);
    
    try {
      // 检查API是否加载
      if (!window.T || typeof window.T.Map !== 'function') {
        console.error('天地图API未加载，window.T不存在或不完整');
        throw new Error('天地图API未加载');
      }
      
      // 检查搜索对象是否初始化
      if (!localSearchRef.current) {
        console.error('LocalSearch未初始化');
        
        // 尝试重新初始化
        if (mapDivRef.current) {
          const containerId = `map-search-container-${Date.now()}`;
          mapDivRef.current.id = containerId;
          
          try {
            const miniMap = new window.T.Map(containerId);
            miniMap.centerAndZoom(new window.T.LngLat(116.40969, 39.89945), 12);
            
            localSearchRef.current = new window.T.LocalSearch(miniMap, {
              pageCapacity: 10,
              onSearchComplete: handleSearchComplete
            });
            
            console.log('重新初始化LocalSearch成功');
          } catch (initErr) {
            console.error('重新初始化LocalSearch失败:', initErr);
            throw new Error('搜索服务初始化失败，请刷新页面重试');
          }
        } else {
          throw new Error('搜索服务未准备好，请刷新页面重试');
        }
      }
      
      console.log('使用LocalSearch API搜索，设置搜索类型为4（建议词）');
      
      // 尝试搜索前清除可能存在的上一次结果
      try {
        if (typeof localSearchRef.current.clearResults === 'function') {
          localSearchRef.current.clearResults();
        }
      } catch (err) {
        console.warn('清除上一次搜索结果失败:', err);
      }
      
      // 执行搜索 - 使用类型参数4表示搜索建议词
      localSearchRef.current.search(term, 4);
      console.log('搜索请求已发送，等待回调结果');
      
      // 添加一个超时处理，防止回调不触发
      setTimeout(() => {
        if (isLoadingRef.current) {
          console.warn('搜索超时，强制重置状态');
          setIsLoading(false);
          setError('搜索请求超时，请重试');
        }
      }, 10000); // 10秒超时
      
    } catch (err: any) {
      console.error('搜索地点失败:', err);
      setError(`搜索失败: ${err.message || '未知错误'}`);
      setSearchResults([]);
      setIsLoading(false);
    }
  };
  
  // 处理搜索结果
  const handleSearchComplete = (result: any) => {
    setIsLoading(false);
    
    console.log('搜索完成，结果类型:', typeof result);
    console.log('搜索结果对象:', result);
    
    if (!result) {
      console.error('搜索结果为空');
      setError('搜索失败，请稍后重试');
      setSearchResults([]);
      return;
    }
    
    try {
      // 获取结果类型
      let resultType = -1;
      try {
        if (result.getResultType && typeof result.getResultType === 'function') {
          resultType = parseInt(result.getResultType());
          console.log('搜索结果类型:', resultType);
        }
      } catch (typeErr) {
        console.error('获取结果类型失败:', typeErr);
      }
      
      // 处理兴趣点结果 (类型1或0)
      if (resultType === 1 || resultType === 0) {
        let pois: any[] = [];
        try {
          if (result.getPois && typeof result.getPois === 'function') {
            pois = result.getPois() || [];
            console.log('获取到兴趣点数量:', pois.length);
          }
        } catch (poisErr) {
          console.error('获取兴趣点失败:', poisErr);
        }
        
        if (pois && pois.length > 0) {
          // 转换为应用的结果格式
          const formattedResults: GeocodeResult[] = pois.map((poi: any, index: number) => {
            // 解析经纬度
            let lng = 0, lat = 0;
            
            try {
              if (poi.lonlat) {
                // 可能是"116.4,39.9"格式
                const latlngArr = poi.lonlat.split(',');
                if (latlngArr.length >= 2) {
                  lng = parseFloat(latlngArr[0]);
                  lat = parseFloat(latlngArr[1]);
                  console.log(`解析坐标: ${lng}, ${lat}`);
                }
              } else if (poi.lnt && poi.lat) {
                // 可能是分开的lnt和lat属性
                lng = parseFloat(String(poi.lnt));
                lat = parseFloat(String(poi.lat));
                console.log(`使用lnt/lat属性: ${lng}, ${lat}`);
              }
            } catch (parseErr) {
              console.error(`解析坐标失败:`, parseErr);
            }
            
            return {
              id: poi.id || `poi-${index}-${Date.now()}`,
              name: poi.name || '未知地点',
              address: poi.address || '',
              center: [lng, lat] as [number, number],
              source: 'tianditu-localsearch'
            };
          }).filter((item: GeocodeResult) => 
            item.center[0] !== 0 && 
            item.center[1] !== 0
          );
          
          console.log('处理后的POI结果:', formattedResults);
          
          if (formattedResults.length > 0) {
            setSearchResults(formattedResults);
            setError(null);
            
            // 如果是从建议词点击来的，且只有一个结果，直接定位
            if (searchResults.length > 0 && 
                searchResults[0].center[0] === 0 && 
                searchResults[0].center[1] === 0 && 
                formattedResults.length === 1) {
              console.log('从建议词搜索到单一结果，自动定位');
              onLocationSelect(formattedResults[0]);
            }
            
            // 保存搜索记录
            if (searchTerm) {
              saveSearch(searchTerm);
            }
          } else {
            setError('找不到有效的位置坐标');
            // 保留原始结果，不要清空
          }
        } else {
          setError('未找到匹配的位置详情');
          // 不清空之前的搜索建议结果
        }
      }
      // 处理建议词结果 (类型4)
      else if (resultType === 4) {
        // 直接获取建议词列表
        let suggests: any[] = [];
        try {
          if (result.getSuggests && typeof result.getSuggests === 'function') {
            suggests = result.getSuggests() || [];
            console.log('获取到建议词数量:', suggests.length);
          } else {
            console.warn('结果对象没有getSuggests方法');
          }
        } catch (suggestsErr) {
          console.error('获取建议词失败:', suggestsErr);
        }
        
        if (suggests && suggests.length > 0) {
          // 将建议词转换为结果格式
          const formattedResults: GeocodeResult[] = suggests.map((suggest: any, index: number) => {
            return {
              id: `suggest-${index}-${Date.now()}`,
              name: suggest.name || '未知地点',
              address: suggest.address || '',
              center: [0, 0] as [number, number], // 建议词没有坐标，后续处理
              source: 'tianditu-suggest'
            };
          });
          
          console.log('格式化后的建议词:', formattedResults);
          
          setSearchResults(formattedResults);
          setError(null); // 清除之前的错误
        } else {
          // 如果没有建议词，尝试获取POI结果
          let pois: any[] = [];
          try {
            if (result.getPois && typeof result.getPois === 'function') {
              pois = result.getPois() || [];
              console.log('获取到兴趣点数量:', pois.length);
            }
          } catch (poisErr) {
            console.error('获取兴趣点失败:', poisErr);
          }
          
          if (pois && pois.length > 0) {
            // 处理POI结果
            // ... 与上面POI处理相同的代码 ...
            const formattedResults: GeocodeResult[] = pois.map((poi: any, index: number) => {
              let lng = 0, lat = 0;
              
              try {
                if (poi.lonlat) {
                  const latlngArr = poi.lonlat.split(',');
                  if (latlngArr.length >= 2) {
                    lng = parseFloat(latlngArr[0]);
                    lat = parseFloat(latlngArr[1]);
                  }
                } else if (poi.lnt && poi.lat) {
                  // 可能是分开的lnt和lat属性
                  lng = parseFloat(String(poi.lnt));
                  lat = parseFloat(String(poi.lat));
                }
              } catch (parseErr) {
                console.error(`解析坐标失败:`, parseErr);
              }
              
              return {
                id: poi.id || `poi-${index}-${Date.now()}`,
                name: poi.name || '未知地点',
                address: poi.address || '',
                center: [lng, lat] as [number, number],
                source: 'tianditu-localsearch'
              };
            }).filter((item: GeocodeResult) => 
              item.center[0] !== 0 && 
              item.center[1] !== 0
            );
            
            if (formattedResults.length > 0) {
              setSearchResults(formattedResults);
              setError(null);
              
              // 保存搜索记录
              if (searchTerm) {
                saveSearch(searchTerm);
              }
            } else {
              setError('未找到匹配的位置，请尝试其他关键词');
              setSearchResults([]);
            }
          } else {
            setError('未找到匹配的位置，请尝试其他关键词');
            setSearchResults([]);
          }
        }
      } else {
        // 其他类型的结果
        setError('未找到匹配的位置，请尝试更具体的搜索关键词');
        // 尝试不清空之前的结果，可能还有用
      }
    } catch (err: any) {
      console.error('处理搜索结果时出错:', err);
      setError(`搜索失败: ${err.message || '未知错误'}`);
      // 不要清空搜索结果，可能部分信息还有用
    }
  };
  
  // 处理输入框变化，添加实时搜索
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // 如果有输入内容且长度大于1，触发搜索
    if (value.trim().length > 1) {
      debouncedSearch(value);
    } else if (value.trim() === '') {
      // 清空结果
      setSearchResults([]);
    }
  };
  
  // 防抖搜索，避免频繁请求
  const debouncedSearch = debounce((term: string) => {
    searchLocation(term);
  }, 500);
  
  // 处理搜索按钮点击
  const handleSearchClick = () => {
    searchLocation(searchTerm);
  };
  
  // 处理按回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation(searchTerm);
    }
  };
  
  // 处理结果项点击
  const handleResultClick = (result: GeocodeResult) => {
    // 如果是建议词或没有坐标，需要重新搜索获取坐标
    if (result.center[0] === 0 && result.center[1] === 0) {
      console.log('搜索结果没有坐标，执行详细搜索:', result.name);
      
      // 先设置搜索词
      setSearchTerm(result.name);
      setIsLoading(true);
      setError(null);
      
      try {
        // 检查API是否加载
        if (!window.T || typeof window.T.Map !== 'function') {
          console.error('天地图API未加载，window.T不存在或不完整');
          throw new Error('天地图API未加载');
        }
        
        // 检查搜索对象是否初始化
        if (!localSearchRef.current) {
          console.error('LocalSearch未初始化，无法执行详细搜索');
          throw new Error('搜索服务未准备好');
        }
        
        // 执行POI搜索（类型为1，表示搜索兴趣点）而不是建议词搜索
        console.log('使用类型1执行详细POI搜索');
        localSearchRef.current.search(result.name, 1);
        
        // 在详细POI搜索回调中，会调用handleSearchComplete并处理坐标
      } catch (err) {
        console.error('执行详细搜索失败:', err);
        setIsLoading(false);
        setError('无法获取地点详细信息');
      }
      
      return;
    }
    
    // 有坐标的情况，直接传递给父组件处理
    console.log('搜索结果有坐标，直接定位到:', result.center);
    onLocationSelect(result);
  };
  
  // 处理最近搜索项点击
  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
    searchLocation(term);
  };
  
  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>搜索位置</h2>
        <button 
          onClick={onClose} 
          style={closeButtonStyle}
          aria-label="关闭搜索"
        >
          ✕
        </button>
      </div>
      
      <form style={searchFormStyle} onSubmit={(e) => { e.preventDefault(); }}>
        <div style={inputContainerStyle}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="输入地点名称..."
            style={inputStyle}
          />
          <button 
            type="submit" 
            style={searchButtonStyle}
            disabled={isLoading || !searchTerm.trim()}
            onClick={handleSearchClick}
          >
            {isLoading ? '搜索中...' : '搜索'}
          </button>
        </div>
      </form>
      
      {error && (
        <div style={{ padding: '10px', color: 'red', fontSize: '14px', backgroundColor: 'rgba(255, 0, 0, 0.05)' }}>
          {error}
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          borderTop: '1px solid #eee'
        }}>
          <h4 style={{ margin: '10px', fontSize: '14px', color: '#666' }}>搜索结果</h4>
          <ul style={resultsListStyle}>
            {searchResults.map((result) => (
              <li
                key={result.id}
                style={resultItemStyle}
                onClick={() => handleResultClick(result)}
              >
                <div style={{ fontWeight: 'bold' }}>{result.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{result.address}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {recentSearches.length > 0 && !isLoading && searchResults.length === 0 && (
        <div style={{
          padding: '10px',
          borderTop: '1px solid #eee'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>最近搜索</h4>
          <ul style={{
            listStyleType: 'none',
            padding: 0,
            margin: 0
          }}>
            {recentSearches.map((term, index) => (
              <li
                key={index}
                onClick={() => handleRecentSearchClick(term)}
                style={{
                  padding: '8px',
                  marginBottom: '5px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {term}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 隐藏的地图容器，用于LocalSearch API */}
      <div 
        ref={mapDivRef} 
        style={{ 
          width: '1px', 
          height: '1px', 
          position: 'absolute', 
          visibility: 'hidden',
          pointerEvents: 'none'
        }}
      ></div>
    </div>
  );
}; 