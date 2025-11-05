# Vue 监控系统前端

这是一个基于 Vue 3 + Vite 的监控系统前端项目。

## 功能特性

- 📊 监控统计 Dashboard - 展示系统资源使用统计
- 📈 实时监控详情 - 展示各服务器的实时监控数据
- 📉 数据可视化 - 使用 ECharts 展示图表
- 🔄 自动刷新 - 定时自动更新监控数据

## 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- pnpm (推荐) 或 npm/yarn

## 安装依赖

```bash
pnpm install
```

## 配置说明

项目使用环境变量进行配置，首次运行需要创建 `.env` 文件：

1. 复制示例配置文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置你的 API 地址：

```env
# API 配置
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api
VITE_REFRESH_INTERVAL=30000
```

### 配置项说明

- `VITE_API_BASE_URL`: 后端 API 的基础地址
- `VITE_API_PREFIX`: API 路径前缀
- `VITE_REFRESH_INTERVAL`: 数据刷新间隔（毫秒）

## 开发

```bash
pnpm dev
```

项目将在 `http://localhost:5173` 启动。

## 构建

```bash
pnpm build
```

构建产物将输出到 `dist` 目录。

## 预览构建结果

```bash
pnpm preview
```

## 项目结构

```
src/
├── components/          # Vue 组件
│   ├── Dashboard.vue   # 统计 Dashboard
│   └── NewWelcome.vue  # 监控详情页面
├── config/             # 配置文件
│   └── index.js        # 配置管理
└── assets/             # 静态资源
```

## 注意事项

- `.env` 文件包含敏感配置信息，不会被提交到 Git
- 请确保 `.env.example` 文件与 `.env` 文件格式一致
- 修改配置后需要重启开发服务器才能生效