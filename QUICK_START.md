# 快速启动指南

## ✅ 已完成

- [x] 项目结构创建
- [x] Git 仓库初始化
- [x] 配置文件创建
- [x] 权限控制配置
- [x] 主应用基础代码

## 🚀 下一步操作

### 1. 安装依赖（首次运行）

```bash
cd E:\frame\erp-web
pnpm install
```

**说明**: 这会安装所有依赖，可能需要 2-5 分钟

### 2. 启动开发服务器

```bash
pnpm dev:main
```

### 3. 访问应用

打开浏览器访问：http://localhost:3100

## 📁 项目结构

```
erp-web/
├── .github/              # GitHub 配置
│   ├── CODEOWNERS       # 代码所有权
│   ├── CORE_TEAM        # 核心团队成员
│   ├── scripts/         # 权限检查脚本
│   └── workflows/       # CI/CD
├── packages/
│   └── main/            # 主应用
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── router/
│       │   ├── pages/
│       │   └── styles/
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 🎯 常用命令

```bash
# 启动主应用
pnpm dev:main

# 构建所有应用
pnpm build

# 构建主应用
pnpm build:main

# 代码检查
pnpm lint
```

## 📝 下一步开发

### 添加新子应用

```bash
cd packages
pnpm create vite customer --template react-ts
```

### 修改核心团队成员

编辑 `.github/CORE_TEAM` 文件，添加 GitHub 用户名

### 推送到 GitHub

```bash
git add .
git commit -m "chore: 项目初始化"
git remote add origin <your-repo-url>
git push -u origin main
```

## ⚠️ 注意事项

1. 主应用 (`packages/main/`) 只有核心团队成员可以修改
2. 所有修改必须通过 PR 并经过审核
3. 确保安装了 Node.js >= 18 和 pnpm >= 8

## 🐛 常见问题

### 依赖安装失败

```bash
# 清除缓存重试
pnpm store prune
pnpm install
```

### 端口被占用

修改 `packages/main/vite.config.ts` 中的端口号

### TypeScript 报错

```bash
# 重新构建类型
pnpm build
```

