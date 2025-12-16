/**
 * 主布局组件
 * 包含顶部导航、侧边菜单、内容区域
 */

import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space, Button, message, Modal } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { menuConfig, convertToAntdMenuItems } from '@/router/menu.config'
import { getUserInfo, clearAuth } from '@/utils/auth'
import * as authApi from '@/api/auth'
import styles from './index.module.less'

const { Header, Sider, Content } = Layout

// ============================================
// 菜单配置
// ============================================
const menuItems = convertToAntdMenuItems(menuConfig)

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
