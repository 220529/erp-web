import { ProjectStatus } from '@/constants/enums'

/**
 * 项目实体（匹配后端）
 */
export interface Project {
  id: number
  projectNo: string // 项目编号
  orderId: number
  orderNo?: string // 订单编号（关联查询）
  customerId: number
  customerName?: string // 客户姓名（关联查询）
  name: string // 项目名称
  address: string // 施工地址
  status: ProjectStatus // 项目状态枚举
  foremanId?: number
  foremanName?: string // 工长姓名（关联查询）
  remark?: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建项目 DTO
 */
export interface CreateProjectDto {
  orderId: number
  customerId: number
  name: string
  address: string
  foremanId?: number
  remark?: string
}

/**
 * 更新项目 DTO
 */
export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  id: number
  status?: ProjectStatus
}
