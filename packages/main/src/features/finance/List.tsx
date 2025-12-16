import { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Space,
  Row,
  Col,
  Statistic,
} from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { ListPage } from '@/components'
import { paymentApi, codeflowApi } from '@/api'
import type { Payment, CreatePaymentDto, UpdatePaymentDto } from './types'
import { PaymentType, PaymentStatus, EnumLabels } from '@/constants/enums'

// 收款方式映射
const PaymentMethodLabels: Record<string, string> = {
  cash: '现金',
  bank_transfer: '银行转账',
  alipay: '支付宝',
  wechat: '微信',
}

function formatPaymentMethod(method?: string): string {
  if (!method) return '-'
  return PaymentMethodLabels[method] || method
}
import { financeColumns } from './config'
import { formatDateTime } from '@/utils/format'
import dayjs from 'dayjs'
import styles from './index.module.less'

const { Option } = Select

export default function FinanceList() {
  const [data, setData] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})

  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null)

  const [form] = Form.useForm()

  async function loadData() {
    try {
      setLoading(true)
      const params = { page, pageSize, ...searchParams }
      const result = await paymentApi.listPayments(params)
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

  function handleCreate() {
    setEditMode('create')
    setCurrentPayment(null)
    form.resetFields()
    setModalOpen(true)
  }

  function handleEdit(record: Payment) {
    setEditMode('edit')
    setCurrentPayment(record)
    form.setFieldsValue({
      ...record,
      paidAt: record.paidAt ? dayjs(record.paidAt) : undefined,
    })
    setModalOpen(true)
  }

  function handleViewDetail(record: Payment) {
    setCurrentPayment(record)
    setDetailModalOpen(true)
  }

  async function handleDelete(id: number) {
    try {
      await paymentApi.deletePayment(id)
      message.success('删除成功')
      loadData()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  async function handleSubmit() {
    try {
      const values = await form.validateFields()
      const formattedValues = {
        ...values,
        paidAt: values.paidAt ? values.paidAt.format('YYYY-MM-DD HH:mm:ss') : undefined,
      }

      if (editMode === 'create') {
        await paymentApi.createPayment(formattedValues as CreatePaymentDto)
        message.success('创建成功')
      } else {
        await paymentApi.updatePayment({
          id: currentPayment!.id,
          ...formattedValues,
        } as UpdatePaymentDto)
        message.success('更新成功')
      }
      setModalOpen(false)
      form.resetFields()
      loadData()
    } catch (error: any) {
      if (error.errorFields) return
      message.error(error.message || '操作失败')
    }
  }

  function handleSearch(values: Record<string, any>) {
    setSearchParams(values)
    setPage(1)
  }

  function handleReset() {
    setSearchParams({})
    setPage(1)
  }

  // 确认收款
  async function handleConfirm(record: Payment) {
    Modal.confirm({
      title: '确认收款',
      content: `确定已收到 ¥${record.amount.toLocaleString()} 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await codeflowApi.paymentConfirm({
            paymentId: record.id,
            paidAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          })
          message.success('确认成功')
          loadData()
        } catch (error: any) {
          message.error(error.message || '操作失败')
        }
      },
    })
  }

  const columns = financeColumns(handleEdit, handleDelete, handleViewDetail, handleConfirm)

  // 统计
  const confirmedTotal = data
    .filter((item) => item.status === PaymentStatus.CONFIRMED)
    .reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className={styles.financeList}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="已确认金额"
              value={confirmedTotal}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="记录总数" value={total} suffix="笔" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="当前页数" value={page} suffix={`/ ${Math.ceil(total / pageSize)}`} />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索区域 */}
        <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
          <Form.Item name="paymentNo">
            <Input placeholder="收款单号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="type">
            <Select placeholder="收款类型" allowClear style={{ width: 120 }}>
              <Option value={PaymentType.DEPOSIT}>定金</Option>
              <Option value={PaymentType.CONTRACT}>合同款</Option>
              <Option value={PaymentType.DESIGN_FEE}>设计费</Option>
              <Option value={PaymentType.ADDITION}>增项款</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="状态" allowClear style={{ width: 100 }}>
              <Option value={PaymentStatus.PENDING}>待确认</Option>
              <Option value={PaymentStatus.CONFIRMED}>已确认</Option>
              <Option value={PaymentStatus.CANCELLED}>已取消</Option>
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

        {/* 操作按钮 */}
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增收款记录
          </Button>
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
            showTotal: (total: number) => `共 ${total} 条`,
            onChange: (page: number, pageSize: number) => {
              setPage(page)
              setPageSize(pageSize)
            },
          }}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editMode === 'create' ? '新增收款记录' : '编辑收款记录'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label="订单ID"
            name="orderId"
            rules={[{ required: true, message: '请输入订单ID' }]}
          >
            <InputNumber placeholder="请输入订单ID" style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="收款类型"
                name="type"
                rules={[{ required: true, message: '请选择收款类型' }]}
              >
                <Select placeholder="请选择收款类型">
                  <Option value={PaymentType.DEPOSIT}>定金</Option>
                  <Option value={PaymentType.CONTRACT}>合同款</Option>
                  <Option value={PaymentType.DESIGN_FEE}>设计费</Option>
                  <Option value={PaymentType.ADDITION}>增项款</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="金额"
                name="amount"
                rules={[{ required: true, message: '请输入金额' }]}
              >
                <InputNumber
                  placeholder="请输入金额"
                  style={{ width: '100%' }}
                  min={0}
                  prefix="¥"
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="收款方式" name="method">
                <Input placeholder="请输入收款方式" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="收款时间" name="paidAt">
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="请选择收款时间"
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>
          </Row>

          {editMode === 'edit' && (
            <Form.Item label="状态" name="status">
              <Select placeholder="请选择状态">
                <Option value={PaymentStatus.PENDING}>待确认</Option>
                <Option value={PaymentStatus.CONFIRMED}>已确认</Option>
                <Option value={PaymentStatus.CANCELLED}>已取消</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="收款记录详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentPayment && (
          <div className={styles.detailContent}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>收款单号：</span>
                  <span>{currentPayment.paymentNo}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>订单编号：</span>
                  <span>{currentPayment.order?.orderNo || currentPayment.orderNo || '-'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>收款类型：</span>
                  <span>{EnumLabels.PaymentType[currentPayment.type as PaymentType] || currentPayment.type}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>金额：</span>
                  <span>¥{currentPayment.amount.toLocaleString()}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>收款方式：</span>
                  <span>{formatPaymentMethod(currentPayment.method)}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>收款时间：</span>
                  <span>{currentPayment.paidAt ? formatDateTime(currentPayment.paidAt) : '-'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>创建人：</span>
                  <span>{currentPayment.createdByName || '-'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>状态：</span>
                  <span>{EnumLabels.PaymentStatus[currentPayment.status as PaymentStatus] || currentPayment.status}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>创建时间：</span>
                  <span>{formatDateTime(currentPayment.createdAt)}</span>
                </div>
              </Col>
              {currentPayment.remark && (
                <Col span={24}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>备注：</span>
                    <span>{currentPayment.remark}</span>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}
