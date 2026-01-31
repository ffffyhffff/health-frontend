# 🏥 健康管理系统 - 前端

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Element_Plus-2.11-409EFF?style=for-the-badge&logo=element&logoColor=white" alt="Element Plus">
  <img src="https://img.shields.io/badge/ECharts-6.0-AA344D?style=for-the-badge&logo=apache-echarts&logoColor=white" alt="ECharts">
</p>

一个现代化的健康管理系统前端应用，提供健康资讯浏览、食谱管理、健康咨询、健康记录等功能，同时包含完整的管理后台。

## ✨ 功能特性

### 📱 用户端功能
- **健康资讯** - 浏览和查看健康相关的新闻资讯
- **健康食谱** - 发现和分享健康食谱
- **健康咨询** - 智能健康咨询服务
- **健康记录** - 个人健康数据记录与追踪
- **个人中心** - 用户信息管理
- **收藏功能** - 收藏喜欢的资讯和食谱

### 🔧 管理后台
- **数据概览** - 可视化数据统计面板
- **用户管理** - 管理系统用户
- **管理员管理** - 管理系统管理员
- **资讯管理** - 发布和管理健康资讯
- **食谱管理** - 审核和管理食谱内容

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| [Vue 3](https://vuejs.org/) | 渐进式 JavaScript 框架 |
| [Vite](https://vitejs.dev/) | 下一代前端构建工具 |
| [Vue Router](https://router.vuejs.org/) | Vue.js 官方路由 |
| [Element Plus](https://element-plus.org/) | Vue 3 UI 组件库 |
| [ECharts](https://echarts.apache.org/) | 数据可视化图表库 |
| [Axios](https://axios-http.com/) | HTTP 请求库 |
| [Markdown-it](https://github.com/markdown-it/markdown-it) | Markdown 解析器 |
| [Highlight.js](https://highlightjs.org/) | 代码语法高亮 |

## 📦 项目结构

```
health-frontend/
├── public/              # 静态资源
├── src/
│   ├── api/            # API 接口封装
│   ├── assets/         # 项目资源文件
│   ├── components/     # 公共组件
│   ├── data/           # 静态数据
│   ├── layouts/        # 布局组件
│   │   ├── AppLayout.vue      # 用户端布局
│   │   └── AdminLayout.vue    # 管理后台布局
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   │   ├── admin/      # 管理后台页面
│   │   ├── auth/       # 认证页面
│   │   ├── health/     # 健康相关页面
│   │   ├── news/       # 资讯页面
│   │   ├── profile/    # 个人中心页面
│   │   └── recipes/    # 食谱页面
│   ├── App.vue         # 根组件
│   ├── main.js         # 入口文件
│   ├── router.js       # 路由配置
│   └── style.css       # 全局样式
├── index.html          # HTML 模板
├── vite.config.js      # Vite 配置
└── package.json        # 项目依赖
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🔐 路由说明

| 路径 | 说明 | 权限 |
|------|------|------|
| `/login` | 登录页面 | 公开 |
| `/register` | 注册页面 | 公开 |
| `/app/news` | 健康资讯 | 需登录 |
| `/app/recipes` | 健康食谱 | 需登录 |
| `/app/health-consult` | 健康咨询 | 需登录 |
| `/app/health-record` | 健康记录 | 需登录 |
| `/app/profile` | 个人中心 | 需登录 |
| `/app/favorites` | 我的收藏 | 需登录 |
| `/admin/*` | 管理后台 | 需管理员权限 |

## 📝 开发说明

### 代码规范

- 使用 Vue 3 `<script setup>` 语法
- 组件采用单文件组件 (SFC) 格式
- 遵循 Element Plus 设计规范

### API 配置

API 接口配置位于 `src/api/` 目录，使用 Axios 进行 HTTP 请求。

## 📄 License

[MIT](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

<p align="center">Made with ❤️ by fyh</p>
