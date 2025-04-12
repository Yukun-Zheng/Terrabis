import React, { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-300 bg-white py-4">
      <div className="mx-auto max-w-3xl px-4">
        <div className="relative flex items-center">
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
        <p className="mt-2 text-xs text-gray-500 text-center">
          AI助手由最新模型提供支持。
        </p>
      </div>
    </div>
  );
};

export default ChatInput; 