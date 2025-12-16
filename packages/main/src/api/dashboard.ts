import request from './request'

export interface DashboardStatistics {
  customerCount: number
  orderCount: number
  productCount: number
  monthlyIncome: number
}

/** 获取工作台统计数据 */
export function getStatistics(): Promise<DashboardStatistics> {
  return request.get('/api/dashboard/statistics')
}
