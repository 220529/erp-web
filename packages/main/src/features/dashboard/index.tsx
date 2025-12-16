import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Button, Space, Spin } from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import * as dashboardApi from '@/api/dashboard'
import styles from './index.module.less'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    customerCount: 0,
    orderCount: 0,
    productCount: 0,
    monthlyIncome: 0,
  })

  useEffect(() => {
    loadStatistics()
  }, [])

  async function loadStatistics() {
    try {
      setLoading(true)
      const data = await dashboardApi.getStatistics()
      setStats(data)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>ERP 系统 - 工作台</h1>

      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Link to="/customer">
              <Card hoverable>
                <Statistic
                  title="客户总数"
                  value={stats.customerCount}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link to="/order">
              <Card hoverable>
                <Statistic
                  title="订单总数"
                  value={stats.orderCount}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link to="/product">
              <Card hoverable>
                <Statistic
                  title="套餐总数"
                  value={stats.productCount}
                  prefix={<AppstoreOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link to="/finance">
              <Card hoverable>
                <Statistic
                  title="本月收入"
                  value={stats.monthlyIncome}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#cf1322' }}
                  suffix="元"
                />
              </Card>
            </Link>
          </Col>
        </Row>
      </Spin>

      <Card className={styles.card}>
        <h2>欢迎使用 ERP 系统</h2>
        <p style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          装修行业企业级管理系统，助力业务高效运转。
        </p>
        <div className={styles.quickStart}>
          <h3>快速开始：</h3>
          <Space style={{ marginTop: 12 }} wrap>
            <Link to="/customer">
              <Button type="primary" icon={<UserOutlined />}>
                客户管理
              </Button>
            </Link>
            <Link to="/order">
              <Button icon={<ShoppingOutlined />}>
                订单管理
              </Button>
            </Link>
            <Link to="/product">
              <Button icon={<AppstoreOutlined />}>
                套餐管理
              </Button>
            </Link>
            <Link to="/material">
              <Button icon={<DatabaseOutlined />}>
                物料管理
              </Button>
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  )
}

