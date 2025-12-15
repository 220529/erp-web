import { useState, useEffect } from 'react'
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
} from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { ListPage } from '@/components'
import { materialApi, constantsApi } from '@/api'
import type { ConstantOption } from '@/api/constants'
import type { Material, CreateMaterialDto, UpdateMaterialDto } from './types'
import { materialColumns } from './config'
import { formatDateTime } from '@/utils/format'
import styles from './index.module.less'

const { Option } = Select

export default function MaterialList() {
  const [data, setData] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})

  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null)
  
  // 单位选项
  const [units, setUnits] = useState<ConstantOption[]>([])
  const [unitsLoading, setUnitsLoading] = useState(false)

  const [form] = Form.useForm()

  async function loadData() {
    try {
      setLoading(true)
      const params = { page, pageSize, ...searchParams }
      const result = await materialApi.listMaterials(params)
      setData(result.list || [])
      setTotal(result.total || 0)
    } catch (error: any) {
      message.error(error.message || '加载失败...')
    } finally {
      setLoading(false)
    }
  }

  // 加载单位列表
  async function loadUnits() {
    try {
      setUnitsLoading(true)
      const result = await constantsApi.getUnits()
      setUnits(result)
    } catch (error: any) {
      message.error(error.message || '加载单位列表失败')
    } finally {
      setUnitsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, pageSize, searchParams])

  useEffect(() => {
    loadUnits()
  }, [])

  function handleCreate() {
    setEditMode('create')
    setCurrentMaterial(null)
    form.resetFields()
    setModalOpen(true)
  }

  function handleEdit(record: Material) {
    setEditMode('edit')
    setCurrentMaterial(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  function handleViewDetail(record: Material) {
    setCurrentMaterial(record)
    setDetailModalOpen(true)
  }

  async function handleDelete(id: number) {
    try {
      await materialApi.deleteMaterial(id)
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
        await materialApi.createMaterial(values as CreateMaterialDto)
        message.success('创建成功')
      } else {
        await materialApi.updateMaterial({
          id: currentMaterial!.id,
          ...values,
        } as UpdateMaterialDto)
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

  const columns = materialColumns(handleEdit, handleDelete, handleViewDetail)

  return (
    <div className={styles.materialList}>
      <Card>
        {/* 搜索区域 */}
        <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
          <Form.Item name="name">
            <Input placeholder="物料名称" allowClear />
          </Form.Item>
          <Form.Item name="code">
            <Input placeholder="物料编码" allowClear />
          </Form.Item>
          <Form.Item name="category">
            <Select placeholder="物料类别" allowClear style={{ width: 120 }}>
              <Option value="main">主材</Option>
              <Option value="auxiliary">辅材</Option>
              <Option value="labor">人工</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="状态" allowClear style={{ width: 100 }}>
              <Option value={1}>启用</Option>
              <Option value={0}>停用</Option>
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
            新增物料
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
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page)
              setPageSize(pageSize)
            },
          }}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editMode === 'create' ? '新增物料' : '编辑物料'}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="物料名称"
                name="name"
                rules={[{ required: true, message: '请输入物料名称' }]}
              >
                <Input placeholder="请输入物料名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="物料类别"
                name="category"
              >
                <Select placeholder="请选择物料类别" allowClear>
                  <Option value="main">主材</Option>
                  <Option value="auxiliary">辅材</Option>
                  <Option value="labor">人工</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="品牌" name="brand">
                <Input placeholder="请输入品牌" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="单位" name="unit">
                <Select 
                  placeholder="请选择单位" 
                  allowClear
                  loading={unitsLoading}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={units.map(u => ({ label: u.label, value: u.value }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="规格型号" name="spec">
            <Input placeholder="请输入规格型号" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="成本价" name="costPrice">
                <InputNumber
                  placeholder="请输入成本价"
                  style={{ width: '100%' }}
                  min={0}
                  prefix="¥"
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="销售价" name="salePrice">
                <InputNumber
                  placeholder="请输入销售价"
                  style={{ width: '100%' }}
                  min={0}
                  prefix="¥"
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="物料详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentMaterial && (
          <div className={styles.detailContent}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>物料编码：</span>
                  <span>{currentMaterial.code}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>物料名称：</span>
                  <span>{currentMaterial.name}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>物料类别：</span>
                  <span>{currentMaterial.category}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>单位：</span>
                  <span>{currentMaterial.unit}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>规格型号：</span>
                  <span>{currentMaterial.spec || '-'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>品牌：</span>
                  <span>{currentMaterial.brand || '-'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>成本价：</span>
                  <span>¥{(typeof currentMaterial.costPrice === 'string' ? parseFloat(currentMaterial.costPrice) : currentMaterial.costPrice || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>销售价：</span>
                  <span>¥{(typeof currentMaterial.salePrice === 'string' ? parseFloat(currentMaterial.salePrice) : currentMaterial.salePrice || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>创建时间：</span>
                  <span>{formatDateTime(currentMaterial.createdAt)}</span>
                </div>
              </Col>
              {currentMaterial.remark && (
                <Col span={24}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>备注：</span>
                    <span>{currentMaterial.remark}</span>
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
