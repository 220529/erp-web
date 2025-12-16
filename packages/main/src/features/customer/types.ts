import { CustomerStatus } from '@/constants/enums'

/**
 * 客户实体（匹配后端）
 */
export interface Customer {
  id: number
  name: string // 客户姓名
  mobile: string // 手机号
  address?: string // 详细地址
  area?: string // 所属区域
  status: CustomerStatus // 客户状态
  designerId?: number // 负责设计师ID
  designerName?: string // 设计师姓名（关联查询）
  remark?: string // 备注
  createdAt: string
  updatedAt: string
}

/**
 * 创建客户 DTO
 */
export interface CreateCustomerDto {
  name: string
  mobile: string
  address?: string
  area?: string
  designerId?: number
  remark?: string
}

/**
 * 更新客户 DTO
 */
export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  id: number
  status?: CustomerStatus
}

/**
 * 客户跟进记录
 */
export interface CustomerFollow {
  id: number
  customerId: number
  userId: number
  userName?: string
  type: 'call' | 'visit' | 'measure' | 'quote'
  content: string
  nextFollowAt?: string
  createdAt: string
  updatedAt: string
}
