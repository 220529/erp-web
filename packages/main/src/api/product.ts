/**
 * 套餐/产品相关 API
 */

import request from './request'

/**
 * 产品/套餐实体
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

/**
 * 产品物料明细
 */
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

/**
 * 创建产品DTO（不包含后端自动生成的字段）
 */
export interface CreateProductDto {
  name: string // 必填
  costPrice?: number
  salePrice?: number
  description?: string
  status?: 'active' | 'inactive'
  sort?: number
  remark?: string
}

/**
 * 更新产品DTO
 */
export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: number
}

/**
 * 分页结果
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
  status?: 'active' | 'inactive'
}

// ============================================
// API 方法
// ============================================

/**
 * 获取产品列表
 */
export async function listProducts(params?: QueryParams): Promise<PageResult<Product>> {
  const data = await request.get<any>('/api/products', { params }) as any
  // 确保返回正确的分页格式
  if (data && typeof data === 'object') {
    return {
      list: Array.isArray(data.list) ? data.list : (Array.isArray(data) ? data : []),
      total: data.total || 0,
      page: data.page || params?.page || 1,
      pageSize: data.pageSize || params?.pageSize || 20,
      totalPages: data.totalPages || 0,
    }
  }
  return { list: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
}

/**
 * 获取产品详情
 */
export async function getProduct(id: number): Promise<Product> {
  return request.get<Product>(`/api/products/${id}`) as unknown as Promise<Product>
}

/**
 * 创建产品
 */
export async function createProduct(data: CreateProductDto): Promise<Product> {
  return request.post<Product>('/api/products', data) as unknown as Promise<Product>
}

/**
 * 更新产品
 */
export async function updateProduct(data: UpdateProductDto): Promise<Product> {
  return request.put<Product>(`/api/products/${data.id}`, data) as unknown as Promise<Product>
}

/**
 * 删除产品
 */
export async function deleteProduct(id: number): Promise<void> {
  return request.delete(`/api/products/${id}`) as unknown as Promise<void>
}

/**
 * 获取产品物料清单
 */
export async function getProductMaterials(productId: number): Promise<ProductMaterial[]> {
  const data = await request.get<any>(`/api/products/${productId}/materials`) as any
  console.log(`📡 API返回的产品${productId}物料清单原始数据:`, data)
  
  // 后端返回的数据结构: { product, materials, summary }
  const materials = data?.materials || []
  console.log(`📦 提取的物料清单:`, materials)
  
  return Array.isArray(materials) ? materials : []
}

/**
 * 添加物料到产品
 */
export async function addProductMaterial(
  productId: number,
  data: {
    materialId: number
    quantity: number
    price?: number
    unit?: string
  }
): Promise<ProductMaterial> {
  return request.post<ProductMaterial>(
    `/api/products/${productId}/materials`,
    {
      ...data,
      productId, // 后端需要在请求体中包含 productId
    }
  ) as unknown as Promise<ProductMaterial>
}

/**
 * 更新产品物料
 */
export async function updateProductMaterial(
  id: number,
  data: {
    quantity?: number
    price?: number
    unit?: string
  }
): Promise<ProductMaterial> {
  return request.put<ProductMaterial>(
    `/api/products/materials/${id}`,
    data
  ) as unknown as Promise<ProductMaterial>
}

/**
 * 删除产品物料
 */
export async function deleteProductMaterial(id: number): Promise<void> {
  return request.delete(`/api/products/materials/${id}`) as unknown as Promise<void>
}

