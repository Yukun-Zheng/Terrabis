// 从React库导入React对象
import React from 'react';
// 导入User类型定义
import { User } from '../types';

// 定义组件属性接口
interface UserInfoProps {
  users: User[];  // 用户列表数据
}

// 用户信息展示组件：展示用户列表的表格
const UserInfo: React.FC<UserInfoProps> = ({ users }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        {/* 表头部分 */}
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              用户名
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              角色
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              创建时间
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              最后登录
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              操作
            </th>
          </tr>
        </thead>
        {/* 表格内容部分 */}
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => {
            // 将ISO字符串转换为Date对象，用于格式化显示
            const createdDate = new Date(user.createdAt);
            const lastLoginDate = new Date(user.lastLogin);
            
            return (
              <tr key={user.id}>
                {/* 用户名和头像部分 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {/* 用户头像占位符 */}
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    {/* 用户名和ID信息 */}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                {/* 用户角色显示 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </td>
                {/* 创建时间显示 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {createdDate.toLocaleDateString()} {createdDate.toLocaleTimeString()}
                </td>
                {/* 最后登录时间显示 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lastLoginDate.toLocaleDateString()} {lastLoginDate.toLocaleTimeString()}
                </td>
                {/* 操作按钮区域 */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                    编辑
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    删除
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserInfo; 