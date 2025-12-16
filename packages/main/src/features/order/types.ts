import { OrderStatus } from '@/constants/enums'

/**
 * 订单实体（匹配后端）
 */
export interface Order {
  id: number
  orderNo: string // 订单编号
  customerId: number
  customerName?: string // 客户姓名（关联查询）
  status: OrderStatus // 订单状态枚举
  totalAmount: number // 订单总金额
  paidAmount: number // 已收金额
  costAmount: number // 成本金额
  designerId?: number
  designerName?: string // 设计师姓名（关联查询）
  foremanId?: number
  foremanName?: string // 工长姓名（关联查询）
  signedAt?: string // 签约时间
  startedAt?: string // 开工时间
  completedAt?: string // 完工时间
  remark?: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建订单 DTO
 */
export interface CreateOrderDto {
  customerId: number
  totalAmount: number
  designerId?: number
  foremanId?: number
  signedAt?: string
  remark?: string
}

/**
 * 更新订单 DTO
 */
export interface UpdateOrderDto extends Partial<CreateOrderDto> {
  id: number
  status?: OrderStatus
  paidAmount?: number
  costAmount?: number
  startedAt?: string
  completedAt?: string
}

/**
 * 订单明细
 */
export interface OrderMaterial {
  id: number
  orderId: number
  materialId?: number
  materialName: string
  category: 'main' | 'auxiliary' | 'labor' | 'addition'
  quantity: number
  unit: string
  price: number
  amount: number
  createdAt: string
  updatedAt: string
}

/**
 * 创建订单明细 DTO
 */
export interface CreateOrderMaterialDto {
  orderId: number
  materialId?: number
  materialName: string
  category: 'main' | 'auxiliary' | 'labor' | 'addition'
  quantity: number
  unit: string
  price: number
}

/**
 * 更新订单明细 DTO
 */
export interface UpdateOrderMaterialDto extends Partial<CreateOrderMaterialDto> {
  id: number
}