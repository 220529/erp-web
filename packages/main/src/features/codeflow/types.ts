/**
 * 代码流程相关类型定义
 */

export interface Flow {
  id: number
  key: string
  name: string
  category?: string
  description?: string
  code?: string
  status: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateFlowDto {
  key?: string
  name: string
  category?: string
  description?: string
  code?: string
  remark?: string
}

export interface ExecuteFlowDto {
  params: Record<string, any>
}

export interface FlowExecuteResult {
  success: boolean
  data?: any
  message?: string
}

// ============================================
// 发布相关类型
// ============================================

export interface ProdConfig {
  apiEndpoint: string
  accessSecret: string
}

export interface PublishResult {
  flowKey: string
  flowName: string
  success: boolean
  message?: string
  publishedAt?: string
}

export interface BatchPublishResult {
  total: number
  successCount: number
  failureCount: number
  results: PublishResult[]
}

export type PublishStatus = 'not_published' | 'published'

