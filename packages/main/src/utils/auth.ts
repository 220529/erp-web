/**
 * 认证工具函数
 */

const TOKEN_KEY = 'erp_token'
const USER_INFO_KEY = 'erp_user_info'
const PERMISSIONS_KEY = 'erp_permissions'
const MENUS_KEY = 'erp_menus'

/**
 * 获取 Token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取用户信息
 */
export function getUserInfo(): any {
  const userInfo = localStorage.getItem(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * 设置用户信息
 */
export function setUserInfo(userInfo: any): void {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 移除用户信息
 */
export function removeUserInfo(): void {
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 获取权限列表
 */
export function getPermissions(): string[] {
  const permissions = localStorage.getItem(PERMISSIONS_KEY)
  return permissions ? JSON.parse(permissions) : []
}

/**
 * 设置权限列表
 */
export function setPermissions(permissions: string[]): void {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
}

/**
 * 移除权限列表
 */
export function removePermissions(): void {
  localStorage.removeItem(PERMISSIONS_KEY)
}

/**
 * 获取菜单列表
 */
export function getMenus(): any[] {
  const menus = localStorage.getItem(MENUS_KEY)
  return menus ? JSON.parse(menus) : []
}

/**
 * 设置菜单列表
 */
export function setMenus(menus: any[]): void {
  localStorage.setItem(MENUS_KEY, JSON.stringify(menus))
}

/**
 * 移除菜单列表
 */
export function removeMenus(): void {
  localStorage.removeItem(MENUS_KEY)
}

/**
 * 清除所有认证信息
 */
export function clearAuth(): void {
  removeToken()
  removeUserInfo()
  removePermissions()
  removeMenus()
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getToken()
}

/**
 * 检查是否有某个权限
 */
export function hasPermission(permission: string): boolean {
  const permissions = getPermissions()
  // admin 拥有所有权限
  if (permissions.includes('*')) {
    return true
  }
  return permissions.includes(permission)
}

