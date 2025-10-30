/**
 * 登录页面
 */

import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import * as authApi from '@/api/auth'
import { setToken, setUserInfo } from '@/utils/auth'
import styles from './index.module.less'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(values: { username: string; password: string }) {
    try {
      setLoading(true)
      const response = await authApi.login(values)
      
      // 保存 token 和用户信息
      setToken(response.token)
      setUserInfo(response.user)
      
      message.success('登录成功！')
      
      // 跳转到首页
      navigate('/', { replace: true })
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>ERP 系统</h1>
          <p className={styles.loginSubtitle}>欢迎登录</p>
        </div>
        
        <div className={styles.loginForm}>
          <Form
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.loginTips}>
            <p>💡 开发环境默认账号</p>
            <p>用户名: admin / 密码: admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

