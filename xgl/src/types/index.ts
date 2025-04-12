// 用户角色枚举，定义系统中的用户类型
export enum UserRole {
  USER = 'user',    // 普通用户
  ADMIN = 'admin'   // 管理员用户
}

// 用户信息接口，定义用户对象的结构
export interface User {
  id: string;         // 用户唯一标识
  username: string;   // 用户名
  role: UserRole;     // 用户角色
  createdAt: string;  // 账户创建时间
  lastLogin: string;  // 最后登录时间
}

// 聊天消息接口，定义单条消息的结构
export interface ChatMessage {
  id: string;                  // 消息唯一标识
  content: string;             // 消息内容
  role: 'user' | 'assistant';  // 消息发送者角色（用户或AI助手）
  timestamp: string;           // 消息发送时间
}

// 聊天会话接口，定义完整对话的结构
export interface Chat {
  id: string;               // 会话唯一标识
  title: string;            // 会话标题
  messages: ChatMessage[];  // 会话中的消息列表
  createdAt: string;        // 会话创建时间
  updatedAt: string;        // 会话最后更新时间
  userId: string;           // 关联的用户ID
}

// 认证状态接口，用于管理用户登录状态
export interface AuthState {
  user: User | null;          // 当前用户信息
  isAuthenticated: boolean;   // 是否已认证
  loading: boolean;           // 加载状态
  error: string | null;       // 错误信息
} 