// 从node_modules中的'react'中导入React对象
import React from 'react';
// 从react-dom/client中导入ReactDOM，用于将React组件渲染到DOM中
import ReactDOM from 'react-dom/client';
// 导入全局CSS样式
import './index.css';
// 导入App组件，这是应用的根组件
import App from './App';

// 创建根渲染器，指定挂载到id为'root'的HTML元素
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// 渲染App组件
// React.StrictMode是一个工具，用于在开发模式下突出显示应用程序中的潜在问题
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 