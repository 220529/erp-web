/**
 * 权限按钮组件
 * 根据权限决定是否渲染按钮
 */

import { Button, ButtonProps, Tooltip } from 'antd'
import { usePermission } from '@/hooks/usePermission'

interface AuthButtonProps extends ButtonProps {
  /** 需要的权限标识 */
  permission: string
  /** 无权限时是否显示禁用状态（默认不显示） */
  showDisabled?: boolean
  /** 无权限时的提示文字 */
  disabledTip?: string
}

export default function AuthButton({
  permission,
  showDisabled = false,
  disabledTip = '暂无权限',
  children,
  ...buttonProps
}: AuthButtonProps) {
  const { hasPermission } = usePermission()

  // 检查权限
  const hasAuth = hasPermission(permission)

  // 无权限且不显示禁用状态，直接不渲染
  if (!hasAuth && !showDisabled) {
    return null
  }

  // 无权限但显示禁用状态
  if (!hasAuth && showDisabled) {
    return (
      <Tooltip title={disabledTip}>
        <Button {...buttonProps} disabled>
          {children}
        </Button>
      </Tooltip>
    )
  }

  // 有权限，正常渲染
  return <Button {...buttonProps}>{children}</Button>
}
