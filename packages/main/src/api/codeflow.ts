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

// ============================================
// 业务流程操作封装
// ============================================


/**
 * 从套餐创建订单
 */
export async function orderCreateFromProduct(params: {
  customerId: number
  productId: number
  remark?: string
}): Promise<FlowExecuteResult> {
  return executeFlow('lid8klr7nkv9fic1', params)
}

/**
 * 更新订单明细
 */
export async function orderMaterialUpdate(params: {
  orderMaterialId: number
  quantity: number
  price: number
}): Promise<FlowExecuteResult> {
  return executeFlow('order_material_update', params)
}

/**
 * 订单签约
 * @flowKey ux5vzv7qq5gw5z38
 */
export async function orderSign(params: {
  orderId: number
  depositAmount: number
  paymentMethod: string
}): Promise<FlowExecuteResult> {
  return executeFlow('ux5vzv7qq5gw5z38', params)
}

/**
 * 订单开工
 * @flowKey k1a5idbnul59ti8m
 */
export async function orderStart(params: {
  orderId: number
  foremanId?: number
}): Promise<FlowExecuteResult> {
  return executeFlow('k1a5idbnul59ti8m', params)
}

/**
 * 订单完工
 * @flowKey jttr7xbnuxmu8ggd
 */
export async function orderComplete(params: {
  orderId: number
}): Promise<FlowExecuteResult> {
  return executeFlow('jttr7xbnuxmu8ggd', params)
}

/**
 * 确认收款
 * @flowKey gqdykf0m7yworrgw
 */
export async function paymentConfirm(params: {
  paymentId: number
  paidAt?: string
}): Promise<FlowExecuteResult> {
  return executeFlow('gqdykf0m7yworrgw', params)
}

