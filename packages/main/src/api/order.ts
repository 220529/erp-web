import request from './request'
import type {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  OrderMaterial,
  CreateOrderMaterialDto,
  UpdateOrderMaterialDto,
} from '@/features/order/types'

/**
 * API 返回的分页数据结构
 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 查询参数
 */
export interface QueryParams {
  page?: number
  pageSize?: number
  orderNo?: string
  customerId?: number
  status?: string
}

/**
 * 获取订单列表
 */
export async function listOrders(params?: QueryParams): Promise<PageResult<Order>> {
  return request.get<PageResult<Order>>('/api/orders', { params }) as unknown as Promise<
    PageResult<Order>
  >
}

/**
 * 获取订单详情
 */
export async function getOrder(id: number): Promise<Order> {
  return request.get<Order>(`/api/orders/${id}`) as unknown as Promise<Order>
}

/**
 * 创建订单
 */
export async function createOrder(data: CreateOrderDto): Promise<Order> {
  return request.post<Order>('/api/orders', data) as unknown as Promise<Order>
}

/**
 * 更新订单
 */
export async function updateOrder(data: UpdateOrderDto): Promise<Order> {
  return request.put<Order>(`/api/orders/${data.id}`, data) as unknown as Promise<Order>
}

/**
 * 删除订单
 */
export async function deleteOrder(id: number): Promise<void> {
  return request.delete(`/api/orders/${id}`) as unknown as Promise<void>
}

/**
 * 获取订单明细列表
 */
export async function getOrderMaterials(orderId: number): Promise<OrderMaterial[]> {
  return request.get<OrderMaterial[]>(
    `/api/orders/${orderId}/materials`
  ) as unknown as Promise<OrderMaterial[]>
}

/**
 * 创建订单明细
 */
export async function createOrderMaterial(
  data: CreateOrderMaterialDto
): Promise<OrderMaterial> {
  return request.post<OrderMaterial>(
    `/api/orders/${data.orderId}/materials`,
    data
  ) as unknown as Promise<OrderMaterial>
}

/**
 * 更新订单明细
 */
export async function updateOrderMaterial(
  data: UpdateOrderMaterialDto
): Promise<OrderMaterial> {
  return request.put<OrderMaterial>(
    `/api/order-materials/${data.id}`,
    data
  ) as unknown as Promise<OrderMaterial>
}

/**
 * 删除订单明细
 */
export async function deleteOrderMaterial(id: number): Promise<void> {
  return request.delete(`/api/order-materials/${id}`) as unknown as Promise<void>
}
