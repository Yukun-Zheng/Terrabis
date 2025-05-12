import React, { useState, useEffect } from 'react';
import { TIANDITU_API_KEY } from '../../config/api-keys';
import { GeocodeResult } from '../../utils/geocodingUtils';

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
    
    try {
      // 使用天地图搜索API
      // 直接调用天地图搜索地理编码服务
      if (!window.T) {
        throw new Error('天地图API未加载');
      }
      
      // 创建天地图地址解析对象
      const geocoder = new window.T.Geocoder();
      
      // 使用Promise包装回调
      const results = await new Promise<GeocodeResult[]>((resolve, reject) => {
        // 使用getPoint方法代替getLocation，因为getLocation期望的可能是经纬度对象
        geocoder.getPoint(term, (result: any) => {
          if (result.getStatus() === 0) { // 0表示成功
            // 获取位置点，可能是单个点或者数组
            const location = result.getLocationPoint();
            if (!location) {
              resolve([]);
              return;
            }
            
            // 检查并处理返回值（可能是数组或单个对象）
            const locations = Array.isArray(location) ? location : [location];
            
            // 转换为我们的GeocodeResult格式
            const formattedResults = locations.map((item: any) => ({
              id: item.id || String(Math.random()),
              name: item.name || term,
              address: item.address || '',
              center: [item.lnt, item.lat] as [number, number],
              source: 'tianditu'
            }));
            resolve(formattedResults);
          } else {
            reject(new Error(`搜索失败，状态码: ${result.getStatus()}`));
          }
        });
      });
      
      setSearchResults(results);
      
      // 保存搜索记录
      saveSearch(term);
    } catch (err: any) {
      console.error('搜索地点失败:', err);
      setError(`搜索失败: ${err.message || '未知错误'}`);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
    </div>
  );
}; 