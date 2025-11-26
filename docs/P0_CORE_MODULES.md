# P0 核心模块实施指南

> **精简实用，逐步实施，边做边验收**

---

## Week 1: 环境配置 + 状态管理

### 📌 Day 1: 环境配置

#### 创建环境文件

在 `packages/main/` 目录下创建：

**`.env.development`**:
```bash
# 开发环境
VITE_API_URL=http://localhost:3009
VITE_UPLOAD_URL=http://localhost:3009/api/upload
VITE_DEBUG=true
```

**`.env.production`**:
```bash
# 生产环境
VITE_API_URL=https://api.erp.com
VITE_UPLOAD_URL=https://cdn.erp.com/upload
VITE_DEBUG=false
```

#### 创建配置封装

**`packages/main/src/config/env.ts`**:
```typescript
export const ENV = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3009',
  uploadUrl: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:3009/api/upload',
  
  debug: import.meta.env.VITE_DEBUG === 'true',
} as const
```

#### 修改 request.ts

```typescript
import axios from 'axios'
import { ENV } from '@/config/env'

const request = axios.create({
  baseURL: ENV.apiUrl,  // 使用环境配置
  timeout: 30000,
})

// 开发环境打印请求日志
if (ENV.debug) {
  request.interceptors.request.use(config => {
    console.log('[Request]', config.method?.toUpperCase(), config.url)
    return config
  })
}

export default request
```

#### 验收
- [ ] 启动项目，检查 API 地址是否正确
- [ ] 切换环境构建，配置是否正确切换

---

### 📌 Day 2-3: 认证和用户状态

#### 安装依赖

```bash
cd packages/main
pnpm add zustand
```

#### 创建 useAuthStore

