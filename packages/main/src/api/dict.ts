/**
 * 字典管理相关 API（两级结构）
 */

import request from './request'

// ==================== 分页返回类型 ====================

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ==================== 字典类型 ====================

export interface DictType {
  id: number
  code: string
  name: string
  status: number
  sort: number
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDictTypeDto {
  code: string
  name: string
  status?: number
  sort?: number
  remark?: string
}

export interface UpdateDictTypeDto {
  name?: string
  status?: number
  sort?: number
  remark?: string
}

export interface QueryDictTypeDto {
  keyword?: string
  status?: number
  page?: number
  pageSize?: number
}

// ==================== 字典数据 ====================

export interface DictData {
  id: number
  typeCode: string
  label: string
  value: string
  sort: number
  status: number
  cssClass?: string
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDictDataDto {
  typeCode: string
  label: string
  value: string
  sort?: number
  status?: number
  cssClass?: string
  remark?: string
}

export interface UpdateDictDataDto {
  label?: string
  value?: string
  sort?: number
  status?: number
  cssClass?: string
  remark?: string
}

export interface QueryDictDataDto {
  typeCode?: string
  keyword?: string
  status?: number
  page?: number
  pageSize?: number
}

// ==================== API 方法 - 字典类型 ====================

/**
 * 创建字典类型
 */
export async function createDictType(data: CreateDictTypeDto): Promise<DictType> {
  return request.post<DictType>('/api/dict/type', data) as unknown as Promise<DictType>
}

/**
 * 查询字典类型列表
 */
export async function listDictTypes(params?: QueryDictTypeDto): Promise<PageResult<DictType>> {
  return request.get<PageResult<DictType>>('/api/dict/type', { params }) as unknown as Promise<PageResult<DictType>>
}

/**
 * 获取所有启用的字典类型（不分页）
 */
export async function getAllEnabledDictTypes(): Promise<DictType[]> {
  const data = await request.get<DictType[]>('/api/dict/type/all')
  return Array.isArray(data) ? data : []
}

/**
 * 获取字典类型详情
 */
export async function getDictType(id: number): Promise<DictType> {
  return request.get<DictType>(`/api/dict/type/${id}`) as unknown as Promise<DictType>
}

/**
 * 更新字典类型
 */
export async function updateDictType(id: number, data: UpdateDictTypeDto): Promise<DictType> {
  return request.put<DictType>(`/api/dict/type/${id}`, data) as unknown as Promise<DictType>
}

/**
 * 删除字典类型
 */
export async function deleteDictType(id: number): Promise<void> {
  return request.delete(`/api/dict/type/${id}`) as unknown as Promise<void>
}

// ==================== API 方法 - 字典数据 ====================

/**
 * 创建字典数据
 */
export async function createDictData(data: CreateDictDataDto): Promise<DictData> {
  return request.post<DictData>('/api/dict/data', data) as unknown as Promise<DictData>
}

/**
 * 查询字典数据列表
 */
export async function listDictData(params?: QueryDictDataDto): Promise<PageResult<DictData>> {
  return request.get<PageResult<DictData>>('/api/dict/data', { params }) as unknown as Promise<PageResult<DictData>>
}

/**
 * 根据字典类型编码获取所有启用的字典数据
 */
export async function getDictDataByTypeCode(typeCode: string): Promise<DictData[]> {
  const data = await request.get<DictData[]>(`/api/dict/data/type/${typeCode}`)
  return Array.isArray(data) ? data : []
}

/**
 * 获取字典数据详情
 */
export async function getDictData(id: number): Promise<DictData> {
  return request.get<DictData>(`/api/dict/data/${id}`) as unknown as Promise<DictData>
}

/**
 * 更新字典数据
 */
export async function updateDictData(id: number, data: UpdateDictDataDto): Promise<DictData> {
  return request.put<DictData>(`/api/dict/data/${id}`, data) as unknown as Promise<DictData>
}

/**
 * 删除字典数据
 */
export async function deleteDictData(id: number): Promise<void> {
  return request.delete(`/api/dict/data/${id}`) as unknown as Promise<void>
}
