# New-API 桌面管理客户端

基于 Rust + Tauri + React + TypeScript 构建的跨平台桌面管理客户端，用于远程管理 New-API 系统。

## 技术栈

### 后端 (Rust)
- **Tauri 2.0** - 跨平台桌面应用框架
- **reqwest** - HTTP 客户端
- **tokio** - 异步运行时
- **keyring** - 系统密钥链存储
- **rusqlite** - 本地数据库

### 前端 (React + TypeScript)
- **React 18** + **TypeScript**
- **Ant Design 5** - UI 组件库
- **Zustand** - 状态管理
- **React Router v6** - 路由
- **TailwindCSS** - 样式
- **Vite** - 构建工具

## 功能特性

### ✅ 已实现
- 🔐 用户认证（登录/登出）
- 💾 凭证安全存储（系统密钥链）
- 👥 用户管理（列表、搜索、创建、编辑、删除）
- 🎫 兑换码管理（列表、批量创建、清除失效）
- 📊 仪表盘概览

### 🚧 待实现
- 🔌 渠道管理
- 🤖 模型管理
- 🔑 令牌管理
- 📝 日志查询
- ⚙️ 系统设置

## 快速开始

### 开发环境要求
- Rust 1.70+
- Node.js 18+
- npm / yarn / bun

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run tauri dev
```

### 生产构建
```bash
npm run tauri build
```

## 使用说明

1. 启动应用后输入服务器地址（如 `https://your-api.com`）
2. 输入管理员用户名和密码登录
3. 通过侧边栏导航访问各功能模块

## 项目结构

```
newapiclient/
├── src-tauri/          # Rust 后端
│   ├── src/
│   │   ├── api/       # API 客户端
│   │   ├── auth/      # 认证管理
│   │   └── commands/  # Tauri Commands
│   └── Cargo.toml
├── src/                # React 前端
│   ├── layouts/       # 布局组件
│   ├── pages/         # 页面组件
│   ├── services/      # 服务层
│   └── stores/        # 状态管理
└── package.json
```

## 安全特性

- ✅ 凭证存储在系统密钥链
- ✅ HTTPS 强制通信
- ✅ Access Token 认证

## 版本

v0.1.0 - 初始版本

## 许可证

遵循 New-API 主项目许可证

## 推荐 IDE

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
