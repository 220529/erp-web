/**
 * 项目管理相关 API
 */

import request from './request'
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/features/project/types'

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
  status?: string
  orderId?: number
}

export async function listProjects(params?: QueryParams): Promise<PageResult<Project>> {
  return request.get<PageResult<Project>>('/api/projects', { params }) as unknown as Promise<PageResult<Project>>
}

export async function getProject(id: number): Promise<Project> {
  return request.get<Project>(`/api/projects/${id}`) as unknown as Promise<Project>
}

export async function createProject(data: CreateProjectDto): Promise<Project> {
  return request.post<Project>('/api/projects', data) as unknown as Promise<Project>
}

export async function updateProject(data: UpdateProjectDto): Promise<Project> {
  return request.put<Project>(`/api/projects/${data.id}`, data) as unknown as Promise<Project>
}

export async function deleteProject(id: number): Promise<void> {
  return request.delete(`/api/projects/${id}`) as unknown as Promise<void>
}

