/**
 * 字典类型实体
 */
export interface DictType {
  id: number
  code: string // 字典类型编码 如: customer_source
  name: string // 字典类型名称 如: 客户来源
  sort: number // 排序
  status: number // 状态: 1-启用 0-禁用
  remark?: string
  createdAt: string
  updatedAt: string
}

/**
 * 字典数据实体
 */
export interface DictData {
  id: number
  typeCode: string // 字典类型编码
  label: string // 字典标签（显示名称）
  value: string // 字典值（实际值）
  sort: number // 排序
  status: number // 状态: 1-启用 0-禁用
  cssClass?: string // 样式类型
  remark?: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建字典类型 DTO
 */
export interface CreateDictTypeDto {
  code: string
  name: string
  sort?: number
  remark?: string
}

/**
 * 更新字典类型 DTO
 */
export interface UpdateDictTypeDto {
  name?: string
  sort?: number
  status?: number
  remark?: string
}

/**
 * 创建字典数据 DTO
 */
export interface CreateDictDataDto {
  typeCode: string
  label: string
  value: string
  sort?: number
  cssClass?: string
  remark?: string
}

/**
 * 更新字典数据 DTO
 */
export interface UpdateDictDataDto {
  label?: string
  value?: string
  sort?: number
  status?: number
  cssClass?: string
  remark?: string
}
