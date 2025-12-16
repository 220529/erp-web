import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Popconfirm,
  Row,
  Col,
  Statistic,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { orderApi, codeflowApi } from '@/api'
import type { Order, OrderMaterial, CreateOrderMaterialDto } from './types'
import { formatDateTime, formatMoney } from '@/utils/format'
import { OrderStatus, OrderItemCategory, EnumLabels, EnumColors } from '@/constants/enums'
import styles from './index.module.less'

const { Option } = Select

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [materials, setMaterials] = useState<OrderMaterial[]>([])
  const [loading, setLoading] = useState(false)
  const [materialsLoading, setMaterialsLoading] = useState(false)

  // 签约弹窗
  const [signModalOpen, setSignModalOpen] = useState(false)
  const [signLoading, setSignLoading] = useState(false)
  const [signForm] = Form.useForm()

  // 明细编辑弹窗
  const [materialModalOpen, setMaterialModalOpen] = useState(false)
  const [materialEditMode, setMaterialEditMode] = useState<'create' | 'edit'>('create')
  const [currentMaterial, setCurrentMaterial] = useState<OrderMaterial | null>(null)
  const [materialForm] = Form.useForm()

  useEffect(() => {
    if (id) {
      loadOrderDetail()
      loadMaterials()
    }
  }, [id])

  async function loadOrderDetail() {
    try {
      setLoading(true)
      const data = await orderApi.getOrder(Number(id))
      setOrder(data)
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  async function loadMaterials() {
    try {
      setMaterialsLoading(true)
      const data = await orderApi.getOrderMaterials(Number(id))
      setMaterials(data || [])
    } catch (error: any) {
      message.error('加载明细失败')
    } finally {
      setMaterialsLoading(false)
    }
  }

  // 签约
  async function handleSign() {
    setSignModalOpen(true)
    signForm.resetFields()
  }

  async function handleSignSubmit() {
    try {
      setSignLoading(true)
      const values = await signForm.validateFields()

      await codeflowApi.orderSign({
        orderId: Number(id),
        depositAmount: values.depositAmount,
        paymentMethod: values.paymentMethod,
      })

      message.success('签约成功')
      setSignModalOpen(false)
      signForm.resetFields()
      loadOrderDetail()
    } catch (error: any) {
      if (error.errorFields) return
      message.error(error.message || '操作失败')
    } finally {
      setSignLoading(false)
    }
  }

  // 开工
  async function handleStart() {
    Modal.confirm({
      title: '确认开工',
      content: '订单开工后将进入施工阶段，确定开工吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await codeflowApi.orderStart({
            orderId: Number(id),
          })
          message.success('开工成功')
          loadOrderDetail()
        } catch (error: any) {
          message.error(error.message || '操作失败')
        }
      },
    })
  }

  // 完工
  async function handleComplete() {
    try {
      await codeflowApi.orderComplete({ orderId: Number(id) })
      message.success('完工成功')
      loadOrderDetail()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  // 明细操作
  function handleCreateMaterial() {
    setMaterialEditMode('create')
    setCurrentMaterial(null)
    materialForm.resetFields()
    setMaterialModalOpen(true)
  }

  function handleEditMaterial(record: OrderMaterial) {
    setMaterialEditMode('edit')
    setCurrentMaterial(record)
    materialForm.setFieldsValue({
      materialName: record.materialName,
      category: record.category,
      quantity: record.quantity,
      unit: record.unit,
      price: record.price,
    })
    setMaterialModalOpen(true)
  }

  async function handleDeleteMaterial(id: number) {
    try {
      await orderApi.deleteOrderMaterial(id)
      message.success('删除成功')
      loadMaterials()
      loadOrderDetail()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  async function handleMaterialSubmit() {
    try {
      const values = await materialForm.validateFields()

      if (materialEditMode === 'create') {
        await orderApi.createOrderMaterial({
          orderId: Number(id),
          ...values,
        } as CreateOrderMaterialDto)
        message.success('添加成功')
      } else {
        // 使用 codeflow API 更新明细（会自动重新计算订单总额）
        await codeflowApi.orderMaterialUpdate({
          orderMaterialId: currentMaterial!.id,
          quantity: values.quantity,
          price: values.price,
        })
        message.success('更新成功')
      }

      setMaterialModalOpen(false)
      materialForm.resetFields()
      loadMaterials()
      loadOrderDetail()
    } catch (error: any) {
      if (error.errorFields) return
      message.error(error.message || '操作失败')
    }
  }

  const materialColumns = [
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 200,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (value: string) => EnumLabels.OrderItemCategory[value as OrderItemCategory],
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right' as const,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right' as const,
      render: (value: number) => formatMoney(value),
    },
    {
      title: '小计',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (value: number) => formatMoney(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: OrderMaterial) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditMaterial(record)}
            disabled={order?.status !== OrderStatus.PENDING}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该明细吗？"
            onConfirm={() => handleDeleteMaterial(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={order?.status !== OrderStatus.PENDING}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (!order) {
    return (
      <Card loading={loading}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>订单不存在</div>
      </Card>
    )
  }

  const unpaidAmount = order.totalAmount - order.paidAmount

  return (
    <div className={styles.orderDetail}>
      <Card>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/order')} style={{ marginBottom: 16 }}>
          返回列表
        </Button>

        {/* 订单基本信息 */}
        <Card title="订单信息" style={{ marginBottom: 16 }}>
          <Descriptions column={3} bordered>
            <Descriptions.Item label="订单编号">{order.orderNo}</Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={EnumColors.OrderStatus[order.status]}>
                {EnumLabels.OrderStatus[order.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="客户姓名">{order.customerName || '-'}</Descriptions.Item>
            <Descriptions.Item label="签约时间">
              {order.signedAt ? formatDateTime(order.signedAt) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="开工时间">
              {order.startedAt ? formatDateTime(order.startedAt) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="完工时间">
              {order.completedAt ? formatDateTime(order.completedAt) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={3}>
              {formatDateTime(order.createdAt)}
            </Descriptions.Item>
            {order.remark && (
              <Descriptions.Item label="备注" span={3}>
                {order.remark}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 金额统计 */}
        <Card title="金额信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="订单总额" value={order.totalAmount} precision={2} prefix="¥" />
            </Col>
            <Col span={6}>
              <Statistic
                title="已收金额"
                value={order.paidAmount}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="未收金额"
                value={unpaidAmount}
                precision={2}
                prefix="¥"
                valueStyle={{ color: unpaidAmount > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic title="成本金额" value={order.costAmount} precision={2} prefix="¥" />
            </Col>
          </Row>
        </Card>

        {/* 状态流转按钮 */}
        <Card title="订单操作" style={{ marginBottom: 16 }}>
          {order.status === OrderStatus.PENDING && (
            <Space>
              <Button type="primary" onClick={handleSign}>
                签约
              </Button>
            </Space>
          )}
          {order.status === OrderStatus.SIGNED && (
            <Space>
              <Popconfirm
                title="确定开工吗？"
                description="订单开工后将进入施工阶段"
                onConfirm={handleStart}
                okText="确定"
                cancelText="取消"
              >
                <Button type="primary">开工</Button>
              </Popconfirm>
            </Space>
          )}
          {order.status === OrderStatus.IN_PROGRESS && (
            <Space>
              <Popconfirm
                title="确定完工吗？"
                onConfirm={handleComplete}
                okText="确定"
                cancelText="取消"
              >
                <Button type="primary">完工</Button>
              </Popconfirm>
            </Space>
          )}
          {order.status === OrderStatus.COMPLETED && (
            <div style={{ color: '#52c41a', fontSize: 14 }}>
              ✅ 订单已完工，感谢您的信任！
            </div>
          )}
          {order.status === OrderStatus.VOIDED && (
            <div style={{ color: '#ff4d4f', fontSize: 14 }}>
              ❌ 订单已作废
            </div>
          )}
        </Card>

        {/* 订单明细 */}
        <Card
          title="订单明细"
          extra={
            order.status === OrderStatus.PENDING && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateMaterial}>
                添加明细
              </Button>
            )
          }
        >
          <Table
            dataSource={materials}
            columns={materialColumns}
            rowKey="id"
            loading={materialsLoading}
            pagination={false}
            scroll={{ x: 1000 }}
            summary={(data) => {
              const total = data.reduce((sum, item) => sum + Number(item.amount), 0)
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5} align="right">
                      <strong>合计：</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>{formatMoney(total)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                  </Table.Summary.Row>
                </Table.Summary>
              )
            }}
          />
        </Card>
      </Card>

      {/* 签约弹窗 */}
      <Modal
        title="订单签约"
        open={signModalOpen}
        onOk={handleSignSubmit}
        onCancel={() => setSignModalOpen(false)}
        confirmLoading={signLoading}
        width={600}
        destroyOnHidden
      >
        <Form form={signForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label="定金金额"
            name="depositAmount"
            rules={[{ required: true, message: '请输入定金金额' }]}
          >
            <InputNumber
              placeholder="请输入定金金额"
              style={{ width: '100%' }}
              min={0}
              precision={2}
            />
          </Form.Item>
          <Form.Item
            label="收款方式"
            name="paymentMethod"
            rules={[{ required: true, message: '请选择收款方式' }]}
          >
            <Select placeholder="请选择收款方式">
              <Option value="cash">现金</Option>
              <Option value="bank_transfer">银行转账</Option>
              <Option value="alipay">支付宝</Option>
              <Option value="wechat">微信</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 明细编辑弹窗 */}
      <Modal
        title={materialEditMode === 'create' ? '添加明细' : '编辑明细'}
        open={materialModalOpen}
        onOk={handleMaterialSubmit}
        onCancel={() => setMaterialModalOpen(false)}
        width={600}
        destroyOnHidden
      >
        <Form form={materialForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label="物料名称"
            name="materialName"
            rules={[{ required: true, message: '请输入物料名称' }]}
          >
            <Input placeholder="请输入物料名称" disabled={materialEditMode === 'edit'} />
          </Form.Item>
          <Form.Item
            label="类别"
            name="category"
            rules={[{ required: true, message: '请选择类别' }]}
          >
            <Select placeholder="请选择类别" disabled={materialEditMode === 'edit'}>
              <Option value={OrderItemCategory.MAIN}>主材</Option>
              <Option value={OrderItemCategory.AUXILIARY}>辅材</Option>
              <Option value={OrderItemCategory.LABOR}>人工</Option>
              <Option value={OrderItemCategory.ADDITION}>增项</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="数量"
                name="quantity"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber placeholder="请输入数量" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="单位"
                name="unit"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input placeholder="请输入单位" disabled={materialEditMode === 'edit'} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="单价"
            name="price"
            rules={[{ required: true, message: '请输入单价' }]}
          >
            <InputNumber
              placeholder="请输入单价"
              style={{ width: '100%' }}
              min={0}
              precision={2}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

