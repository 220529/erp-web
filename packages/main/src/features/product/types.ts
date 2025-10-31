/**
 * 套餐管理相关类型定义
 */

export interface Product {
  id: number
  code: string
  name: string
  costPrice: number
  salePrice: number
  description?: string
  status: 'active' | 'inactive'
  sort: number
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface ProductMaterial {
  id: number
  productId: number
  materialId: number
  materialName: string
  category: 'main' | 'auxiliary' | 'labor'
  quantity: number
  unit: string
  price: number
  amount: number
  createdAt: string
}

export interface CreateProductDto {
  name: string // 必填
  costPrice?: number
  salePrice?: number
  description?: string
  status?: 'active' | 'inactive'
  sort?: number
  remark?: string
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: number
}

