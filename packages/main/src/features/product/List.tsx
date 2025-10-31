import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Space,
  Row,
  Col,
  Descriptions,
  Table,
} from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { ListPage } from '@/components'
import * as productApi from '@/api/product'
import type { Product, CreateProductDto, UpdateProductDto, ProductMaterial } from './types'
import { productColumns } from './config'
import { formatDateTime, formatMoney } from '@/utils/format'
import { ProductStatus, EnumLabels } from '@/constants/enums'
import styles from './index.module.less'

const { Option } = Select
const { TextArea } = Input

export default function ProductList() {
  const navigate = useNavigate()
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})

  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [materials, setMaterials] = useState<ProductMaterial[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(false)

  const [form] = Form.useForm()

  async function loadData() {
    try {
      setLoading(true)
      const params = { page, pageSize, ...searchParams }
      const result = await productApi.listProducts(params)
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
    setCurrentProduct(null)
    form.resetFields()
    setModalOpen(true)
  }

  function handleEdit(record: Product) {
    setEditMode('edit')
    setCurrentProduct(record)
    form.setFieldsValue({
      name: record.name,
      costPrice: record.costPrice,
      salePrice: record.salePrice,
      description: record.description,
      status: record.status,
      sort: record.sort,
      remark: record.remark,
    })
    setModalOpen(true)
  }

  async function handleViewDetail(record: Product) {
    setCurrentProduct(record)
    setDetailModalOpen(true)
    
    // 加载物料清单
    try {
      setMaterialsLoading(true)
      console.log('📋 正在加载套餐物料清单，产品ID:', record.id)
      const result = await productApi.getProductMaterials(record.id)
      console.log('📋 套餐物料清单加载结果:', result)
      setMaterials(result || [])
    } catch (error: any) {
      console.error('❌ 加载套餐物料清单失败:', error)
      message.error('加载物料清单失败')
    } finally {
      setMaterialsLoading(false)
    }
  }

  function handleManageMaterials(record: Product) {
    navigate(`/product/${record.id}/materials`)
  }

  async function handleDelete(id: number) {
    try {
      await productApi.deleteProduct(id)
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
        await productApi.createProduct(values as CreateProductDto)
        message.success('创建成功')
      } else {
        await productApi.updateProduct({
          id: currentProduct!.id,
          ...values,
        } as UpdateProductDto)
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

  const columns = productColumns(handleEdit, handleDelete, handleViewDetail, handleManageMaterials)

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
      render: (value: string) => {
        const map: Record<string, string> = {
          main: '主材',
          auxiliary: '辅材',
          labor: '人工',
        }
        return map[value] || value
      },
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
  ]

  return (
    <div className={styles.productList}>
      <Card>
        {/* 搜索区域 */}
        <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
          <Form.Item name="keyword">
            <Input placeholder="套餐名称/编码" allowClear />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="状态" allowClear style={{ width: 120 }}>
              <Option value={ProductStatus.ACTIVE}>启用</Option>
              <Option value={ProductStatus.INACTIVE}>停用</Option>
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
            新增套餐
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
        title={editMode === 'create' ? '新增套餐' : '编辑套餐'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        width={700}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label="套餐名称"
            name="name"
            rules={[{ required: true, message: '请输入套餐名称' }]}
          >
            <Input placeholder="如：现代简约三居室套餐" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="成本价"
                name="costPrice"
              >
                <InputNumber
                  placeholder="可选，或由物料自动计算"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  prefix="¥"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="售价"
                name="salePrice"
              >
                <InputNumber
                  placeholder="对客户的销售价格"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  prefix="¥"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="排序" name="sort" initialValue={0}>
                <InputNumber placeholder="请输入排序" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="状态" name="status" initialValue={ProductStatus.ACTIVE}>
            <Select placeholder="请选择状态">
              <Option value={ProductStatus.ACTIVE}>启用</Option>
              <Option value={ProductStatus.INACTIVE}>停用</Option>
            </Select>
          </Form.Item>

          <Form.Item label="套餐描述" name="description">
            <TextArea rows={3} placeholder="请输入套餐描述" />
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="套餐详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        {currentProduct && (
          <div className={styles.detailContent}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="套餐编码">{currentProduct.code}</Descriptions.Item>
              <Descriptions.Item label="套餐名称">{currentProduct.name}</Descriptions.Item>
              <Descriptions.Item label="成本价">
                {formatMoney(currentProduct.costPrice)}
              </Descriptions.Item>
              <Descriptions.Item label="售价">
                {formatMoney(currentProduct.salePrice)}
              </Descriptions.Item>
              <Descriptions.Item label="毛利">
                <span
                  style={{
                    color:
                      currentProduct.salePrice - currentProduct.costPrice >= 0
                        ? '#52c41a'
                        : '#ff4d4f',
                  }}
                >
                  {formatMoney(currentProduct.salePrice - currentProduct.costPrice)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {EnumLabels.ProductStatus[currentProduct.status as ProductStatus]}
              </Descriptions.Item>
              <Descriptions.Item label="排序">{currentProduct.sort}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDateTime(currentProduct.createdAt)}
              </Descriptions.Item>
              {currentProduct.description && (
                <Descriptions.Item label="套餐描述" span={2}>
                  {currentProduct.description}
                </Descriptions.Item>
              )}
              {currentProduct.remark && (
                <Descriptions.Item label="备注" span={2}>
                  {currentProduct.remark}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 16 }}>物料清单</h4>
              <Table
                dataSource={materials}
                columns={materialColumns}
                rowKey="id"
                loading={materialsLoading}
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

