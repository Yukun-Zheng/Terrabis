import React, { useState } from 'react';
import { X, Download, Upload, RefreshCw } from 'lucide-react';

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
 * 内容区域样式
 */
const contentStyle: React.CSSProperties = {
  padding: '16px'
};

/**
 * 工具栏样式
 */
const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginBottom: '16px'
};

/**
 * 工具按钮样式
 */
const toolButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
  padding: '8px 12px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  background: 'white',
  cursor: 'pointer',
  fontSize: '14px'
};

/**
 * 表格样式
 */
const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse'
};

/**
 * 表头单元格样式
 */
const thStyle: React.CSSProperties = {
  padding: '8px',
  textAlign: 'left',
  borderBottom: '2px solid #e0e0e0',
  fontWeight: 'bold'
};

/**
 * 表格单元格样式
 */
const tdStyle: React.CSSProperties = {
  padding: '8px',
  textAlign: 'left',
  borderBottom: '1px solid #e0e0e0'
};

/**
 * 分页容器样式
 */
const paginationStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '16px',
  gap: '8px'
};

/**
 * 分页按钮样式
 */
const paginationButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#e0e0e0',
  borderRadius: '4px',
  background: 'white',
  cursor: 'pointer'
};

/**
 * 激活的分页按钮样式
 */
const activePaginationButtonStyle: React.CSSProperties = {
  ...paginationButtonStyle,
  background: '#f0f0f0',
  borderColor: '#3388ff',
  fontWeight: 'bold'
};

/**
 * 表格侧边栏组件属性
 */
interface TableSidebarProps {
  onClose: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  onRefresh?: () => void;
  tableData?: {
    columns: string[];
    rows: any[];
  };
}

/**
 * 表格侧边栏组件
 */
export const TableSidebar: React.FC<TableSidebarProps> = ({
  onClose,
  onExport,
  onImport,
  onRefresh,
  tableData = { columns: [], rows: [] }
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  // 文件输入引用
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // 处理文件导入
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // 处理文件变化
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
    // 重置文件输入以允许再次选择相同的文件
    if (event.target) {
      event.target.value = '';
    }
  };
  
  // 计算总页数
  const totalPages = Math.ceil(tableData.rows.length / rowsPerPage);
  
  // 获取当前页的数据
  const currentData = tableData.rows.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );
  
  // 生成分页按钮
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // 前一页按钮
    buttons.push(
      <button
        key="prev"
        style={paginationButtonStyle}
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        上一页
      </button>
    );
    
    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          style={i === currentPage ? activePaginationButtonStyle : paginationButtonStyle}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    
    // 下一页按钮
    buttons.push(
      <button
        key="next"
        style={paginationButtonStyle}
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        下一页
      </button>
    );
    
    return buttons;
  };
  
  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>数据表格</h2>
        <button 
          onClick={onClose} 
          style={closeButtonStyle}
          aria-label="关闭表格"
        >
          <X size={20} />
        </button>
      </div>
      
      <div style={contentStyle}>
        <div style={toolbarStyle}>
          {onExport && (
            <button
              style={toolButtonStyle}
              onClick={onExport}
              title="导出数据"
            >
              <Download size={16} />
              <span>导出</span>
            </button>
          )}
          
          {onImport && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".csv,.xlsx,.json"
              />
              <button
                style={toolButtonStyle}
                onClick={handleImportClick}
                title="导入数据"
              >
                <Upload size={16} />
                <span>导入</span>
              </button>
            </>
          )}
          
          {onRefresh && (
            <button
              style={toolButtonStyle}
              onClick={onRefresh}
              title="刷新数据"
            >
              <RefreshCw size={16} />
              <span>刷新</span>
            </button>
          )}
        </div>
        
        {tableData.rows.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    {tableData.columns.map((column, index) => (
                      <th key={index} style={thStyle}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {tableData.columns.map((column, colIndex) => (
                        <td key={colIndex} style={tdStyle}>
                          {row[column] !== undefined ? row[column] : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div style={paginationStyle}>
                {renderPaginationButtons()}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            暂无数据
          </div>
        )}
      </div>
    </div>
  );
}; 