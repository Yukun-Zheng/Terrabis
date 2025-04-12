// 从React库导入React对象和相关钩子
import React, { useState, KeyboardEvent } from 'react';

// 定义组件属性接口
interface ChatInputProps {
  onSendMessage: (message: string) => void;  // 发送消息的回调函数
  disabled?: boolean;                        // 是否禁用输入框
}

// 聊天输入组件：用于用户输入和发送消息
const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  // 使用state钩子管理消息内容
  const [message, setMessage] = useState('');

  // 处理消息发送逻辑
  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage(''); // 发送后清空输入框
    }
  };

  // 处理键盘事件，支持按Enter发送消息
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认的换行行为
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-300 bg-white py-4">
      <div className="mx-auto max-w-3xl px-4">
        <div className="relative flex items-center">
          {/* 消息输入文本框 */}
          <textarea
            className="w-full resize-none rounded-md border border-gray-300 py-3 pr-12 pl-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={1}
            placeholder="发送消息..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            style={{ minHeight: '56px', maxHeight: '200px' }}
          />
          {/* 发送按钮 */}
          <button
            className="absolute right-2 rounded-md p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
          >
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
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        {/* 提示文本 */}
        <p className="mt-2 text-xs text-gray-500 text-center">
          AI助手由最新模型提供支持。
        </p>
      </div>
    </div>
  );
};

export default ChatInput; 