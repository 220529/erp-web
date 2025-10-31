import { useState, useEffect } from 'react'
import { Card, Button, Form, Input, Select, message, Space, Row, Col, Statistic } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ListPage } from '@/components'
import { orderApi } from '@/api'
import type { Order } from './types'
import { formatDateTime, formatMoney } from '@/utils/format'
import { OrderStatus, EnumLabels, EnumColors } from '@/constants/enums'
import { Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import styles from './index.module.less'

const { Option } = Select

export default function OrderList() {
  const navigate = useNavigate()
  
  const [data, setData] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})

  // 加载数据
  async function loadData() {
    try {
      setLoading(true)
      const params = {
        page,
        pageSize,
        ...searchParams,
      }
      const result = await orderApi.listOrders(params)
      setData(result.list || [])
      setTotal(result.total || 0)
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, pageSize, searchParams])

  // 查看详情
  function handleViewDetail(record: Order) {
    navigate(`/order/${record.id}`)
  }

  // 搜索
  function handleSearch(values: Record<string, any>) {
    setSearchParams(values)
    setPage(1)
  }

  // 重置搜索
  function handleReset() {
    setSearchParams({})
    setPage(1)
  }

  // 表格列配置
  const columns: ColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      fixed: 'left',
    },
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: '订单总额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (value: number) => formatMoney(value),
    },
    {
      title: '已收金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 120,
      align: 'right',
      render: (value: number) => formatMoney(value),
    },
    {
      title: '未收金额',
      key: 'unpaidAmount',
      width: 120,
      align: 'right',
      render: (_: any, record: Order) => {
        const unpaid = record.totalAmount - record.paidAmount
        return (
          <span style={{ color: unpaid > 0 ? '#ff4d4f' : '#52c41a' }}>
            {formatMoney(unpaid)}
          </span>
        )
      },
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: OrderStatus) => (
        <Tag color={EnumColors.OrderStatus[status]}>
          {EnumLabels.OrderStatus[status]}
        </Tag>
      ),
    },
    {
      title: '签约时间',
      dataIndex: 'signedAt',
      key: 'signedAt',
      width: 160,
      render: (text: string) => (text ? formatDateTime(text) : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (text: string) => formatDateTime(text),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: Order) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  // 统计数据
  const stats = {
    totalAmount: data.reduce((sum, item) => sum + Number(item.totalAmount), 0),
    paidAmount: data.reduce((sum, item) => sum + Number(item.paidAmount), 0),
    draftCount: data.filter((item) => item.status === OrderStatus.DRAFT).length,
    inProgressCount: data.filter((item) => item.status === OrderStatus.IN_PROGRESS).length,
  }

  return (
    <div className={styles.orderList}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总额"
              value={stats.totalAmount}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已收金额"
              value={stats.paidAmount}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="草稿订单" value={stats.draftCount} suffix="单" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="施工中"
              value={stats.inProgressCount}
              suffix="单"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索区域 */}
        <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
          <Form.Item name="orderNo">
            <Input placeholder="订单编号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="customerName">
            <Input placeholder="客户姓名" allowClear />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="订单状态" allowClear style={{ width: 120 }}>
              <Option value={OrderStatus.DRAFT}>草稿</Option>
              <Option value={OrderStatus.SIGNED}>已签约</Option>
              <Option value={OrderStatus.IN_PROGRESS}>施工中</Option>
              <Option value={OrderStatus.COMPLETED}>已完工</Option>
              <Option value={OrderStatus.CANCELLED}>已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 提示信息 */}
        <div style={{ marginBottom: 16, padding: '12px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '4px' }}>
          <span style={{ color: '#1890ff' }}>💡 提示：订单需要通过【客户管理】→ 选择客户 → 点击"转订单"按钮创建</span>
        </div>

        {/* 列表 */}
        <ListPage
          title=""
          data={data}
          loading={loading}
          columns={columns}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page)
              setPageSize(pageSize)
            },
          }}
        />
      </Card>
    </div>
  )
}

