# AI Study Project

一个基于 shadcn/ui 设计系统的现代化 AI 学习管理平台。

## 项目特色

### 🎨 现代化设计
- 采用 shadcn/ui 设计系统
- 支持明暗模式切换
- 响应式布局设计
- 流畅的背景渐变动画效果

### 📚 功能模块
- **笔记管理**: 创建、编辑、分类管理学习笔记
- **任务管理**: Todo 列表，支持优先级和截止日期
- **项目管理**: 项目进度跟踪和任务分配
- **AI 对话**: 智能助手功能
- **番茄钟**: 专注时间管理工具

### 🛠 技术栈
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **设计系统**: shadcn/ui
- **样式**: CSS Variables, HSL 颜色系统
- **动画**: CSS Animations, GPU 加速
- **架构**: 模块化 JavaScript, 路由系统

## 项目结构

```
├── index.html          # 主页面
├── styles.css          # 样式文件 (shadcn/ui 配色)
├── js/                 # JavaScript 模块
│   ├── app.js          # 应用主入口
│   ├── router.js       # 路由管理
│   ├── sidebar.js      # 侧边栏控制
│   ├── notesManager.js # 笔记管理
│   ├── todoManager.js  # 任务管理
│   ├── projectManager.js # 项目管理
│   ├── aiManager.js    # AI 对话
│   ├── pomodoroManager.js # 番茄钟
│   └── dataManager.js  # 数据管理
└── .gitignore          # Git 忽略文件
```

## 快速开始

1. 克隆项目到本地
2. 使用 HTTP 服务器运行项目（推荐使用 Python 的 http.server）
3. 在浏览器中访问 `http://localhost:8000`

## 设计系统

项目采用 shadcn/ui 设计系统，具有以下特点：

- **一致的配色方案**: 使用 CSS 变量定义的语义化颜色
- **现代化组件**: 卡片、按钮、表单等组件统一风格
- **无障碍支持**: 符合 WCAG 标准的颜色对比度
- **主题切换**: 支持明暗模式无缝切换

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License