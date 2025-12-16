/**
 * 主布局组件
 * 包含顶部导航、侧边菜单、内容区域
 */

import { useState, useMemo } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space, Button, message, Modal } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  BookOutlined,
  CodeOutlined,
  FolderOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  TeamOutlined,
  ApartmentOutlined,
  SafetyOutlined,
  MenuOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { menuConfig, convertToAntdMenuItems } from '@/router/menu.config'
import { getUserInfo, clearAuth, getMenus } from '@/utils/auth'
import type { MenuItem as ApiMenuItem } from '@/api/auth'
import * as authApi from '@/api/auth'
import styles from './index.module.less'

const { Header, Sider, Content } = Layout

// ============================================
// 图标映射
// ============================================
const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  UserOutlined: <UserOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  SettingOutlined: <SettingOutlined />,
  BookOutlined: <BookOutlined />,
  CodeOutlined: <CodeOutlined />,
  FolderOutlined: <FolderOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  KeyOutlined: <KeyOutlined />,
  TeamOutlined: <TeamOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  MenuOutlined: <MenuOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  PayCircleOutlined: <BarChartOutlined />,
  AppstoreOutlined: <DatabaseOutlined />,
  ShopOutlined: <ShoppingOutlined />,
}

// ============================================
// 将后端菜单转换为 Ant Design Menu items
// ============================================
function convertApiMenuToAntd(menus: ApiMenuItem[]): MenuProps['items'] {
  return menus
    .filter((item) => item.type === 'menu' && item.hidden !== 1)
    .map((item) => {
      // 有子菜单的用 name 作为 key（分组），叶子菜单用 path 作为 key（可点击跳转）
      const hasChildren = item.children && item.children.filter((c) => c.type === 'menu').length > 0
      const menuItem: any = {
        key: hasChildren ? `group-${item.name}` : (item.path || `/${item.name}`),
        icon: item.icon ? iconMap[item.icon] : null,
        label: item.title,
      }
      if (hasChildren) {
        menuItem.children = convertApiMenuToAntd(item.children!)
      }
      return menuItem
    })
}

// ============================================
// 静态菜单配置（后端菜单为空时使用）
// ============================================
const staticMenuItems = convertToAntdMenuItems(menuConfig)

// ============================================
// 主组件
// ============================================
// 根据路径获取需要展开的菜单 keys
function getOpenKeys(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean)
  const keys: string[] = []
  let path = ''
  for (let i = 0; i < parts.length - 1; i++) {
    path += '/' + parts[i]
    keys.push(path)
  }
  return keys
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const userInfo = getUserInfo()
  const [openKeys, setOpenKeys] = useState<string[]>(() => getOpenKeys(location.pathname))

  // 动态菜单：优先使用后端返回的菜单，为空时使用静态菜单
  const menuItems = useMemo(() => {
    const apiMenus = getMenus()
    if (apiMenus && apiMenus.length > 0) {
      return convertApiMenuToAntd(apiMenus)
    }
    return staticMenuItems
  }, [])

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  // 处理登出
  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      onOk: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          // 即使接口调用失败也清除本地信息
          console.error('退出登录接口调用失败:', error)
        } finally {
          // 清除本地认证信息
          clearAuth()
          message.success('已退出登录')
          // 跳转到登录页
          navigate('/login', { replace: true })
        }
      },
    })
  }

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  // 处理用户菜单点击
  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        navigate('/profile')
        break
      case 'settings':
        message.info('系统设置功能开发中...')
        break
      case 'logout':
        handleLogout()
        break
    }
  }

  return (
    <Layout className={styles.mainLayout}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={styles.sider}
      >
        {/* Logo 区域 */}
        <div className={styles.logo} onClick={() => navigate('/')}>
          <span className={styles.logoIcon}>🏢</span>
          {!collapsed && <span className={styles.logoText}>ERP 系统</span>}
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        {/* 顶部导航 */}
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.trigger}
            />
          </div>

          <div className={styles.headerRight}>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <Space className={styles.userInfo}>
                <Avatar icon={<UserOutlined />} />
                <span>{userInfo?.name || userInfo?.username || '管理员'}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
