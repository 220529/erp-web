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
  salesId?: number
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
