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

