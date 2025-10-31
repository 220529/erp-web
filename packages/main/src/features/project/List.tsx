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
  Statistic,
} from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { ListPage } from '@/components'
import { projectApi } from '@/api'
import type { Project, CreateProjectDto, UpdateProjectDto } from './types'
import { projectColumns } from './config'
import { formatDateTime } from '@/utils/format'
import styles from './index.module.less'

const { Option } = Select

export default function ProjectList() {
  const [data, setData] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchParams, setSearchParams] = useState<Record<string, any>>({})

  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  const [form] = Form.useForm()

  async function loadData() {
    try {
      setLoading(true)
      const params = { page, pageSize, ...searchParams }
      const result = await projectApi.listProjects(params)
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
    setCurrentProject(null)
    form.resetFields()
    setModalOpen(true)
  }

  function handleEdit(record: Project) {
    setEditMode('edit')
    setCurrentProject(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  function handleViewDetail(record: Project) {
    setCurrentProject(record)
    setDetailModalOpen(true)
  }

  async function handleDelete(id: number) {
    try {
      await projectApi.deleteProject(id)
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
        await projectApi.createProject(values as CreateProjectDto)
        message.success('创建成功')
      } else {
        await projectApi.updateProject({
          id: currentProject!.id,
          ...values,
        } as UpdateProjectDto)
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

  const columns = projectColumns(handleEdit, handleDelete, handleViewDetail)

  // 统计
  const stats = {
    totalCount: data.length,
    inProgressCount: data.filter((item) => item.status === 'in_progress').length,
    completedCount: data.filter((item) => item.status === 'completed' || item.status === 'paused').length,
    avgProgress: 0, // 暂无进度字段
  }

  return (
    <div className={styles.projectList}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="项目总数" value={stats.totalCount} suffix="个" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="施工中"
              value={stats.inProgressCount}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完工"
              value={stats.completedCount}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均进度" value={stats.avgProgress} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索区域 */}
        <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
          <Form.Item name="name">
            <Input placeholder="项目名称" allowClear />
          </Form.Item>
          <Form.Item name="customerName">
            <Input placeholder="客户姓名" allowClear />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="项目状态" allowClear style={{ width: 120 }}>
              <Option value={0}>待开工</Option>
              <Option value={1}>施工中</Option>
              <Option value={2}>暂停中</Option>
              <Option value={3}>已完工</Option>
              <Option value={4}>已验收</Option>
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
            新增项目
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
        title={editMode === 'create' ? '新增项目' : '编辑项目'}
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
            label="项目名称"
            name="name"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="订单 ID"
                name="orderId"
                rules={[{ required: true, message: '请输入订单 ID' }]}
              >
                <InputNumber placeholder="请输入订单 ID" style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="项目地址"
            name="address"
            rules={[{ required: true, message: '请输入项目地址' }]}
          >
            <Input placeholder="请输入项目地址" />
          </Form.Item>

          {editMode === 'edit' && (
            <Form.Item label="项目状态" name="status">
              <Select placeholder="请选择项目状态">
                <Option value="planning">计划中</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="paused">已暂停</Option>
                <Option value="completed">已完工</Option>
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
        title="项目详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentProject && (
          <div className={styles.detailContent}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>项目名称：</span>
                  <span>{currentProject.name}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>订单编号：</span>
                  <span>{currentProject.orderNo}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>客户姓名：</span>
                  <span>{currentProject.customerName}</span>
                </div>
              </Col>
              <Col span={24}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>项目地址：</span>
                  <span>{currentProject.address}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>工长：</span>
                  <span>{currentProject.foremanName || '未分配'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>创建时间：</span>
                  <span>{formatDateTime(currentProject.createdAt)}</span>
                </div>
              </Col>
              {currentProject.remark && (
                <Col span={24}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>备注：</span>
                    <span>{currentProject.remark}</span>
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
