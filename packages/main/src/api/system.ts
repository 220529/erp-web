/**
 * 系统功能相关 API
 */

import request from './request'

// ============================================
// 类型定义
// ============================================
export interface AccessSecretResponse {
  accessSecret: string
  description?: string
  usage?: string
}

export interface Company {
  id: number
  name: string
  contact?: string
  phone?: string
  address?: string
  status: number
  remark?: string
  createdAt: string
}

export interface Department {
  id: number
  name: string
  companyId: number
  parentId?: number
  leader?: string
  phone?: string
  sort: number
  status: number
  children?: Department[]
}

export interface User {
  id: number
  username: string
  name: string
  mobile: string
  email?: string
  role: string
  companyId?: number
  departmentId?: number
  status: number
  company?: Company
  department?: Department
  createdAt: string
}

export interface Role {
  id: number
  key: string
  name: string
  description?: string
  sort: number
  status: number
}

export interface Menu {
  id: number
  name: string
  title: string
  icon?: string
  path?: string
  component?: string
  parentId?: number
  type: 'menu' | 'button'
  permission?: string
  sort: number
  hidden?: number
  status: number
  children?: Menu[]
}

// ============================================
// API 方法
// ============================================

/**
 * 获取 Access Secret（用于 erp-code 项目）
 */
export async function getAccessSecret(): Promise<AccessSecretResponse> {
  return request.get<AccessSecretResponse>('/api/auth/access-secret') as unknown as Promise<AccessSecretResponse>
}

// ============================================
// 公司管理
// ============================================
export function getCompanies(params?: { page?: number; pageSize?: number; name?: string; status?: number }) {
  return request.get('/api/companies', { params })
}

export function getCompaniesSimple() {
  return request.get<Company[]>('/api/companies/simple')
}

export function getCompany(id: number) {
  return request.get<Company>(`/api/companies/${id}`)
}

export function createCompany(data: Partial<Company>) {
  return request.post('/api/companies', data)
}

export function updateCompany(id: number, data: Partial<Company>) {
  return request.put(`/api/companies/${id}`, data)
}

export function deleteCompany(id: number) {
  return request.delete(`/api/companies/${id}`)
}

// ============================================
// 部门管理
// ============================================
export function getDepartments(companyId?: number) {
  return request.get<Department[]>('/api/departments', { params: { companyId } })
}

export function getDepartmentTree(companyId: number) {
  return request.get<Department[]>('/api/departments/tree', { params: { companyId } })
}

export function getDepartment(id: number) {
  return request.get<Department>(`/api/departments/${id}`)
}

export function createDepartment(data: Partial<Department>) {
  return request.post('/api/departments', data)
}

export function updateDepartment(id: number, data: Partial<Department>) {
  return request.put(`/api/departments/${id}`, data)
}

export function deleteDepartment(id: number) {
  return request.delete(`/api/departments/${id}`)
}

// ============================================
// 用户管理
// ============================================
export function getUsers(params?: {
  page?: number
  pageSize?: number
  keyword?: string
  companyId?: number
  departmentId?: number
  role?: string
  status?: number
}) {
  return request.get('/api/users', { params })
}

export function getUser(id: number) {
  return request.get<User>(`/api/users/${id}`)
}

export function createUser(data: {
  username: string
  name: string
  password: string
  mobile: string
  email?: string
  role: string
  companyId?: number
  departmentId?: number
}) {
  return request.post('/api/users', data)
}

export function updateUser(id: number, data: Partial<User>) {
  return request.put(`/api/users/${id}`, data)
}

export function deleteUser(id: number) {
  return request.delete(`/api/users/${id}`)
}

export function updateUserStatus(id: number, status: number) {
  return request.put(`/api/users/${id}/status`, { status })
}

export function resetUserPassword(id: number, password: string) {
  return request.put(`/api/users/${id}/reset-password`, { password })
}

// ============================================
// 角色管理
// ============================================
export function getRoles(params?: { page?: number; pageSize?: number; status?: number }) {
  return request.get('/api/roles', { params })
}

export function getRolesSimple() {
  return request.get<Role[]>('/api/roles/simple')
}

export function getRole(id: number) {
  return request.get<Role>(`/api/roles/${id}`)
}

export function createRole(data: Partial<Role>) {
  return request.post('/api/roles', data)
}

export function updateRole(id: number, data: Partial<Role>) {
  return request.put(`/api/roles/${id}`, data)
}

export function deleteRole(id: number) {
  return request.delete(`/api/roles/${id}`)
}

export function getRoleMenus(roleKey: string) {
  return request.get<number[]>(`/api/roles/${roleKey}/menus`)
}

export function assignRoleMenus(roleKey: string, menuIds: number[]) {
  return request.put(`/api/roles/${roleKey}/menus`, { menuIds })
}

export function getMenuTree() {
  return request.get<Menu[]>('/api/roles/menus')
}

