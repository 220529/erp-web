/**
 * 认证相关 API
 */

import request from './request'

// ============================================
// 类型定义
// ============================================
export interface LoginDto {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    name: string
    role?: string
  }
}

export interface UserInfo {
  id: number
  username: string
  name: string
  role?: string
}

// ============================================
// API 方法
// ============================================

/**
 * 用户登录
 */
export async function login(data: LoginDto): Promise<LoginResponse> {
  return request.post<LoginResponse>('/api/auth/login', data) as unknown as Promise<LoginResponse>
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  return request.post('/api/auth/logout')
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo(): Promise<UserInfo> {
  return request.get<UserInfo>('/api/auth/user') as unknown as Promise<UserInfo>
}

/**
 * 刷新 Token
 */
export async function refreshToken(): Promise<{ token: string }> {
  return request.post<{ token: string }>('/api/auth/refresh') as unknown as Promise<{ token: string }>
}

