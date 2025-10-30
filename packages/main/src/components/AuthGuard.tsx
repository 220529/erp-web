/**
 * 路由守卫组件
 * 用于保护需要登录才能访问的路由
 */

import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '@/utils/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  
  // 检查是否已登录
  if (!isAuthenticated()) {
    // 未登录，重定向到登录页，并保存当前路径
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // 已登录，渲染子组件
  return <>{children}</>
}

