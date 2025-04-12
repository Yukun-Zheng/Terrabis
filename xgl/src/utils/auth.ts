import { User, UserRole } from '../types';

// 模拟用户数据库，初始包含两个用户：普通用户和管理员
let mockUsers: User[] = [
  {
    id: '1',
    username: 'user',
    role: UserRole.USER,
    createdAt: new Date(2023, 0, 15).toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    id: '2',
    username: 'admin',
    role: UserRole.ADMIN,
    createdAt: new Date(2023, 0, 1).toISOString(),
    lastLogin: new Date().toISOString()
  }
];

// 从本地存储加载用户数据，保持用户数据持久化
const loadUsers = (): void => {
  const storedUsers = localStorage.getItem('mockUsers');
  if (storedUsers) {
    mockUsers = JSON.parse(storedUsers);
  } else {
    // 首次使用，保存初始用户数据到本地存储
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
  }
};

// 保存用户数据到本地存储
const saveUsers = (): void => {
  localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
};

// 初始化：加载用户数据
loadUsers();

// 用户登录功能，验证用户名和密码
export const login = (username: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // 模拟API调用延迟
    setTimeout(() => {
      const user = mockUsers.find(user => user.username === username);
      
      if (user && password === '123456') { // 简单密码示例，实际应用中应使用加密密码
        // 更新最后登录时间
        user.lastLogin = new Date().toISOString();
        saveUsers();
        
        // 保存当前用户信息到本地存储，实现登录状态持久化
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('用户名或密码错误'));
      }
    }, 500);
  });
};

// 用户注册功能，创建新用户
export const register = (username: string, password: string, isAdmin: boolean = false): Promise<User> => {
  return new Promise((resolve, reject) => {
    // 模拟API调用延迟
    setTimeout(() => {
      // 检查用户名是否已存在
      const existingUser = mockUsers.find(user => user.username === username);
      if (existingUser) {
        reject(new Error('用户名已存在'));
        return;
      }

      // 创建新用户对象
      const newUser: User = {
        id: `user-${Date.now()}`, // 使用时间戳创建唯一ID
        username,
        role: isAdmin ? UserRole.ADMIN : UserRole.USER, // 根据参数设置用户角色
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // 添加新用户到用户列表
      mockUsers.push(newUser);
      saveUsers();

      // 保存当前用户信息到本地存储，自动登录
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      resolve(newUser);
    }, 500);
  });
};

// 用户登出功能，清除当前用户信息
export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

// 获取当前登录用户信息
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// 获取所有用户列表，用于管理员功能
export const getAllUsers = (): User[] => {
  return [...mockUsers];
}; 