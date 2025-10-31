/**
 * 前端枚举常量（与后端保持一致）
 */

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin', // 系统管理员
  SALES = 'sales', // 销售
  DESIGNER = 'designer', // 设计师
  FOREMAN = 'foreman', // 工长
  FINANCE = 'finance', // 财务
}

/**
 * 客户状态枚举
 */
export enum CustomerStatus {
  LEAD = 'lead', // 线索
  MEASURED = 'measured', // 已量房
  QUOTED = 'quoted', // 已报价
  SIGNED = 'signed', // 已签约
  COMPLETED = 'completed', // 已完工
}

/**
 * 客户跟进类型枚举
 */
export enum FollowType {
  CALL = 'call', // 电话沟通
  VISIT = 'visit', // 上门拜访
  MEASURE = 'measure', // 上门量房
  QUOTE = 'quote', // 报价沟通
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  DRAFT = 'draft', // 草稿
  SIGNED = 'signed', // 已签约
  IN_PROGRESS = 'in_progress', // 施工中
  COMPLETED = 'completed', // 已完工
  CANCELLED = 'cancelled', // 已取消
}

/**
 * 订单明细类别枚举
 */
export enum OrderItemCategory {
  MAIN = 'main', // 主材
  AUXILIARY = 'auxiliary', // 辅材
  LABOR = 'labor', // 人工
  ADDITION = 'addition', // 增项
}

/**
 * 材料类别枚举
 */
export enum MaterialCategory {
  MAIN = 'main', // 主材
  AUXILIARY = 'auxiliary', // 辅材
  LABOR = 'labor', // 人工
}

/**
 * 材料状态枚举
 */
export enum MaterialStatus {
  ACTIVE = 'active', // 启用
  INACTIVE = 'inactive', // 停用
}

/**
 * 产品/套餐状态枚举
 */
export enum ProductStatus {
  ACTIVE = 'active', // 启用
  INACTIVE = 'inactive', // 停用
}

/**
 * 收款类型枚举
 */
export enum PaymentType {
  DEPOSIT = 'deposit', // 定金
  CONTRACT = 'contract', // 合同款
  DESIGN_FEE = 'design_fee', // 设计费
  ADDITION = 'addition', // 增项款
}

/**
 * 收款状态枚举
 */
export enum PaymentStatus {
  PENDING = 'pending', // 待确认
  CONFIRMED = 'confirmed', // 已确认
  CANCELLED = 'cancelled', // 已取消
}

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  PLANNING = 'planning', // 规划中
  IN_PROGRESS = 'in_progress', // 施工中
  PAUSED = 'paused', // 暂停
  COMPLETED = 'completed', // 已完工
}

/**
 * 枚举标签映射
 */
export const EnumLabels = {
  UserRole: {
    [UserRole.ADMIN]: '系统管理员',
    [UserRole.SALES]: '销售',
    [UserRole.DESIGNER]: '设计师',
    [UserRole.FOREMAN]: '工长',
    [UserRole.FINANCE]: '财务',
  },
  CustomerStatus: {
    [CustomerStatus.LEAD]: '线索',
    [CustomerStatus.MEASURED]: '已量房',
    [CustomerStatus.QUOTED]: '已报价',
    [CustomerStatus.SIGNED]: '已签约',
    [CustomerStatus.COMPLETED]: '已完工',
  },
  FollowType: {
    [FollowType.CALL]: '电话沟通',
    [FollowType.VISIT]: '上门拜访',
    [FollowType.MEASURE]: '上门量房',
    [FollowType.QUOTE]: '报价沟通',
  },
  OrderStatus: {
    [OrderStatus.DRAFT]: '草稿',
    [OrderStatus.SIGNED]: '已签约',
    [OrderStatus.IN_PROGRESS]: '施工中',
    [OrderStatus.COMPLETED]: '已完工',
    [OrderStatus.CANCELLED]: '已取消',
  },
  OrderItemCategory: {
    [OrderItemCategory.MAIN]: '主材',
    [OrderItemCategory.AUXILIARY]: '辅材',
    [OrderItemCategory.LABOR]: '人工',
    [OrderItemCategory.ADDITION]: '增项',
  },
  MaterialCategory: {
    [MaterialCategory.MAIN]: '主材',
    [MaterialCategory.AUXILIARY]: '辅材',
    [MaterialCategory.LABOR]: '人工',
  },
  MaterialStatus: {
    [MaterialStatus.ACTIVE]: '启用',
    [MaterialStatus.INACTIVE]: '停用',
  },
  ProductStatus: {
    [ProductStatus.ACTIVE]: '启用',
    [ProductStatus.INACTIVE]: '停用',
  },
  PaymentType: {
    [PaymentType.DEPOSIT]: '定金',
    [PaymentType.CONTRACT]: '合同款',
    [PaymentType.DESIGN_FEE]: '设计费',
    [PaymentType.ADDITION]: '增项款',
  },
  PaymentStatus: {
    [PaymentStatus.PENDING]: '待确认',
    [PaymentStatus.CONFIRMED]: '已确认',
    [PaymentStatus.CANCELLED]: '已取消',
  },
  ProjectStatus: {
    [ProjectStatus.PLANNING]: '规划中',
    [ProjectStatus.IN_PROGRESS]: '施工中',
    [ProjectStatus.PAUSED]: '暂停',
    [ProjectStatus.COMPLETED]: '已完工',
  },
}

/**
 * 枚举颜色映射（用于 Tag 组件）
 */
export const EnumColors = {
  CustomerStatus: {
    [CustomerStatus.LEAD]: 'default',
    [CustomerStatus.MEASURED]: 'processing',
    [CustomerStatus.QUOTED]: 'warning',
    [CustomerStatus.SIGNED]: 'success',
    [CustomerStatus.COMPLETED]: 'success',
  },
  OrderStatus: {
    [OrderStatus.DRAFT]: 'default',
    [OrderStatus.SIGNED]: 'processing',
    [OrderStatus.IN_PROGRESS]: 'warning',
    [OrderStatus.COMPLETED]: 'success',
    [OrderStatus.CANCELLED]: 'error',
  },
  ProjectStatus: {
    [ProjectStatus.PLANNING]: 'default',
    [ProjectStatus.IN_PROGRESS]: 'processing',
    [ProjectStatus.PAUSED]: 'warning',
    [ProjectStatus.COMPLETED]: 'success',
  },
  PaymentStatus: {
    [PaymentStatus.PENDING]: 'default',
    [PaymentStatus.CONFIRMED]: 'success',
    [PaymentStatus.CANCELLED]: 'error',
  },
  MaterialStatus: {
    [MaterialStatus.ACTIVE]: 'success',
    [MaterialStatus.INACTIVE]: 'error',
  },
  ProductStatus: {
    [ProductStatus.ACTIVE]: 'success',
    [ProductStatus.INACTIVE]: 'error',
  },
}

