// 从React库导入React对象
import React from 'react';
// 导入ChatMessage类型定义
import { ChatMessage as ChatMessageType } from '../types';

// 定义组件属性接口
interface ChatMessageProps {
  message: ChatMessageType;  // 单条消息数据
}

// 聊天消息组件：显示单条聊天消息
const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // 判断消息是否来自用户
  const isUser = message.role === 'user';
  
  return (
    <div className={`py-5 ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto px-4 flex">
        {/* 消息发送者头像 */}
        <div className="h-8 w-8 rounded-full mr-3 flex-shrink-0 flex items-center justify-center">
          {isUser ? (
            // 用户头像图标
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
              className="text-gray-700"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          ) : (
            // AI助手头像图标
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
              className="text-green-600"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          )}
        </div>
        {/* 消息内容区域 */}
        <div className="flex-1">
          {/* 消息发送者名称 */}
          <div className="font-medium mb-1">
            {isUser ? '你' : 'AI助手'}
          </div>
          {/* 消息文本内容 */}
          <div className="text-gray-700 prose">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 