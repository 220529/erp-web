/**
 * API 统一导出
 * 所有的 API 接口都从这里导出
 */

// 导出 HTTP 请求工具
export { default as request } from './request'
export * from './request'

// 导出认证相关 API
export * as authApi from './auth'

// 导出代码流程相关 API
export * as codeflowApi from './codeflow'

// 导出系统功能相关 API
export * as systemApi from './system'

// 导出客户管理相关 API
export * as customerApi from './customer'

// 导出订单管理相关 API
export * as orderApi from './order'

// 导出项目管理相关 API
export * as projectApi from './project'

// 导出物料管理相关 API
export * as materialApi from './material'

// 导出财务管理相关 API
export * as paymentApi from './payment'

// 导出字典管理相关 API
export * as dictApi from './dict'

// 导出套餐管理相关 API
export * as productApi from './product'

// 导出常量相关 API
export * as constantsApi from './constants'

// 导出定时任务相关 API
export * as schedulerApi from './scheduler'

