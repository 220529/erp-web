/**
 * 操作日志 API
 */
import request from './request'

export interface Log {
  id: number
  userId: number
  username: string
  module: string
  action: string
  targetId?: number
  content?: string
  ip?: string
  method?: string
  path?: string
  requestBody?: string
  responseBody?: string
  status?: string
  errorMsg?: string
  duration?: number
  createdAt: string
}

export interface QueryLogParams {
  page?: number
  pageSize?: number
  module?: string
  action?: string
  userId?: number
  status?: string
  startDate?: string
  endDate?: string
}

/**
 * 查询日志列表
 */
export async function listLogs(params: QueryLogParams) {
  return request.get<{ list: Log[]; total: number }>('/api/logs', { params })
}

/**
 * 查询日志详情
 */
export async function getLog(id: number) {
  return request.get<Log>(`/api/logs/${id}`)
}

/**
 * 查询业务对象操作历史
 */
export async function getTargetHistory(module: string, targetId: number) {
  return request.get<Log[]>(`/api/logs/target/${module}/${targetId}`)
}
