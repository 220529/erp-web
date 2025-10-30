# 技术栈说明

## 📋 完整技术选型

### 前端核心

| 技术 | 版本 | 说明 |
|------|------|------|
| **React** | 18.2+ | 前端框架，使用函数组件 + Hooks |
| **TypeScript** | 5.2+ | 类型安全，提升开发体验 |
| **Vite** | 5.0+ | 构建工具，快速的开发服务器 |
| **React Router** | 6.20+ | 前端路由管理 |

### 状态管理

| 技术 | 版本 | 说明 |
|------|------|------|
| **Zustand** | 4.4+ | 轻量级状态管理，简单易用 |

### UI 组件库

| 技术 | 版本 | 说明 |
|------|------|------|
| **Ant Design** | 5.12+ | 企业级 UI 组件库 |
| **@ant-design/icons** | 5.2+ | Ant Design 图标库 |

### CSS 相关

| 技术 | 版本 | 说明 |
|------|------|------|
| **Less** | 4.2+ | CSS 预处理器 |
| **CSS Modules** | - | 支持模块化 CSS |
| **PostCSS** | - | CSS 后处理工具（Vite 内置） |

### 工具库

| 技术 | 版本 | 说明 |
|------|------|------|
| **Axios** | 1.6+ | HTTP 请求库 |
| **Day.js** | 1.11+ | 轻量级日期处理库 |

### 代码质量

| 技术 | 版本 | 说明 |
|------|------|------|
| **ESLint** | 8.55+ | 代码检查工具 |
| **TypeScript ESLint** | 6.0+ | TypeScript 代码检查 |
| **Prettier** | - | 代码格式化（可选） |

### 包管理

| 技术 | 版本 | 说明 |
|------|------|------|
| **pnpm** | 8.0+ | 包管理器，支持 Monorepo |
| **pnpm Workspace** | - | Monorepo 工作空间 |

### 微前端

| 技术 | 版本 | 说明 |
|------|------|------|
| **Wujie** | (待集成) | 微前端框架，无界方案 |

### 后端相关

| 技术 | 版本 | 说明 |
|------|------|------|
| **NestJS** | - | Node.js 后端框架（erp-core） |
| **TypeORM** | - | ORM 框架 |
| **MySQL** | 8.0+ | 关系型数据库 |

---

## 🎨 样式系统

### Less 文件结构

```
src/styles/
├── theme.less          # Ant Design 主题变量覆盖
├── variables.less      # 自定义业务变量
├── mixins.less         # Less Mixins（工具函数）
└── global.less         # 全局样式（重置、工具类）
```

### 主题定制

可在 `vite.config.ts` 中的 `css.preprocessorOptions.less.modifyVars` 修改 Ant Design 主题：

```typescript
modifyVars: {
  '@primary-color': '#1890ff',      // 主色
  '@link-color': '#1890ff',         // 链接色
  '@success-color': '#52c41a',      // 成功色
  '@warning-color': '#faad14',      // 警告色
  '@error-color': '#f5222d',        // 错误色
  '@font-size-base': '14px',        // 基础字体大小
  '@border-radius-base': '4px',     // 组件圆角
}
```

### CSS Modules

支持 `.module.less` 文件，使用方式：

```tsx
// MyComponent.module.less
.container {
  padding: 24px;
  
  .title {
    font-size: 16px;
    color: @primary-color;
  }
}

// MyComponent.tsx
import styles from './MyComponent.module.less'

export default function MyComponent() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>标题</h1>
    </div>
  )
}
```

### 全局工具类

在 `global.less` 中提供了常用的工具类：

**布局类：**
- `.flex`、`.flex-center`、`.flex-between`
- `.flex-column`、`.flex-wrap`

**间距类：**
- `.m-xs`、`.m-sm`、`.m-md`、`.m-lg`
- `.p-xs`、`.p-sm`、`.p-md`、`.p-lg`

**文本类：**
- `.text-left`、`.text-center`、`.text-right`
- `.text-ellipsis`、`.text-ellipsis-2`

**阴影类：**
- `.shadow-sm`、`.shadow`、`.shadow-lg`

---

## 📦 项目结构

```
packages/main/
├── src/
│   ├── App.tsx                 # 应用入口
│   ├── main.tsx                # ReactDOM 渲染入口
│   ├── router/                 # 路由配置
│   │   └── index.tsx
│   ├── pages/                  # 页面组件
│   │   ├── Dashboard.tsx
│   │   └── CodeFlowList.tsx
│   ├── components/             # 通用组件
│   ├── services/               # API 服务
│   │   └── code.ts
│   ├── store/                  # 状态管理
│   ├── utils/                  # 工具函数
│   ├── styles/                 # 样式文件
│   │   ├── theme.less
│   │   ├── variables.less
│   │   ├── mixins.less
│   │   └── global.less
│   └── types/                  # TypeScript 类型定义
├── public/                     # 静态资源
├── package.json
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
└── .eslintrc.cjs               # ESLint 配置
```

---

## 🚀 开发规范

### 组件开发

```tsx
// 使用函数组件 + TypeScript
import React, { useState, useEffect } from 'react'
import { Button } from 'antd'
import styles from './MyComponent.module.less'

interface MyComponentProps {
  title: string
  onSubmit?: (value: string) => void
}

export default function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [value, setValue] = useState('')
  
  useEffect(() => {
    // 副作用逻辑
  }, [])
  
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <Button onClick={() => onSubmit?.(value)}>提交</Button>
    </div>
  )
}
```

### API 调用

```tsx
// services/user.ts
import axios from 'axios'

export interface User {
  id: number
  name: string
}

export async function getUser(id: number): Promise<User> {
  const response = await axios.get(`/api/users/${id}`)
  return response.data
}

// 使用
import { getUser } from '@/services/user'

const user = await getUser(1)
```

### 状态管理（Zustand）

```tsx
// store/user.ts
import { create } from 'zustand'

interface UserState {
  user: User | null
  setUser: (user: User) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

// 使用
import { useUserStore } from '@/store/user'

const user = useUserStore(state => state.user)
const setUser = useUserStore(state => state.setUser)
```

---

## 📝 命名规范

- **组件文件**: PascalCase（大驼峰）`MyComponent.tsx`
- **普通文件**: camelCase（小驼峰）`userService.ts`
- **样式文件**: kebab-case 或同组件名 `my-component.less` 或 `MyComponent.module.less`
- **常量**: UPPER_CASE（全大写） `const API_BASE_URL = '...'`
- **类型/接口**: PascalCase `interface UserInfo {}`

---

## 🔧 配置文件说明

### vite.config.ts
- **alias**: 路径别名配置（`@` 指向 `src`）
- **css**: Less 配置和主题定制
- **server**: 开发服务器配置
- **build**: 生产构建配置

### tsconfig.json
- TypeScript 编译配置
- 类型检查规则
- 路径映射

### package.json
- 项目依赖管理
- 脚本命令配置

---

## 🌐 浏览器兼容性

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

---

## 📚 参考文档

- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Ant Design 官方文档](https://ant.design/)
- [Less 官方文档](https://lesscss.org/)
- [Zustand 官方文档](https://github.com/pmndrs/zustand)

