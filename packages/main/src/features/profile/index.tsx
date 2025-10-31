/**
 * 个人中心页面
 */

import { useState, useEffect } from 'react'
import { Card, Descriptions, Avatar, Tag, message, Spin } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { getUserInfo, type UserInfo } from '@/api/auth'
import { formatDateTime } from '@/utils/format'
import styles from './index.module.less'

const roleMap: Record<string, string> = {
  admin: '管理员',
  sales: '销售',
  manager: '经理',
  finance: '财务',
  warehouse: '仓库管理',
}

const statusMap: Record<number, { text: string; color: string }> = {
  1: { text: '正常', color: 'success' },
  0: { text: '禁用', color: 'default' },
  2: { text: '锁定', color: 'error' },
}

export default function Profile() {
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  // 加载用户信息
  async function loadUserInfo() {
    try {
      setLoading(true)
      const data = await getUserInfo()
      setUserInfo(data)
    } catch (error: any) {
      message.error(error.message || '获取用户信息失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserInfo()
  }, [])

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
      </div>
    )
  }

  if (!userInfo) {
    return null
  }

  return (
    <div className={styles.profilePage}>
      <Card className={styles.profileCard}>
        <div className={styles.header}>
          <Avatar
            size={80}
            src={userInfo.avatar}
            icon={!userInfo.avatar && <UserOutlined />}
          />
          <div className={styles.info}>
            <h2>{userInfo.name}</h2>
            <p>@{userInfo.username}</p>
          </div>
          <div className={styles.status}>
            <Tag color={statusMap[userInfo.status]?.color}>
              {statusMap[userInfo.status]?.text || '未知'}
            </Tag>
          </div>
        </div>

        <Descriptions
          title="基本信息"
          column={2}
          bordered
          style={{ marginTop: 32 }}
        >
          <Descriptions.Item label="用户名">{userInfo.username}</Descriptions.Item>
          <Descriptions.Item label="姓名">{userInfo.name}</Descriptions.Item>
          <Descriptions.Item label="手机号">{userInfo.mobile}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{userInfo.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color="blue">{roleMap[userInfo.role] || userInfo.role}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusMap[userInfo.status]?.color}>
              {statusMap[userInfo.status]?.text || '未知'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间" span={2}>
            {formatDateTime(userInfo.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新" span={2}>
            {formatDateTime(userInfo.updatedAt)}
          </Descriptions.Item>
          {userInfo.remark && (
            <Descriptions.Item label="备注" span={2}>
              {userInfo.remark}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  )
}

