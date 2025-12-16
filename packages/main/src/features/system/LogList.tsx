import { useState, useEffect } from 'react'
import { Card, Table, Form, Input, Select, DatePicker, Button, Space, Tag, Modal, message } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { listLogs, getLog } from '@/api/log'
import type { Log, QueryLogParams } from '@/api/log'
import { formatDateTime } from '@/utils/format'

const { RangePicker } = DatePicker
const { Option } = Select

// 模块映射
const ModuleLabels: Record<string, string> = {
  customer: '客户',
  order: '订单',
  payment: '收款',
  product: '套餐',
  material: '物料',
  codeflow: '代码流程',
  system: '系统',
}

export default function LogList() {
  const [data, setData] = useState<Log[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchParams, setSearchParams] = useState<QueryLogParams>({})
  const [detailOpen, setDetailOpen] = useState(false)
  const [currentLog, setCurrentLog] = useState<Log | null>(null)

  const [form] = Form.useForm()

  async function loadData() {
    try {
      setLoading(true)
      const result = await listLogs({ page, pageSize, ...searchParams }) as any
      setData(result?.list || [])
      setTotal(result?.total || 0)
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, pageSize, searchParams])

  function handleSearch(values: any) {
    const params: QueryLogParams = {
      module: values.module,
      action: values.action,
      status: values.status,
    }
    if (values.dateRange?.length === 2) {
      params.startDate = values.dateRange[0].format('YYYY-MM-DD 00:00:00')
      params.endDate = values.dateRange[1].format('YYYY-MM-DD 23:59:59')
    }
    setSearchParams(params)
    setPage(1)
  }

  function handleReset() {
    form.resetFields()
    setSearchParams({})
    setPage(1)
  }

  async function handleViewDetail(record: Log) {
    try {
      const detail = (await getLog(record.id)) as unknown as Log
      setCurrentLog(detail)
      setDetailOpen(true)
    } catch (error: any) {
      message.error('加载详情失败')
    }
  }

  const columns: ColumnsType<Log> = [
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (text) => formatDateTime(text),
    },
    {
      title: '操作人',
      dataIndex: 'username',
      key: 'username',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (text) => ModuleLabels[text] || text,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 150,
    },
    {
      title: '业务ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 80,
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'success' ? 'success' : 'error'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
      render: (text) => text || '-',
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (text) => (text ? `${text}ms` : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
          详情
        </Button>
      ),
    },
  ]

  return (
    <Card>
      <Form form={form} layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="module">
          <Select placeholder="模块" allowClear style={{ width: 120 }}>
            <Option value="customer">客户</Option>
            <Option value="order">订单</Option>
            <Option value="payment">收款</Option>
            <Option value="product">套餐</Option>
            <Option value="material">物料</Option>
            <Option value="codeflow">代码流程</Option>
          </Select>
        </Form.Item>
        <Form.Item name="action">
          <Input placeholder="操作名称" allowClear style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="status">
          <Select placeholder="状态" allowClear style={{ width: 100 }}>
            <Option value="success">成功</Option>
            <Option value="error">失败</Option>
          </Select>
        </Form.Item>
        <Form.Item name="dateRange">
          <RangePicker />
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

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />

      <Modal
        title="日志详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={700}
      >
        {currentLog && (
          <div style={{ lineHeight: 2 }}>
            <p><strong>操作时间：</strong>{formatDateTime(currentLog.createdAt)}</p>
            <p><strong>操作人：</strong>{currentLog.username || '-'}</p>
            <p><strong>模块：</strong>{ModuleLabels[currentLog.module] || currentLog.module}</p>
            <p><strong>操作：</strong>{currentLog.action}</p>
            <p><strong>业务ID：</strong>{currentLog.targetId || '-'}</p>
            <p><strong>状态：</strong>
              <Tag color={currentLog.status === 'success' ? 'success' : 'error'}>
                {currentLog.status === 'success' ? '成功' : '失败'}
              </Tag>
            </p>
            <p><strong>IP：</strong>{currentLog.ip || '-'}</p>
            <p><strong>请求路径：</strong>{currentLog.method} {currentLog.path}</p>
            <p><strong>耗时：</strong>{currentLog.duration ? `${currentLog.duration}ms` : '-'}</p>
            {currentLog.content && (
              <p><strong>描述：</strong>{currentLog.content}</p>
            )}
            {currentLog.errorMsg && (
              <p style={{ color: '#ff4d4f' }}><strong>错误信息：</strong>{currentLog.errorMsg}</p>
            )}
            {currentLog.requestBody && (
              <div>
                <strong>请求参数：</strong>
                <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, maxHeight: 200, overflow: 'auto' }}>
                  {JSON.stringify(JSON.parse(currentLog.requestBody), null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Card>
  )
}
