/**
 * 系统功能主页
 */

import { Card, Row, Col, Empty, Modal, message, Typography } from 'antd'
import { KeyOutlined } from '@ant-design/icons'
import * as systemApi from '@/api/system'
import styles from './index.module.less'

const { Paragraph, Text } = Typography

interface SystemFeature {
  key: string
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

export default function SystemIndex() {
  // 获取 Access Secret
  async function handleGetAccessSecret() {
    try {
      const data = await systemApi.getAccessSecret()
      
      if (!data.accessSecret) {
        message.warning('服务器未配置密钥')
        return
      }

      Modal.info({
        title: 'Access Secret',
        width: 500,
        content: (
          <div style={{ marginTop: 16 }}>
            <Paragraph
              copyable
              code
              style={{
                padding: 12,
                background: '#fafafa',
                borderRadius: 4,
                wordBreak: 'break-all',
              }}
            >
              {data.accessSecret}
            </Paragraph>
            <Text type="secondary" style={{ fontSize: 12 }}>
              用于 erp-code 项目上传代码时的身份验证，配置到 .env.local 文件的 UPLOAD_ACCESS_SECRET
            </Text>
          </div>
        ),
      })
    } catch (error: any) {
      message.error(error.message || '获取失败')
    }
  }

  const systemFeatures: SystemFeature[] = [
    {
      key: 'access-secret',
      title: '获取 Access Secret',
      description: '获取 erp-code 项目开发密钥',
      icon: <KeyOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      onClick: handleGetAccessSecret,
    },
    // 其他功能卡片可以在这里添加
  ]

  function handleCardClick(feature: SystemFeature) {
    feature.onClick()
  }

  return (
    <div className={styles.systemPage}>
      <div className={styles.pageHeader}>
        <h2>系统功能</h2>
        <p style={{ color: '#999', fontSize: 14 }}>系统常用功能，点击卡片进入相应功能</p>
      </div>

      {systemFeatures.length === 0 ? (
        <Empty description="暂无功能，请联系管理员配置" style={{ marginTop: 100 }} />
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 500 }}>常用功能</h3>
          </div>
          <Row gutter={[16, 16]}>
            {systemFeatures.map((feature) => (
              <Col xs={24} sm={12} md={8} lg={6} key={feature.key}>
                <Card
                  hoverable
                  className={styles.featureCard}
                  onClick={() => handleCardClick(feature)}
                >
                  <div className={styles.cardContent}>
                    <div className={styles.cardIcon}>{feature.icon}</div>
                    <div className={styles.cardTitle}>{feature.title}</div>
                    <div className={styles.cardDesc}>{feature.description}</div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  )
}

