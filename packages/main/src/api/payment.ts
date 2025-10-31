/**
 * 财务管理相关 API
 */

import request from './request'
import type { Payment, CreatePaymentDto, UpdatePaymentDto } from '@/features/finance/types'

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QueryParams {
  page?: number
  pageSize?: number
  paymentNo?: string
  orderId?: number
  type?: string
  status?: string
}

export async function listPayments(params?: QueryParams): Promise<PageResult<Payment>> {
  return request.get<PageResult<Payment>>('/api/payments', { params }) as unknown as Promise<PageResult<Payment>>
}

export async function getPayment(id: number): Promise<Payment> {
  return request.get<Payment>(`/api/payments/${id}`) as unknown as Promise<Payment>
}

export async function createPayment(data: CreatePaymentDto): Promise<Payment> {
  return request.post<Payment>('/api/payments', data) as unknown as Promise<Payment>
}

export async function updatePayment(data: UpdatePaymentDto): Promise<Payment> {
  return request.put<Payment>(`/api/payments/${data.id}`, data) as unknown as Promise<Payment>
}

export async function deletePayment(id: number): Promise<void> {
  return request.delete(`/api/payments/${id}`) as unknown as Promise<void>
}
