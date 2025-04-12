import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatHistory from '../components/ChatHistory';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { Chat, ChatMessage as ChatMessageType } from '../types';
import { getCurrentUser, logout } from '../utils/auth';

const UserChat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const user = getCurrentUser();

  // 模拟加载聊天历史
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 示例聊天数据
    const exampleChats: Chat[] = [
      {
        id: '1',
        title: '关于人工智能的对话',
        messages: [
          {
            id: '1',
            content: '什么是人工智能？',
            role: 'user',
            timestamp: new Date(2023, 4, 10, 14, 30).toISOString()
          },
          {
            id: '2',
            content: '人工智能（AI）是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。这包括学习、推理、问题解决、感知和使用语言等。',
            role: 'assistant',
            timestamp: new Date(2023, 4, 10, 14, 31).toISOString()
          }
        ],
        createdAt: new Date(2023, 4, 10, 14, 30).toISOString(),
        updatedAt: new Date(2023, 4, 10, 14, 31).toISOString(),
        userId: user.id
      },
    ];

    setChats(exampleChats);

    if (chatId) {
      const chat = exampleChats.find(c => c.id === chatId);
      if (chat) {
        setCurrentChat(chat);
      } else {
        navigate('/chat');
      }
    }
  }, [chatId, navigate, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim() || loading) return;

    setLoading(true);

    // 如果没有当前聊天，创建一个新的
    if (!currentChat) {
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id || 'unknown'
      };
      
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      navigate(`/chat/${newChat.id}`);
    }

    const updatedChat = { ...currentChat! };
    
    // 添加用户消息
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    updatedChat.messages = [...updatedChat.messages, userMessage];
    updatedChat.updatedAt = new Date().toISOString();
    
    setCurrentChat(updatedChat);
    
    // 模拟AI响应延迟
    setTimeout(() => {
      const aiMessage: ChatMessageType = {
        id: `msg-${Date.now() + 1}`,
        content: `这是对 "${content}" 的自动回复。在真实应用中，这里会返回AI生成的回复。`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      const finalChat = { 
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
        updatedAt: new Date().toISOString()
      };
      
      setCurrentChat(finalChat);
      setChats(prev => prev.map(c => c.id === finalChat.id ? finalChat : c));
      setLoading(false);
    }, 1000);
  };

  const handleNewChat = () => {
    setCurrentChat(null);
    navigate('/chat');
  };

  // 欢迎页面（当没有选中聊天时显示）
  const WelcomePage = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <h1 className="text-3xl font-bold mb-6">欢迎使用AI聊天助手</h1>
      <div className="max-w-md">
        <p className="mb-8 text-gray-600">
          开始一段新的对话，探索AI的可能性。
        </p>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-8">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">提问</h3>
            <p className="text-sm text-gray-500">询问任何问题，获取详细解答</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">创作</h3>
            <p className="text-sm text-gray-500">获取文案和创意写作的帮助</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">学习</h3>
            <p className="text-sm text-gray-500">探索新主题，拓展知识边界</p>
          </div>
        </div>
        <button
          onClick={() => handleSendMessage("你好！告诉我今天可以做什么？")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          开始对话
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div className="flex-shrink-0 h-full">
        <ChatHistory chats={chats} onNewChat={handleNewChat} />
      </div>
      
      {/* 主体内容 */}
      <div className="flex-1 flex flex-col h-full">
        {/* 顶部导航 */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            {currentChat ? currentChat.title : 'AI聊天助手'}
          </h1>
          <div className="flex items-center">
            <span className="mr-4">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              退出登录
            </button>
          </div>
        </header>
        
        {/* 聊天内容 */}
        <div className="flex-1 overflow-y-auto">
          {currentChat ? (
            currentChat.messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))
          ) : (
            <WelcomePage />
          )}
        </div>
        
        {/* 输入框 */}
        <div className="mt-auto">
          <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
        </div>
      </div>
    </div>
  );
};

export default UserChat; 