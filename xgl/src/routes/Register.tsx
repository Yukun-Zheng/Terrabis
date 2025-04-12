// 从React库导入React对象和useState钩子
import React, { useState } from 'react';
// 导入路由相关的钩子和组件
import { useNavigate, Link } from 'react-router-dom';
// 导入注册认证函数
import { register } from '../utils/auth';

// 注册页面组件
const Register: React.FC = () => {
  // 使用state钩子管理表单字段和状态
  const [username, setUsername] = useState('');   // 用户名
  const [password, setPassword] = useState('');   // 密码
  const [confirmPassword, setConfirmPassword] = useState('');  // 确认密码
  const [isAdmin, setIsAdmin] = useState(false);  // 是否注册为管理员
  const [adminKey, setAdminKey] = useState('');   // 管理员注册密钥
  const [error, setError] = useState<string | null>(null);  // 错误信息
  const [loading, setLoading] = useState(false);  // 加载状态
  // 获取导航函数，用于在注册成功后重定向
  const navigate = useNavigate();

  // 管理员注册密钥 (在实际应用中，这应该存储在服务器端)
  const ADMIN_REGISTRATION_KEY = 'admin123';

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // 阻止表单默认提交行为
    setError(null);  // 清除之前的错误信息

    // 基本验证
    if (!username || !password) {
      setError('请填写所有必填字段');
      return;
    }

    // 验证两次输入的密码是否一致
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    // 验证管理员注册密钥是否正确
    if (isAdmin && adminKey !== ADMIN_REGISTRATION_KEY) {
      setError('管理员注册密钥不正确');
      return;
    }

    setLoading(true);  // 设置加载状态

    try {
      // 调用注册API
      const user = await register(username, password, isAdmin);
      setLoading(false);
      
      // 根据用户角色跳转到不同页面
      if (user.role === 'admin') {
        navigate('/admin');  // 管理员跳转到管理页面
      } else {
        navigate('/chat');   // 普通用户跳转到聊天页面
      }
    } catch (err) {
      // 处理注册失败
      setLoading(false);
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 页面标题 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          注册新账户
        </h2>
      </div>

      {/* 注册表单卡片 */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 用户名输入框 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* 密码输入框 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* 确认密码输入框 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* 管理员选项复选框 */}
            <div className="flex items-center">
              <input
                id="isAdmin"
                name="isAdmin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                注册为管理员
              </label>
            </div>

            {/* 管理员密钥输入框，仅在选择管理员角色时显示 */}
            {isAdmin && (
              <div>
                <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700">
                  管理员注册密钥
                </label>
                <div className="mt-1">
                  <input
                    id="adminKey"
                    name="adminKey"
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  注册管理员需要密钥。测试密钥: admin123
                </p>
              </div>
            )}

            {/* 错误信息显示 */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 注册按钮 */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? '注册中...' : '注册'}
              </button>
            </div>
            
            {/* 登录链接 */}
            <div className="text-sm text-center">
              <p className="text-gray-600">
                已有账户？ 
                <Link to="/login" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
                  返回登录
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 