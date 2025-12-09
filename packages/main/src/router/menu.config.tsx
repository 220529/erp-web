/**
 * 菜单配置文件
 * 统一管理系统菜单结构
 */

import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  CodeOutlined,
  DatabaseOutlined,
  UserOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  SettingOutlined,
  BookOutlined,
  FolderOutlined,
} from '@ant-design/icons'

export interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  children?: MenuItem[]
  path?: string
}

// ============================================
// 菜单配置
// ============================================
export const menuConfig: MenuItem[] = [
  {
    key: '/',
    label: '工作台',
    icon: <DashboardOutlined />,
    path: '/',
  },
  {
    key: '/customer',
    label: '客户管理',
    icon: <UserOutlined />,
    path: '/customer',
  },
  {
    key: '/product',
    label: '套餐管理',
    icon: <DatabaseOutlined />,
    path: '/product',
  },
  {
    key: '/order',
    label: '订单管理',
    icon: <ShoppingOutlined />,
    path: '/order',
  },
  {
    key: '/finance',
    label: '收款管理',
    icon: <BarChartOutlined />,
    path: '/finance',
  },
  {
    key: '/material',
    label: '物料管理',
    icon: <DatabaseOutlined />,
    path: '/material',
  },
  {
    key: '/data',
    label: '基础数据',
    icon: <SettingOutlined />,
    children: [
      {
        key: '/data/dict',
        label: '字典管理',
        icon: <BookOutlined />,
        path: '/data/dict',
      },
      {
        key: '/data/codeflow',
        label: '代码流程',
        icon: <CodeOutlined />,
        path: '/data/codeflow',
      },
      {
        key: '/data/file',
        label: '文件管理',
        icon: <FolderOutlined />,
        path: '/data/file',
      },
    ],
  },
  {
    key: '/system',
    label: '系统功能',
    icon: <SettingOutlined />,
    path: '/system',
  },
  // 预留其他菜单
  // {
  //   key: '/customer',
  //   label: '客户管理',
  //   icon: <UserOutlined />,
  //   path: '/customer',
  // },
  // {
  //   key: '/order',
  //   label: '订单管理',
  //   icon: <ShoppingOutlined />,
  //   path: '/order',
  // },
  // {
  //   key: '/report',
  //   label: '报表管理',
  //   icon: <BarChartOutlined />,
  //   children: [
  //     {
  //       key: '/report/sales',
  //       label: '销售报表',
  //       path: '/report/sales',
  //     },
  //     {
  //       key: '/report/finance',
  //       label: '财务报表',
  //       path: '/report/finance',
  //     },
  //   ],
  // },
  // {
  //   key: '/system',
  //   label: '系统设置',
  //   icon: <SettingOutlined />,
  //   children: [
  //     {
  //       key: '/system/user',
  //       label: '用户管理',
  //       path: '/system/user',
  //     },
  //     {
  //       key: '/system/role',
  //       label: '角色管理',
  //       path: '/system/role',
  //     },
  //     {
  //       key: '/system/menu',
  //       label: '菜单管理',
  //       path: '/system/menu',
  //     },
  //   ],
  // },
]

// ============================================
// 转换为 Ant Design Menu items
// ============================================
export function convertToAntdMenuItems(
  menuItems: MenuItem[]
): MenuProps['items'] {
  return menuItems.map((item) => {
    if (item.children) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: convertToAntdMenuItems(item.children),
      }
    }
    return {
      key: item.key,
      icon: item.icon,
      label: item.label,
    }
  })
}

// ============================================
// 获取所有菜单路径（用于面包屑）
// ============================================
export function getAllMenuPaths(menuItems: MenuItem[]): Map<string, string> {
  const pathMap = new Map<string, string>()

  function traverse(items: MenuItem[], parentLabel = '') {
    items.forEach((item) => {
      const fullLabel = parentLabel ? `${parentLabel} / ${item.label}` : item.label
      if (item.path) {
        pathMap.set(item.path, fullLabel)
      }
      if (item.children) {
        traverse(item.children, fullLabel)
      }
    })
  }

  traverse(menuItems)
  return pathMap
}

