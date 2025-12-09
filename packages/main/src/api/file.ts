/**
 * 文件管理 API
 */

import request from './request'

export interface FileItem {
  id: number
  name: string
  isFolder: boolean
  parentId: number | null
  url: string | null
  storagePath: string | null
  size: number
  uploadedBy: number | null
  createdAt: string
  updatedAt: string
}

export interface FileListResult {
  list: FileItem[]
  total: number
  page: number
  pageSize: number
}

export interface QueryFileDto {
  page?: number
  pageSize?: number
  parentId?: number
}

/**
 * 上传文件/文件夹
 */
export async function uploadFiles(
  files: File[],
  paths?: string[],
  parentId?: number,
): Promise<FileItem[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  if (paths) {
    paths.forEach((p) => formData.append('paths', p))
  }
  if (parentId !== undefined) {
    formData.append('parentId', String(parentId))
  }
  return request.post('/api/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as unknown as Promise<FileItem[]>
}

/**
 * 查询文件列表
 */
export async function getFileList(params?: QueryFileDto): Promise<FileListResult> {
  return request.get('/api/file/list', { params }) as unknown as Promise<FileListResult>
}

/**
 * 删除文件/文件夹
 */
export async function deleteFile(id: number): Promise<void> {
  return request.delete(`/api/file/${id}`) as unknown as Promise<void>
}
