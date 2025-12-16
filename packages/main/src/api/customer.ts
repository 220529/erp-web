import request from './request'
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/features/customer/types'

/**
 * API 返回的分页数据结构
 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 查询参数
 */
export interface QueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  stage?: string
  designerId?: number
}

/**
 * 获取客户列表
 */
export async function listCustomers(params?: QueryParams): Promise<PageResult<Customer>> {
  return request.get<PageResult<Customer>>('/api/customers', { params }) as unknown as Promise<
    PageResult<Customer>
  >
}

/**
 * 获取客户详情
 */
export async function getCustomer(id: number): Promise<Customer> {
  return request.get<Customer>(`/api/customers/${id}`) as unknown as Promise<Customer>
}

/**
 * 创建客户
 */
export async function createCustomer(data: CreateCustomerDto): Promise<Customer> {
  return request.post<Customer>('/api/customers', data) as unknown as Promise<Customer>
}

/**
 * 更新客户
 */
export async function updateCustomer(data: UpdateCustomerDto): Promise<Customer> {
  return request.put<Customer>(`/api/customers/${data.id}`, data) as unknown as Promise<Customer>
}

/**
 * 删除客户
 */
export async function deleteCustomer(id: number): Promise<void> {
  return request.delete(`/api/customers/${id}`) as unknown as Promise<void>
}

/**
 * 导出客户列表
 */
export async function exportCustomers(params?: QueryParams): Promise<void> {
  const response = await request.get('/api/customers/export', {
    params,
    responseType: 'blob',
  })

  // 从响应头获取文件名，或使用默认名
  const blob = response as unknown as Blob
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `客户列表_${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
