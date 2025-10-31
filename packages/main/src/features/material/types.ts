import { MaterialCategory, MaterialStatus } from '@/constants/enums'

/**
 * 物料实体（匹配后端）
 */
export interface Material {
  id: number
  code: string // 材料编码
  name: string // 材料名称
  category: MaterialCategory // 材料类别枚举
  brand?: string // 品牌
  spec?: string // 规格
  unit: string // 单位
  costPrice: number // 成本价
  salePrice: number // 销售价
  imageUrl?: string // 图片URL
  status: MaterialStatus // 状态枚举
  remark?: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建物料 DTO（不包含后端自动生成的字段）
 */
export interface CreateMaterialDto {
  name: string // 必填
  category?: string // 可选
  brand?: string
  spec?: string
  unit?: string
  costPrice?: number // 成本价
  salePrice?: number // 销售价
  remark?: string
}

/**
 * 更新物料 DTO
 */
export interface UpdateMaterialDto extends Partial<CreateMaterialDto> {
  id: number
  status?: MaterialStatus
}
