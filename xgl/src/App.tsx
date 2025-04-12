// 从node_modules中的'react'中导入React对象
import React from 'react';
/*
  Router   作为根组件来包裹其他路由组件
  Routes   作为很多路由的集合
  Route    作为单个路由
  Navigate 作为重定向
*/
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// 导入页面路由组件
import Login from './routes/Login';
import Register from './routes/Register';
import UserChat from './routes/UserChat';
import Admin from './routes/Admin';
// 导入有关函数
import { isAuthenticated, getCurrentUser } from './utils/auth';
// 导入类型和接口
import { UserRole } from './types';

// 受保护的路由组件，控制用户访问权限
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: JSX.Element, 
  allowedRoles?: UserRole[] 
}) => {
  const user = getCurrentUser();
  const authenticated = isAuthenticated();
  const hasRequiredRole = allowedRoles.length === 0 || (user && allowedRoles.includes(user.role));

  if (!authenticated || (allowedRoles.length > 0 && !hasRequiredRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 主函数
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 普通用户聊天页面 */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <UserChat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat/:chatId" 
          element={
            <ProtectedRoute>
              <UserChat />
            </ProtectedRoute>
          } 
        />
        
        {/* 管理员页面 */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <Admin />
            </ProtectedRoute>
          } 
        />
        
        {/* 默认重定向到登录 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App; 