import { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  List as AntList,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Empty,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { ListPage } from '@/components'
import { dictApi } from '@/api'
import type {
  DictType,
  DictData,
  CreateDictTypeDto,
  UpdateDictTypeDto,
  CreateDictDataDto,
  UpdateDictDataDto,
} from './types'
import { dictDataColumns } from './config'
import styles from './index.module.less'

const { Option } = Select

export default function DictManage() {
  // 字典类型相关
  const [dictTypes, setDictTypes] = useState<DictType[]>([])
  const [selectedType, setSelectedType] = useState<DictType | null>(null)
  const [typeLoading, setTypeLoading] = useState(false)

  // 字典数据相关
  const [dictData, setDictData] = useState<DictData[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})

  // 弹窗状态
  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [dataModalOpen, setDataModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  const [currentType, setCurrentType] = useState<DictType | null>(null)
  const [currentData, setCurrentData] = useState<DictData | null>(null)

  const [typeForm] = Form.useForm()
  const [dataForm] = Form.useForm()

  // 加载字典类型列表
  async function loadDictTypes() {
    try {
      setTypeLoading(true)
      const types = await dictApi.getAllEnabledDictTypes()
      setDictTypes(types)
      if (types.length > 0 && !selectedType) {
        setSelectedType(types[0])
      }
    } catch (error: any) {
      message.error(error.message || '加载字典类型失败')
    } finally {
      setTypeLoading(false)
    }
  }

  // 加载字典数据列表
  async function loadDictData() {
    if (!selectedType) return

    try {
      setDataLoading(true)
      const params = {
        page,
        pageSize,
        typeCode: selectedType.code,
        ...searchParams,
      }
      const result = await dictApi.listDictData(params)
      setDictData(result.list || [])
      setTotal(result.total || 0)
    } catch (error: any) {
      message.error(error.message || '加载字典数据失败')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    loadDictTypes()
  }, [])

  useEffect(() => {
    if (selectedType) {
      setPage(1)
      loadDictData()
    }
  }, [selectedType])

  useEffect(() => {
    if (selectedType) {
      loadDictData()
    }
  }, [page, pageSize, searchParams])

  // ==================== 字典类型操作 ====================

  function handleCreateType() {
    setEditMode('create')
    setCurrentType(null)
    typeForm.resetFields()
    setTypeModalOpen(true)
  }

  function handleEditType(type: DictType) {
    setEditMode('edit')
    setCurrentType(type)
    typeForm.setFieldsValue(type)
    setTypeModalOpen(true)
  }

  async function handleDeleteType(type: DictType) {
    try {
      await dictApi.deleteDictType(type.id)
      message.success('删除成功')
      await loadDictTypes()
      if (selectedType?.id === type.id) {
        setSelectedType(dictTypes[0] || null)
      }
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  async function handleSubmitType() {
    try {
      const values = await typeForm.validateFields()
      if (editMode === 'create') {
        await dictApi.createDictType(values as CreateDictTypeDto)
        message.success('创建成功')
      } else {
        await dictApi.updateDictType(currentType!.id, values as UpdateDictTypeDto)
        message.success('更新成功')
      }
      setTypeModalOpen(false)
      typeForm.resetFields()
      await loadDictTypes()
    } catch (error: any) {
      if (error.errorFields) return
      message.error(error.message || '操作失败')
    }
  }

  // ==================== 字典数据操作 ====================

  function handleCreateData() {
    if (!selectedType) {
      message.warning('请先选择字典类型')
      return
    }
    setEditMode('create')
    setCurrentData(null)
    dataForm.resetFields()
    dataForm.setFieldsValue({ typeCode: selectedType.code })
    setDataModalOpen(true)
  }

  function handleEditData(data: DictData) {
    setEditMode('edit')
    setCurrentData(data)
    dataForm.setFieldsValue(data)
    setDataModalOpen(true)
  }

  async function handleDeleteData(id: number) {
    try {
      await dictApi.deleteDictData(id)
      message.success('删除成功')
      loadDictData()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  async function handleSubmitData() {
    try {
      const values = await dataForm.validateFields()
      if (editMode === 'create') {
        await dictApi.createDictData(values as CreateDictDataDto)
        message.success('创建成功')
      } else {
        await dictApi.updateDictData(currentData!.id, values as UpdateDictDataDto)
        message.success('更新成功')
      }
      setDataModalOpen(false)
      dataForm.resetFields()
      loadDictData()
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

  const columns = dictDataColumns(handleEditData, handleDeleteData)

  return (
    <div className={styles.dictManage}>
      <Row gutter={16}>
        {/* 左侧：字典类型列表 */}
        <Col span={6}>
          <Card
            title="字典类型"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleCreateType}
              >
                新增
              </Button>
            }
            className={styles.typeCard}
          >
            <AntList
              loading={typeLoading}
              dataSource={dictTypes}
              locale={{ emptyText: <Empty description="暂无字典类型" /> }}
              renderItem={(item) => (
                <AntList.Item
                  className={`${styles.typeItem} ${selectedType?.id === item.id ? styles.active : ''}`}
                  onClick={() => setSelectedType(item)}
                >
                  <div className={styles.typeInfo}>
                    <div className={styles.typeName}>{item.name}</div>
                    <div className={styles.typeCode}>{item.code}</div>
                  </div>
                  <Space size="small">
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditType(item)
                      }}
                    />
                    <Popconfirm
                      title="确定删除该字典类型吗？"
                      description="删除后该类型下的所有字典数据也将无法访问"
                      onConfirm={(e) => {
                        e?.stopPropagation()
                        handleDeleteType(item)
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </Space>
                </AntList.Item>
              )}
            />
          </Card>
        </Col>

        {/* 右侧：字典数据列表 */}
        <Col span={18}>
          <Card title={selectedType ? `${selectedType.name} - 字典数据` : '字典数据'}>
            {selectedType ? (
              <>
                {/* 搜索区域 */}
                <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
                  <Form.Item name="label">
                    <Input placeholder="字典标签" allowClear />
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
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateData}>
                    新增字典数据
                  </Button>
                </div>

                {/* 列表 */}
                <ListPage
                  title=""
                  data={dictData}
                  loading={dataLoading}
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
              </>
            ) : (
              <Empty description="请先选择字典类型" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 字典类型弹窗 */}
      <Modal
        title={editMode === 'create' ? '新增字典类型' : '编辑字典类型'}
        open={typeModalOpen}
        onOk={handleSubmitType}
        onCancel={() => {
          setTypeModalOpen(false)
          typeForm.resetFields()
        }}
        width={500}
        destroyOnHidden
      >
        <Form form={typeForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label="字典类型编码"
            name="code"
            rules={[
              { required: true, message: '请输入字典类型编码' },
              { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线' },
            ]}
            extra={editMode === 'create' ? '如: customer_source, order_status' : undefined}
          >
            <Input placeholder="customer_source" disabled={editMode === 'edit'} />
          </Form.Item>

          <Form.Item
            label="字典类型名称"
            name="name"
            rules={[{ required: true, message: '请输入字典类型名称' }]}
          >
            <Input placeholder="客户来源" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="排序" name="sort" initialValue={0}>
                <InputNumber placeholder="排序" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            {editMode === 'edit' && (
              <Col span={12}>
                <Form.Item label="状态" name="status" initialValue={1}>
                  <Select>
                    <Option value={1}>启用</Option>
                    <Option value={0}>停用</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 字典数据弹窗 */}
      <Modal
        title={editMode === 'create' ? '新增字典数据' : '编辑字典数据'}
        open={dataModalOpen}
        onOk={handleSubmitData}
        onCancel={() => {
          setDataModalOpen(false)
          dataForm.resetFields()
        }}
        width={500}
        destroyOnHidden
      >
        <Form form={dataForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="typeCode" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="字典标签"
            name="label"
            rules={[{ required: true, message: '请输入字典标签' }]}
            extra="显示给用户看的名称"
          >
            <Input placeholder="线上" />
          </Form.Item>

          <Form.Item
            label="字典值"
            name="value"
            rules={[{ required: true, message: '请输入字典值' }]}
            extra="实际存储的值，建议使用英文"
          >
            <Input placeholder="online" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="排序" name="sort" initialValue={0}>
                <InputNumber placeholder="排序" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="样式" name="cssClass">
                <Select placeholder="请选择样式" allowClear>
                  <Option value="blue">蓝色</Option>
                  <Option value="green">绿色</Option>
                  <Option value="orange">橙色</Option>
                  <Option value="red">红色</Option>
                  <Option value="purple">紫色</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {editMode === 'edit' && (
            <Form.Item label="状态" name="status" initialValue={1}>
              <Select>
                <Option value={1}>启用</Option>
                <Option value={0}>停用</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
