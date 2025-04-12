// 从React库导入React对象和相关钩子
import React, { useEffect, useState } from 'react';
// 导入路由相关的钩子
import { useNavigate } from 'react-router-dom';
// 导入用户信息组件
import UserInfo from '../components/UserInfo';
// 导入类型定义
import { User, UserRole } from '../types';
// 导入认证相关函数
import { getCurrentUser, logout, getAllUsers } from '../utils/auth';

// 管理员页面组件
const Admin: React.FC = () => {
  const navigate = useNavigate();
  // 使用state钩子管理状态
  const [users, setUsers] = useState<User[]>([]);  // 用户列表
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('users');  // 当前活动标签
  // 获取当前登录用户信息
  const user = getCurrentUser();

  // 加载用户数据的函数
  const loadUsers = () => {
    setUsers(getAllUsers());
  };

  // 初始化：验证权限并加载数据
  useEffect(() => {
    // 检查用户权限，只允许管理员访问
    if (!user || user.role !== UserRole.ADMIN) {
      navigate('/login');
      return;
    }

    // 获取用户数据
    loadUsers();
  }, [navigate, user]);

  // 处理登出逻辑
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">管理员控制面板</h1>
              </div>
              {/* 导航标签按钮 */}
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'users'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  用户管理
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'stats'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  统计信息
                </button>
              </div>
            </div>
            {/* 用户信息和登出按钮 */}
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                {user?.username} (管理员)
              </span>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 根据当前活动标签显示不同内容 */}
          {activeTab === 'users' ? (
            // 用户管理标签内容
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">用户列表</h2>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  添加用户
                </button>
              </div>
              {/* 用户列表表格 */}
              <UserInfo users={users} />
            </div>
          ) : (
            // 统计信息标签内容
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">统计信息</h2>
              {/* 数据统计卡片网格 */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* 总用户数统计卡片 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          总用户数
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {users.length}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 今日活跃用户统计卡片 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          今日活跃用户
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {/* 计算今日登录的用户数量 */}
                            {users.filter(u => {
                              const lastLogin = new Date(u.lastLogin);
                              const today = new Date();
                              return lastLogin.getDate() === today.getDate() &&
                                     lastLogin.getMonth() === today.getMonth() &&
                                     lastLogin.getFullYear() === today.getFullYear();
                            }).length}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 本月新增用户统计卡片 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          本月新增用户
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {/* 计算本月注册的用户数量 */}
                            {users.filter(u => {
                              const creationDate = new Date(u.createdAt);
                              const today = new Date();
                              return creationDate.getMonth() === today.getMonth() &&
                                     creationDate.getFullYear() === today.getFullYear();
                            }).length}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin; 