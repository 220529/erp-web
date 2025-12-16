/**
 * 权限 Hook
 * 用于检查当前用户是否有某个权限
 */

import { useCallback } from 'react'
import { getPermissions } from '@/utils/auth'

export function usePermission() {
  /**
   * 检查是否有某个权限
   */
  const hasPermission = useCallback((permission: string): boolean => {
    const permissions = getPermissions()
    // admin 拥有所有权限
    if (permissions.includes('*')) {
      return true
    }
    return permissions.includes(permission)
  }, [])

  /**
   * 检查是否有多个权限中的任意一个
   */
  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    const permissions = getPermissions()
    if (permissions.includes('*')) {
      return true
    }
    return permissionList.some((p) => permissions.includes(p))
  }, [])

  /**
   * 检查是否有多个权限中的全部
   */
  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    const permissions = getPermissions()
    if (permissions.includes('*')) {
      return true
    }
    return permissionList.every((p) => permissions.includes(p))
  }, [])

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}

export default usePermission
