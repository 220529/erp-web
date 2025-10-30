/**
 * 系统功能相关 API
 */

import request from './request'

// ============================================
// 类型定义
// ============================================
export interface AccessSecretResponse {
  accessSecret: string
  description?: string
  usage?: string
}

// ============================================
// API 方法
// ============================================

/**
 * 获取 Access Secret（用于 erp-code 项目）
 */
export async function getAccessSecret(): Promise<AccessSecretResponse> {
  return request.get<AccessSecretResponse>('/api/auth/access-secret') as unknown as Promise<AccessSecretResponse>
}

