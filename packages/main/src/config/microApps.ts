/**
 * 微前端子应用配置
 * 统一管理所有子应用的注册信息
 */

export interface MicroAppConfig {
  name: string           // 子应用唯一标识
  title: string          // 显示名称
  devUrl: string         // 开发环境地址
  prodUrl: string        // 生产环境地址
  basePath: string       // 路由前缀
  props?: Record<string, any>  // 传递给子应用的参数
}

// ============================================
// 子应用配置列表
// ============================================
export const microApps: MicroAppConfig[] = [
  {
    name: 'report',
    title: '报表中心',
    devUrl: 'http://localhost:3101',
    prodUrl: '/report',
    basePath: '/report',
  },
  // 后续添加更多子应用
  // {
  //   name: 'workflow',
  //   title: '工作流',
  //   devUrl: 'http://localhost:3102',
  //   prodUrl: '/workflow',
  //   basePath: '/workflow',
  // },
  // {
  //   name: 'bi',
  //   title: 'BI 分析',
  //   devUrl: 'http://localhost:3103',
  //   prodUrl: '/bi',
  //   basePath: '/bi',
  // },
]

// ============================================
// 工具函数
// ============================================

/**
 * 获取子应用的实际 URL
 */
export function getMicroAppUrl(app: MicroAppConfig): string {
  return import.meta.env.DEV ? app.devUrl : app.prodUrl
}

/**
 * 根据 name 获取子应用配置
 */
export function getMicroAppByName(name: string): MicroAppConfig | undefined {
  return microApps.find(app => app.name === name)
}

/**
 * 根据路径匹配子应用
 */
export function getMicroAppByPath(path: string): MicroAppConfig | undefined {
  return microApps.find(app => path.startsWith(app.basePath))
}
