import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './routes/Login';
import Register from './routes/Register';
import UserChat from './routes/UserChat';
import Admin from './routes/Admin';
import { isAuthenticated, getCurrentUser } from './utils/auth';
import { UserRole } from './types';

// 受保护的路由组件
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