import { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Row,
  Col,
  Table,
} from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ListPage, AuthButton } from '@/components'
import { customerApi, productApi, codeflowApi } from '@/api'
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from './types'
import type { Product } from '@/features/product/types'
import { customerColumns } from './config'
import { formatDateTime, formatMoney } from '@/utils/format'
import { CustomerStatus, EnumLabels } from '@/constants/enums'
import styles from './index.module.less'

const { Option } = Select
const { TextArea } = Input

export default function CustomerList() {
  const navigate = useNavigate()
  
  const [data, setData] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})

  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)


  // 转订单相关状态
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [form] = Form.useForm()
  const [orderForm] = Form.useForm()

  async function loadData() {
    try {
      setLoading(true)
      const params = { page, pageSize, ...searchParams }
      const result = await customerApi.listCustomers(params)
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
    setCurrentCustomer(null)
    form.resetFields()
    setModalOpen(true)
  }

  function handleEdit(record: Customer) {
    setEditMode('edit')
    setCurrentCustomer(record)
    form.setFieldsValue({
      name: record.name,
      mobile: record.mobile,
      address: record.address,
      area: record.area,
      salesId: record.salesId,
      designerId: record.designerId,
      remark: record.remark,
    })
    setModalOpen(true)
  }

  function handleViewDetail(record: Customer) {
    setCurrentCustomer(record)
    setDetailModalOpen(true)
  }

  async function handleDelete(id: number) {
    try {
      await customerApi.deleteCustomer(id)
      message.success('删除成功')
      loadData()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  async function handleSubmit() {
    try {
      const values = await form.validateFields()

      if (editMode === 'create') {
        await customerApi.createCustomer(values as CreateCustomerDto)
        message.success('创建成功')
      } else {
        await customerApi.updateCustomer({
          id: currentCustomer!.id,
          ...values,
        } as UpdateCustomerDto)
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

  // 转订单操作
  async function handleCreateOrder(customer: Customer) {
    setCurrentCustomer(customer)
    setProductModalOpen(true)
    orderForm.resetFields()
    
    // 加载套餐列表
    try {
      setProductsLoading(true)
      const result = await productApi.listProducts({ status: 'active', pageSize: 100 })
      setProducts(result.list || [])
    } catch (error: any) {
      message.error('加载套餐列表失败')
    } finally {
      setProductsLoading(false)
    }
  }

  async function handleOrderSubmit() {
    try {
      const values = await orderForm.validateFields()
      
      const result = await codeflowApi.orderCreateFromProduct({
        customerId: currentCustomer!.id,
        productId: values.productId,
        remark: values.remark,
      })

      message.success('订单创建成功')
      setProductModalOpen(false)
      orderForm.resetFields()
      
      // 跳转到订单详情页
      if (result.data?.orderId) {
        navigate(`/order/${result.data.orderId}`)
      } else {
        loadData()
      }
    } catch (error: any) {
      if (error.errorFields) return
      message.error(error.message || '操作失败')
    }
  }

  const columns = customerColumns(handleEdit, handleDelete, handleViewDetail)

  return (
    <div className={styles.customerList}>
      <Card>
        {/* 搜索区域 */}
        <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
          <Form.Item name="keyword">
            <Input placeholder="客户姓名/电话" allowClear />
          </Form.Item>
          <Form.Item name="stage">
            <Select placeholder="客户状态" allowClear style={{ width: 120 }}>
              <Option value={CustomerStatus.NEW}>新客户</Option>
              <Option value={CustomerStatus.MEASURED}>已量房</Option>
              <Option value={CustomerStatus.QUOTED}>已报价</Option>
              <Option value={CustomerStatus.SIGNED}>已签约</Option>
              <Option value={CustomerStatus.COMPLETED}>已完工</Option>
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
          <Space>
            <AuthButton
              permission="customer:create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新增客户
            </AuthButton>
            <AuthButton
              permission="customer:export"
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={async () => {
                try {
                  setExporting(true)
                  await customerApi.exportCustomers(searchParams)
                  message.success('导出成功')
                } catch (error: any) {
                  message.error(error.message || '导出失败')
                } finally {
                  setExporting(false)
                }
              }}
            >
              导出
            </AuthButton>
          </Space>
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
        title={editMode === 'create' ? '新增客户' : '编辑客户'}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="客户姓名"
                name="name"
                rules={[{ required: true, message: '请输入客户姓名' }]}
              >
                <Input placeholder="请输入客户姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="mobile"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="所属区域" name="area">
            <Input placeholder="请输入所属区域" />
          </Form.Item>

          <Form.Item label="客户地址" name="address">
            <Input placeholder="请输入客户地址" />
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="客户详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          currentCustomer?.status === CustomerStatus.NEW && (
            <Button
              key="create-order"
              type="primary"
              onClick={() => handleCreateOrder(currentCustomer)}
            >
              转订单
            </Button>
          ),
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentCustomer && (
          <div className={styles.detailContent}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>客户姓名：</span>
                  <span>{currentCustomer.name}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>联系电话：</span>
                  <span>{currentCustomer.mobile}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>所属区域：</span>
                  <span>{currentCustomer.area || '-'}</span>
                </div>
              </Col>
              <Col span={24}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>客户地址：</span>
                  <span>{currentCustomer.address || '-'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>客户状态：</span>
                  <span>{EnumLabels.CustomerStatus[currentCustomer.status]}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>负责销售：</span>
                  <span>{currentCustomer.salesName || '-'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>负责设计师：</span>
                  <span>{currentCustomer.designerName || '-'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>创建时间：</span>
                  <span>{formatDateTime(currentCustomer.createdAt)}</span>
                </div>
              </Col>
              {currentCustomer.remark && (
                <Col span={24}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>备注：</span>
                    <span>{currentCustomer.remark}</span>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* 转订单弹窗 */}
      <Modal
        title="选择套餐创建订单"
        open={productModalOpen}
        onOk={handleOrderSubmit}
        onCancel={() => setProductModalOpen(false)}
        width={900}
        destroyOnHidden
      >
        <Form form={orderForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label="选择套餐"
            name="productId"
            rules={[{ required: true, message: '请选择套餐' }]}
          >
            <Select
              placeholder="请选择套餐"
              loading={productsLoading}
              showSearch
              optionFilterProp="children"
            >
              {products.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name} - 售价: {formatMoney(product.salePrice)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>

        {/* 套餐列表预览 */}
        <Table
          dataSource={products}
          loading={productsLoading}
          rowKey="id"
          pagination={false}
          scroll={{ y: 300 }}
          size="small"
          columns={[
            {
              title: '套餐名称',
              dataIndex: 'name',
              key: 'name',
              width: 200,
            },
            {
              title: '售价',
              dataIndex: 'salePrice',
              key: 'salePrice',
              width: 120,
              align: 'right',
              render: (value: number) => formatMoney(value),
            },
            {
              title: '描述',
              dataIndex: 'description',
              key: 'description',
              ellipsis: true,
            },
          ]}
        />
      </Modal>
    </div>
  )
}