**`packages/main/src/store/useAuthStore.ts`**:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  setToken: (token: string) => void
  clearToken: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      
      setToken: (token) => set({ token, isAuthenticated: true }),
      clearToken: () => set({ token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)
```

#### 创建 useUserStore

**`packages/main/src/store/useUserStore.ts`**:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  username: string
  name: string
  role: string
}

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: 'user-storage' }
  )
)
```

#### 在登录页集成

```typescript
import { useAuthStore, useUserStore } from '@/store'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const setToken = useAuthStore(state => state.setToken)
  const setUser = useUserStore(state => state.setUser)
  const navigate = useNavigate()
  
  const handleLogin = async (values: LoginForm) => {
    const { token, user } = await login(values)
    setToken(token)
    setUser(user)
    navigate('/')
  }
}
```

#### 验收
- [ ] 登录后 localStorage 中有 `auth-storage` 和 `user-storage`
- [ ] 刷新页面，登录状态不丢失
- [ ] 退出登录，localStorage 清空

---

### 📌 Day 4-5: 权限菜单状态

#### 创建 useMenuStore

**`packages/main/src/store/useMenuStore.ts`**:
```typescript
import { create } from 'zustand'

interface MenuState {
  permissions: string[]
  setPermissions: (permissions: string[]) => void
  hasPermission: (permission: string) => boolean
  clearPermissions: () => void
}

export const useMenuStore = create<MenuState>((set, get) => ({
  permissions: [],
  
  setPermissions: (permissions) => set({ permissions }),
  
  hasPermission: (permission) => {
    const { permissions } = get()
    if (permissions.includes('*')) return true
    return permissions.includes(permission)
  },
  
  clearPermissions: () => set({ permissions: [] }),
}))
```

#### 统一导出

**`packages/main/src/store/index.ts`**:
```typescript
export { useAuthStore } from './useAuthStore'
export { useUserStore } from './useUserStore'
export { useMenuStore } from './useMenuStore'

export type { User } from './useUserStore'
```

#### 验收
- [ ] 3个 Store 都可以正常 import
- [ ] TypeScript 类型检查通过
- [ ] Store 状态读写正常

---

## Week 2: 权限控制系统

### 📌 Day 1: 权限常量

**`packages/main/src/auth/constants.ts`**:
```typescript
export const PERMISSIONS = {
  // 客户管理
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_EDIT: 'customer:edit',
  CUSTOMER_DELETE: 'customer:delete',
  
  // 订单管理
  ORDER_VIEW: 'order:view',
  ORDER_CREATE: 'order:create',
  ORDER_EDIT: 'order:edit',
  
  // 财务管理
  PAYMENT_VIEW: 'payment:view',
  PAYMENT_CREATE: 'payment:create',
  
  // 系统管理
  SYSTEM_MANAGE: 'system:manage',
} as const
```

---

### 📌 Day 2: 权限 Hook

**`packages/main/src/auth/usePermission.ts`**:
```typescript
import { useMenuStore } from '@/store'

export function usePermission() {
  const hasPermission = useMenuStore(state => state.hasPermission)
  
  return {
    hasPermission: (permission: string | string[]) => {
      if (Array.isArray(permission)) {
        return permission.some(p => hasPermission(p))
      }
      return hasPermission(permission)
    }
  }
}
```

---

### 📌 Day 3: 权限守卫组件

**`packages/main/src/auth/PermissionGuard.tsx`**:
```typescript
import React from 'react'
import { usePermission } from './usePermission'

interface Props {
  permission: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function PermissionGuard({ permission, children, fallback = null }: Props) {
  const { hasPermission } = usePermission()
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}
```

**使用示例**:
```typescript
import { PermissionGuard, PERMISSIONS } from '@/auth'

<PermissionGuard permission={PERMISSIONS.CUSTOMER_CREATE}>
  <Button type="primary">新增客户</Button>
</PermissionGuard>
```

---

### 📌 Day 4-5: 路由守卫

**`packages/main/src/auth/RouteGuard.tsx`**:
```typescript
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, useMenuStore } from '@/store'

interface Props {
  children: React.ReactNode
  permission?: string
}

export default function RouteGuard({ children, permission }: Props) {
  const location = useLocation()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const hasPermission = useMenuStore(state => state.hasPermission)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/403" replace />
  }
  
  return <>{children}</>
}
```

**在路由中使用**:
```typescript
import { RouteGuard, PERMISSIONS } from '@/auth'

const routes = [
  {
    path: '/customer',
    element: (
      <RouteGuard permission={PERMISSIONS.CUSTOMER_VIEW}>
        <CustomerPage />
      </RouteGuard>
    )
  }
]
```

#### 统一导出

**`packages/main/src/auth/index.ts`**:
```typescript
export { default as PermissionGuard } from './PermissionGuard'
export { default as RouteGuard } from './RouteGuard'
export { usePermission } from './usePermission'
export { PERMISSIONS } from './constants'
```

#### 验收
- [ ] 不同角色看到不同按钮
- [ ] 无权限访问受限页面跳转403
- [ ] 未登录跳转登录页

---

## Week 3: 微前端集成

### 📌 Day 1: 安装依赖

```bash
cd packages/main
pnpm add wujie-react
```

---

### 📌 Day 2-3: 基础配置

#### 子应用配置

**`packages/main/src/micro/apps.config.ts`**:
```typescript
import { ENV } from '@/config/env'

export interface MicroApp {
  name: string
  entry: string
  activeRule: string
  props?: any
}

export const microApps: MicroApp[] = [
  // 后续添加子应用
  // {
  //   name: 'customer',
  //   entry: ENV.isDev ? 'http://localhost:3201' : 'https://erp.com/customer',
  //   activeRule: '/customer',
  // }
]
```

#### 容器组件

**`packages/main/src/micro/MicroAppContainer.tsx`**:
```typescript
import React from 'react'
import WujieReact from 'wujie-react'
import { Spin } from 'antd'

interface Props {
  name: string
  url: string
  sync?: boolean
}

export default function MicroAppContainer({ name, url, sync = true }: Props) {
  return (
    <WujieReact
      width="100%"
      height="100%"
      name={name}
      url={url}
      sync={sync}
      loading={<Spin size="large" tip="加载中..." />}
    />
  )
}
```

#### 统一导出

**`packages/main/src/micro/index.ts`**:
```typescript
export { default as MicroAppContainer } from './MicroAppContainer'
export { microApps } from './apps.config'
export type { MicroApp } from './apps.config'
```

#### 验收
- [ ] Wujie 依赖安装成功
- [ ] 容器组件可正常导入
- [ ] TypeScript 类型检查通过

---

## 📋 总验收清单

### Week 1 - 环境 + 状态
- [ ] `.env` 文件创建完成，切换环境生效
- [ ] `ENV` 对象可正常访问
- [ ] `useAuthStore` 实现并可持久化
- [ ] `useUserStore` 实现并可持久化
- [ ] `useMenuStore` 实现且权限判断正确
- [ ] 登录后刷新页面，状态不丢失
- [ ] 退出登录，状态清空

### Week 2 - 权限系统
- [ ] 权限常量定义完成
- [ ] `usePermission` Hook 可正常使用
- [ ] `PermissionGuard` 组件权限控制生效
- [ ] `RouteGuard` 路由守卫生效
- [ ] 不同角色看到不同按钮
- [ ] 无权限页面跳转 403
- [ ] 未登录跳转登录页

### Week 3 - 微前端
- [ ] Wujie 依赖安装成功
- [ ] 微前端目录结构创建完成
- [ ] `MicroAppContainer` 组件可用
- [ ] 子应用配置文件完成

---

**完成 P0 后，前端架构基础已搭建完成，可以开始高效的业务开发！**