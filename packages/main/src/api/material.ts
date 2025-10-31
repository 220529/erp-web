/**
 * 物料管理相关 API
 */

import request from './request'
import type { Material, CreateMaterialDto, UpdateMaterialDto } from '@/features/material/types'

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
  keyword?: string
  category?: string
  status?: string
}

export async function listMaterials(params?: QueryParams): Promise<PageResult<Material>> {
  return request.get<PageResult<Material>>('/api/materials', { params }) as unknown as Promise<PageResult<Material>>
}

export async function getMaterial(id: number): Promise<Material> {
  return request.get<Material>(`/api/materials/${id}`) as unknown as Promise<Material>
}

export async function createMaterial(data: CreateMaterialDto): Promise<Material> {
  return request.post<Material>('/api/materials', data) as unknown as Promise<Material>
}

export async function updateMaterial(data: UpdateMaterialDto): Promise<Material> {
  return request.put<Material>(`/api/materials/${data.id}`, data) as unknown as Promise<Material>
}

export async function deleteMaterial(id: number): Promise<void> {
  return request.delete(`/api/materials/${id}`) as unknown as Promise<void>
}
