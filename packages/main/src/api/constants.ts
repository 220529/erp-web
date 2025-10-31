/**
 * 常量相关 API
 * 用于获取系统枚举、字典等常量数据
 */

import request from './request'

/**
 * 常量选项接口
 */
export interface ConstantOption {
  label: string
  value: string
  description?: string
}

/**
 * 获取所有常量（一次性获取）
 */
export async function getAllConstants(): Promise<Record<string, ConstantOption[]>> {
  return request.get('/api/constants/all')
}

/**
 * 获取物料类别
 */
export async function getMaterialCategories(): Promise<ConstantOption[]> {
  return request.get('/api/constants/material-categories')
}

/**
 * 获取物料状态
 */
export async function getMaterialStatuses(): Promise<ConstantOption[]> {
  return request.get('/api/constants/material-statuses')
}

/**
 * 获取订单状态
 */
export async function getOrderStatuses(): Promise<ConstantOption[]> {
  return request.get('/api/constants/order-statuses')
}

/**
 * 获取收款类型
 */
export async function getPaymentTypes(): Promise<ConstantOption[]> {
  return request.get('/api/constants/payment-types')
}

/**
 * 获取客户状态
 */
export async function getCustomerStatuses(): Promise<ConstantOption[]> {
  return request.get('/api/constants/customer-statuses')
}

/**
 * 获取产品状态
 */
export async function getProductStatuses(): Promise<ConstantOption[]> {
  return request.get('/api/constants/product-statuses')
}

/**
 * 获取用户角色
 */
export async function getUserRoles(): Promise<ConstantOption[]> {
  return request.get('/api/constants/user-roles')
}

/**
 * 获取单位列表（从字典表获取）
 * 使用字典类型编码：material_unit
 */
export async function getUnits(): Promise<ConstantOption[]> {
  interface DictItem {
    label: string
    value: string
    remark?: string
  }
  
  const data = await request.get<DictItem[]>('/api/dict/data/type/material_unit')
  const items = Array.isArray(data) ? data : []
  
  // 转换字典数据格式为常量选项格式
  return items.map((item: DictItem) => ({
    label: item.label,
    value: item.value,
    description: item.remark,
  }))
}

