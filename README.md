# Mapbox GL 地图应用框架

基于 Mapbox GL JS 的现代地图应用框架，提供灵活的底图切换、区域工具和地理空间分析功能。

## 特性

- 基于 Mapbox GL JS 的高性能地图渲染
- 模块化架构，便于扩展和集成新地图源
- 内置 ROI (感兴趣区域) 绘制工具
- 位置搜索和地理编码功能
- 地理数据表格导入/导出
- 响应式设计，适配各种设备尺寸
- 基于 TypeScript，类型安全

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript
- **地图引擎**: Mapbox GL JS
- **状态管理**: Zustand
- **UI 组件**: 自定义组件 + Lucide 图标

## 开发环境设置

### 安装依赖

```bash
# 安装项目依赖
npm install
```

### 环境变量配置

创建 `.env.local` 文件并配置以下环境变量：

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 启动开发环境

```bash
# 启动 Next.js 开发服务器
npm run dev
```

然后在浏览器中访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
├── public/                # 静态资源
├── src/
│   ├── api/               # API 相关代码
│   ├── app/               # Next.js App Router 页面
│   ├── components/        # React 组件
│   │   ├── controls/      # 地图控件组件
│   │   └── sidebars/      # 侧边栏组件
│   ├── config/            # 配置文件
│   ├── hooks/             # 自定义钩子
│   ├── stores/            # 状态管理
│   ├── styles/            # 样式文件
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
├── .env.local             # 本地环境变量
├── next.config.js         # Next.js 配置
├── package.json           # 项目依赖
└── tsconfig.json          # TypeScript 配置
```

## 核心组件

### 地图容器组件 (`MapContainer`)

主要地图容器，集成所有地图功能:

- 底图管理
- 控件集成
- 状态管理
- 事件处理

### 自定义钩子

- `useMapInitialization`: 地图初始化和基础配置
- `useBasemapToggle`: 底图切换功能
- `useMapStore`: 全局地图状态管理

### 控件组件

- `NavigationControl`: 地图导航和工具选择控件
- `BottomControlBar`: 底部信息栏和坐标显示
- 各类工具侧边栏组件

## 添加新地图源

要添加新的地图源，请按照以下步骤:

1. 在 `src/config/` 下创建新地图源配置文件
2. 更新 `useMapInitialization.ts` 中的 `MAP_SOURCE_TYPE` 枚举
3. 在 `useBasemapToggle.ts` 中添加新地图源切换逻辑
4. 在 `BasemapSidebar.tsx` 中添加新地图源选项

## 构建和部署

### 构建生产版本

```bash
# 构建前端应用
npm run build

# 启动生产服务器
npm start
```

## 扩展功能

该框架设计支持多种扩展:

1. 集成新的地图数据源
2. 添加自定义地图控件
3. 实现额外的空间分析工具
4. 添加新的数据可视化方式

## 许可证

MIT
# map
