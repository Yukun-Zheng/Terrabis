import { User, UserRole } from '../types';

// 模拟用户数据
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

// 从本地存储加载用户数据
const loadUsers = (): void => {
  const storedUsers = localStorage.getItem('mockUsers');
  if (storedUsers) {
    mockUsers = JSON.parse(storedUsers);
  } else {
    // 首次使用，保存初始用户数据
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
  }
};

// 保存用户数据到本地存储
const saveUsers = (): void => {
  localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
};

// 初始加载
loadUsers();

export const login = (username: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // 模拟API调用延迟
    setTimeout(() => {
      const user = mockUsers.find(user => user.username === username);
      
      if (user && password === '123456') { // 简单密码示例
        // 更新最后登录时间
        user.lastLogin = new Date().toISOString();
        saveUsers();
        
        // 保存到本地存储
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('用户名或密码错误'));
      }
    }, 500);
  });
};

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

      // 创建新用户
      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        role: isAdmin ? UserRole.ADMIN : UserRole.USER,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // 添加到用户列表
      mockUsers.push(newUser);
      saveUsers();

      // 保存到本地存储
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      resolve(newUser);
    }, 500);
  });
};

export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const getAllUsers = (): User[] => {
  return [...mockUsers];
}; 