/**
 * 代码流程相关 API
 */

import request from './request'
import type { Flow, CreateFlowDto, FlowExecuteResult } from '@/features/codeflow/types'

// 重新导出类型
export type { Flow, CreateFlowDto, FlowExecuteResult }

// ============================================
// API 方法
// ============================================

/**
 * 创建代码流程
 * 调用后会返回生成的 flowKey
 */
export async function createFlow(data: CreateFlowDto): Promise<Flow> {
  return request.post<Flow>('/api/code/flows', data) as unknown as Promise<Flow>
}

/**
 * 列出所有可用的代码流程
 */
export async function listFlows(): Promise<Flow[]> {
  const data = await request.get<Flow[] | any>('/api/code/flows')
  // 确保返回数组
  return Array.isArray(data) ? data : []
}

/**
 * 查询单个流程详情
 */
export async function getFlow(flowKey: string): Promise<Flow> {
  return request.get<Flow>(`/api/code/flows/${flowKey}`) as unknown as Promise<Flow>
}

/**
 * 执行代码流程
 */
export async function executeFlow(
  flowKey: string,
  params: Record<string, any>
): Promise<FlowExecuteResult> {
  return request.post<FlowExecuteResult>(`/api/code/run/${flowKey}`, { params }) as unknown as Promise<FlowExecuteResult>
}

/**
 * 更新代码流程（仅管理员）
 */
export async function updateFlow(
  flowKey: string,
  data: Partial<CreateFlowDto>
): Promise<Flow> {
  return request.put<Flow>(`/api/code/flows/${flowKey}`, data) as unknown as Promise<Flow>
}

/**
 * 删除/禁用代码流程（仅管理员）
 */
export async function deleteFlow(flowKey: string): Promise<void> {
  return request.delete(`/api/code/flows/${flowKey}`)
}

/**
 * 清除流程缓存（仅管理员）
 */
export async function clearCache(flowKey?: string): Promise<void> {
  const url = flowKey
    ? `/api/code/flows/${flowKey}/clear-cache`
    : `/api/code/flows/clear-cache`
  return request.post(url)
}

