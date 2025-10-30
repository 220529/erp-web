import { Card, Row, Col, Statistic, Button, Space } from 'antd'
import { UserOutlined, ShoppingOutlined, DollarOutlined, CodeOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import styles from './index.module.less'

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>ERP 系统 - 工作台</h1>
      
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="客户总数"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="订单总数"
              value={0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本月收入"
              value={0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Card className={styles.card}>
        <h2>欢迎使用 ERP 系统</h2>
        <p style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          这是一个基于 React + 微前端架构的企业级 ERP 系统。
        </p>
        <div className={styles.techStack}>
          <h3>技术栈：</h3>
          <ul>
            <li>✅ React 18 + TypeScript</li>
            <li>✅ Vite 5</li>
            <li>✅ Ant Design 5</li>
            <li>✅ React Router 6</li>
            <li>✅ pnpm Workspace Monorepo</li>
            <li>✅ Less + CSS Modules</li>
          </ul>
        </div>
        <div className={styles.quickStart}>
          <h3>快速开始：</h3>
          <Space style={{ marginTop: 12 }}>
            <Link to="/data/codeflow">
              <Button type="primary" icon={<CodeOutlined />}>
                代码流程管理
              </Button>
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  )
}

