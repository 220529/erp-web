import { PaymentType, PaymentStatus } from '@/constants/enums'

/**
 * 收款记录实体（匹配后端）
 */
export interface Payment {
  id: number
  paymentNo: string // 收款单号（后端字段名）
  orderId: number
  orderNo?: string // 订单编号（关联查询）
  type: PaymentType // 收款类型枚举
  amount: number // 收款金额
  method?: string // 收款方式
  status: PaymentStatus // 收款状态枚举
  paidAt?: string // 实际收款时间
  createdBy: number
  createdByName?: string // 创建人姓名（关联查询）
  remark?: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建收款记录 DTO
 */
export interface CreatePaymentDto {
  orderId: number
  type: PaymentType
  amount: number
  method?: string
  paidAt?: string
  remark?: string
}

/**
 * 更新收款记录 DTO
 */
export interface UpdatePaymentDto extends Partial<CreatePaymentDto> {
  id: number
  status?: PaymentStatus
}
