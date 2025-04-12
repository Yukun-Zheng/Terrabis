// 从React库导入React对象和相关钩子
import React, { useState, useEffect } from 'react';
// 导入路由相关的钩子
import { useParams, useNavigate } from 'react-router-dom';
// 导入聊天相关组件
import ChatHistory from '../components/ChatHistory';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
// 导入类型定义
import { Chat, ChatMessage as ChatMessageType } from '../types';
// 导入认证相关函数
import { getCurrentUser, logout } from '../utils/auth';

// 用户聊天页面组件
const UserChat: React.FC = () => {
  // 获取URL中的chatId参数
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  // 使用state钩子管理聊天相关状态
  const [chats, setChats] = useState<Chat[]>([]);  // 所有聊天会话列表
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);  // 当前聊天会话
  const [loading, setLoading] = useState(false);  // 加载状态
  // 获取当前登录用户信息
  const user = getCurrentUser();

  // 初始化：加载聊天历史
  useEffect(() => {
    // 如果用户未登录，重定向到登录页
    if (!user) {
      navigate('/login');
      return;
    }

    // 示例聊天数据（实际应用中应从API获取）
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

    // 设置聊天列表
    setChats(exampleChats);

    // 如果URL中有chatId，则加载该聊天会话
    if (chatId) {
      const chat = exampleChats.find(c => c.id === chatId);
      if (chat) {
        setCurrentChat(chat);
      } else {
        // 如果chatId不存在，重定向到聊天主页
        navigate('/chat');
      }
    }
  }, [chatId, navigate, user]);

  // 处理登出逻辑
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 处理发送消息逻辑
  const handleSendMessage = (content: string) => {
    if (!content.trim() || loading) return;

    setLoading(true);  // 设置加载状态

    // 如果没有当前聊天，创建一个新的聊天会话
    if (!currentChat) {
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),  // 使用消息内容前30个字符作为标题
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id || 'unknown'
      };
      
      // 添加新聊天到列表并设置为当前聊天
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      navigate(`/chat/${newChat.id}`);  // 更新URL
    }

    // 创建更新后的聊天对象
    const updatedChat = { ...currentChat! };
    
    // 添加用户消息到聊天中
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    updatedChat.messages = [...updatedChat.messages, userMessage];
    updatedChat.updatedAt = new Date().toISOString();
    
    setCurrentChat(updatedChat);
    
    // 模拟AI响应延迟（实际应用中应调用AI API）
    setTimeout(() => {
      // 创建AI回复消息
      const aiMessage: ChatMessageType = {
        id: `msg-${Date.now() + 1}`,
        content: `这是对 "${content}" 的自动回复。在真实应用中，这里会返回AI生成的回复。`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      // 将AI回复添加到聊天中
      const finalChat = { 
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
        updatedAt: new Date().toISOString()
      };
      
      // 更新状态
      setCurrentChat(finalChat);
      setChats(prev => prev.map(c => c.id === finalChat.id ? finalChat : c));
      setLoading(false);  // 结束加载状态
    }, 1000);
  };

  // 处理新建聊天
  const handleNewChat = () => {
    setCurrentChat(null);
    navigate('/chat');
  };

  // 欢迎页面组件（当没有选中聊天时显示）
  const WelcomePage = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <h1 className="text-3xl font-bold mb-6">欢迎使用AI聊天助手</h1>
      <div className="max-w-md">
        <p className="mb-8 text-gray-600">
          开始一段新的对话，探索AI的可能性。
        </p>
        {/* 功能介绍卡片 */}
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
        {/* 开始对话按钮 */}
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
      {/* 侧边栏：聊天历史 */}
      <div className="flex-shrink-0 h-full">
        <ChatHistory chats={chats} onNewChat={handleNewChat} />
      </div>
      
      {/* 主体内容区域 */}
      <div className="flex-1 flex flex-col h-full">
        {/* 顶部导航栏 */}
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
        
        {/* 聊天消息内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {currentChat ? (
            // 如果有当前聊天，显示消息列表
            currentChat.messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))
          ) : (
            // 否则显示欢迎页面
            <WelcomePage />
          )}
        </div>
        
        {/* 底部消息输入框 */}
        <div className="mt-auto">
          <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
        </div>
      </div>
    </div>
  );
};

export default UserChat; 