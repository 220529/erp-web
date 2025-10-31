import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  Statistic,
  Row,
  Col,
  Typography,
  Spin,
} from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { productApi, materialApi, constantsApi } from '@/api'
import type { Product, ProductMaterial } from './types'
import type { Material } from '../material/types'
import type { ColumnsType } from 'antd/es/table'
import { formatMoney } from '@/utils/format'

const { Title } = Typography

export default function MaterialsManagement() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const [product, setProduct] = useState<Product | null>(null)
  const [materials, setMaterials] = useState<ProductMaterial[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add')
  const [currentMaterial, setCurrentMaterial] = useState<ProductMaterial | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  // 物料库列表
  const [materialLibrary, setMaterialLibrary] = useState<Material[]>([])
  const [materialLoading, setMaterialLoading] = useState(false)

  // 单位映射（用于显示中文）
  const [unitMap, setUnitMap] = useState<Record<string, string>>({})

  // 加载产品信息
  const loadProduct = useCallback(async () => {
    if (!id) return
    try {
      const result = await productApi.getProduct(Number(id))
      setProduct(result)
    } catch (error: any) {
      message.error(error.message || '加载产品信息失败')
      navigate('/product')
    }
  }, [id, navigate])

  // 加载物料清单
  const loadMaterials = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const result = await productApi.getProductMaterials(Number(id))
      console.log('📋 加载到的物料清单:', result)
      console.log('📋 物料数量:', result?.length || 0)
      setMaterials(result || [])
    } catch (error: any) {
      console.error('❌ 加载物料清单失败:', error)
      message.error(error.message || '加载物料清单失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  // 加载物料库
  const loadMaterialLibrary = useCallback(async () => {
    try {
      setMaterialLoading(true)
      const result = await materialApi.listMaterials({ pageSize: 1000, status: 'active' })
      setMaterialLibrary(result.list || [])
    } catch (error: any) {
      message.error(error.message || '加载物料库失败')
    } finally {
      setMaterialLoading(false)
    }
  }, [])

  // 加载单位列表
  const loadUnits = useCallback(async () => {
    try {
      const units = await constantsApi.getUnits()
      const map: Record<string, string> = {}
      units.forEach((u) => {
        map[u.value] = u.label
      })
      setUnitMap(map)
    } catch (error: any) {
      console.error('加载单位列表失败:', error)
    }
  }, [])

  useEffect(() => {
    loadProduct()
    loadMaterials()
    loadMaterialLibrary()
    loadUnits()
  }, [loadProduct, loadMaterials, loadMaterialLibrary, loadUnits])

  // 计算总成本（处理字符串类型）
  const totalCost = materials.reduce((sum, item) => {
    const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount
    return sum + (amount || 0)
  }, 0)
  
  const salePrice = product?.salePrice 
    ? (typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice)
    : 0
  const profit = salePrice - totalCost
  
  // 调试：打印统计数据
  console.log('📊 统计数据:', {
    物料数量: materials.length,
    物料列表: materials,
    物料成本: totalCost,
    套餐售价: salePrice,
    预计利润: profit,
  })

  // 打开添加物料弹窗
  function handleAdd() {
    setEditMode('add')
    setCurrentMaterial(null)
    form.resetFields()
    setModalOpen(true)
  }

  // 打开编辑物料弹窗
  function handleEdit(record: ProductMaterial) {
    setEditMode('edit')
    setCurrentMaterial(record)
    form.setFieldsValue({
      quantity: record.quantity,
      price: record.price,
    })
    setModalOpen(true)
  }

  // 提交表单
  async function handleSubmit() {
    try {
      const values = await form.validateFields()
      console.log('📝 提交的表单数据:', values)
      setSubmitLoading(true)

      if (editMode === 'add') {
        // 添加物料（单位从物料自动获取，不需要传递）
        const result = await productApi.addProductMaterial(Number(id), {
          materialId: values.materialId,
          quantity: values.quantity,
          price: values.price,
        })
        console.log('✅ 添加成功，返回:', result)
        message.success('添加成功')
      } else {
        // 编辑物料（只修改数量和单价）
        const result = await productApi.updateProductMaterial(currentMaterial!.id, {
          quantity: values.quantity,
          price: values.price,
        })
        console.log('✅ 修改成功，返回:', result)
        message.success('修改成功')
      }

      setModalOpen(false)
      form.resetFields()
      
      console.log('🔄 开始重新加载数据...')
      await loadMaterials()
      await loadProduct()
      console.log('✅ 数据重新加载完成')
    } catch (error: any) {
      if (error.errorFields) return // 表单验证错误
      console.error('❌ 提交失败:', error)
      message.error(error.message || '操作失败')
    } finally {
      setSubmitLoading(false)
    }
  }

  // 删除物料
  async function handleDelete(record: ProductMaterial) {
    try {
      await productApi.deleteProductMaterial(record.id)
      message.success('删除成功')
      loadMaterials()
      loadProduct() // 重新加载产品信息，更新成本价
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  // 物料选择变化，自动填充单价和单位
  function handleMaterialChange(materialId: number) {
    const material = materialLibrary.find((m) => m.id === materialId)
    
    if (material) {
      // 后端返回的是字符串，需要转换成数字
      const price = typeof material.salePrice === 'string' 
        ? parseFloat(material.salePrice) 
        : material.salePrice
      
      form.setFieldsValue({
        price: price || 0,
      })
      
      // 保存当前选中的物料信息（用于显示单位）
      setCurrentMaterial(material as any)
    }
  }

  // 表格列定义
  const columns: ColumnsType<ProductMaterial> = [
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
      render: (category: string) => {
        const categoryMap: Record<string, string> = {
          main: '主材',
          auxiliary: '辅材',
          labor: '人工',
        }
        return categoryMap[category] || category
      },
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (unit: string) => unitMap[unit] || unit,
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: (value: number) => formatMoney(value),
    },
    {
      title: '小计',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (value: number) => formatMoney(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: ProductMaterial) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该物料吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card variant="borderless">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 头部 */}
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/product')}
              style={{ marginBottom: 16 }}
            >
              返回套餐列表
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {product.name} ({product.code})
            </Title>
          </div>

          {/* 统计信息 */}
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="物料成本"
                  value={totalCost}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="套餐售价"
                  value={product.salePrice || 0}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="预计利润"
                  value={profit}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: profit >= 0 ? '#52c41a' : '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="物料数量" value={materials.length} suffix="个" />
              </Card>
            </Col>
          </Row>

          {/* 操作按钮 */}
          <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加物料
            </Button>
          </div>

          {/* 物料列表 */}
          <Table
            columns={columns}
            dataSource={materials}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Space>
      </Card>

      {/* 添加/编辑物料弹窗 */}
      <Modal
        title={editMode === 'add' ? '添加物料' : '编辑物料'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        confirmLoading={submitLoading}
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          {editMode === 'add' && (
            <Form.Item
              label="选择物料"
              name="materialId"
              rules={[{ required: true, message: '请选择物料' }]}
            >
              <Select
                placeholder="请选择物料"
                showSearch
                loading={materialLoading}
                optionFilterProp="children"
                onChange={handleMaterialChange}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={materialLibrary.map((m) => ({
                  label: `${m.name} (${m.code})`,
                  value: m.id,
                }))}
              />
            </Form.Item>
          )}

          {editMode === 'edit' && (
            <Form.Item label="物料名称">
              <span style={{ fontSize: 16, fontWeight: 500 }}>
                {currentMaterial?.materialName}
              </span>
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="数量"
                name="quantity"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber
                  placeholder="请输入数量"
                  style={{ width: '100%' }}
                  min={0.01}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="单位">
                <Input
                  value={
                    currentMaterial?.unit
                      ? unitMap[currentMaterial.unit] || currentMaterial.unit
                      : '-'
                  }
                  disabled
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="单价"
            name="price"
            rules={[{ required: true, message: '请输入单价' }]}
            extra="默认为物料销售价，可根据实际情况调整"
          >
            <InputNumber
              placeholder="请输入单价"
              style={{ width: '100%' }}
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

