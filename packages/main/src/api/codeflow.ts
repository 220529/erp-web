/**
 * 代码流程相关 API
 */

import request from './request'
import type { Flow, CreateFlowDto, FlowExecuteResult, ProdConfig, PublishResult, BatchPublishResult, PublishStatus } from '@/features/codeflow/types'

// 重新导出类型
export type { Flow, CreateFlowDto, FlowExecuteResult, ProdConfig, PublishResult, BatchPublishResult, PublishStatus }

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



// ============================================
// 发布到生产环境相关 API
// ============================================

/**
 * 获取生产环境配置
 * 从环境变量读取，仅在开发环境可用
 */
export function getProdConfig(): ProdConfig | null {
  const apiEndpoint = import.meta.env.VITE_PROD_API_URL
  const accessSecret = import.meta.env.VITE_PROD_ACCESS_SECRET
  
  if (!apiEndpoint || !accessSecret) {
    return null
  }
  
  return { apiEndpoint, accessSecret }
}

/**
 * 检查是否可以显示发布功能
 * 仅在开发环境且配置完整时显示
 */
export function canShowPublishFeature(): boolean {
  return import.meta.env.DEV && getProdConfig() !== null
}

/**
 * 更新本地流程的发布状态
 * 发布成功后调用，同步更新本地数据库的 publishedAt
 */
export async function updateLocalPublishStatus(
  flowKey: string,
  publishedAt: string
): Promise<void> {
  try {
    await request.put(`/api/code/flows/${flowKey}`, {
      publishedAt,
      status: 1,
    })
  } catch (error) {
    // 本地更新失败不影响发布结果，只打印警告
    console.warn(`更新本地发布状态失败: ${flowKey}`, error)
  }
}

/**
 * 发布单个流程到生产环境
 */
export async function publishFlowToProd(
  flow: Flow,
  prodConfig: ProdConfig
): Promise<PublishResult> {
  try {
    const response = await fetch(`${prodConfig.apiEndpoint}/api/code/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-secret': prodConfig.accessSecret,
      },
      body: JSON.stringify({
        key: flow.key,
        name: flow.name,
        category: flow.category,
        description: flow.description,
        code: flow.code,
        isPublish: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    
    // API 响应格式: { code, message, data: { success, action, data, message } }
    // code === 0 表示请求成功
    if (result.code !== 0) {
      return {
        flowKey: flow.key,
        flowName: flow.name,
        success: false,
        message: result.message || '发布失败',
      }
    }
    
    // 检查内层的 success
    const uploadResult = result.data
    if (!uploadResult?.success) {
      return {
        flowKey: flow.key,
        flowName: flow.name,
        success: false,
        message: uploadResult?.message || '发布失败',
      }
    }

    const publishedAt = uploadResult.data?.publishedAt
    
    // 发布成功后，同步更新本地数据库的发布状态
    if (publishedAt) {
      await updateLocalPublishStatus(flow.key, publishedAt)
    }

    return {
      flowKey: flow.key,
      flowName: flow.name,
      success: true,
      message: uploadResult.message,
      publishedAt,
    }
  } catch (error: any) {
    return {
      flowKey: flow.key,
      flowName: flow.name,
      success: false,
      message: error.message || '网络错误',
    }
  }
}

/**
 * 批量发布流程到生产环境
 */
export async function batchPublishFlows(
  flows: Flow[],
  prodConfig: ProdConfig
): Promise<BatchPublishResult> {
  const results: PublishResult[] = []
  
  for (const flow of flows) {
    const result = await publishFlowToProd(flow, prodConfig)
    results.push(result)
  }
  
  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length
  
  return {
    total: flows.length,
    successCount,
    failureCount,
    results,
  }
}

/**
 * 获取流程的发布状态
 */
export function getPublishStatus(flow: Flow): PublishStatus {
  if (flow.status === 1 && flow.publishedAt) {
    return 'published'
  }
  return 'not_published'
}

/**
 * 获取发布状态的显示文本
 */
export function getPublishStatusText(status: PublishStatus): string {
  switch (status) {
    case 'published':
      return '已发布'
    case 'not_published':
    default:
      return '未发布'
  }
}
