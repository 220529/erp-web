/**
 * 代码流程列表页面
 * 参考老系统：vue3-v3/src/pages/data/codeflow.vue
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Tooltip,
  Empty,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  PlayCircleOutlined,
  CopyOutlined,
  EyeOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { codeflowApi as codeApi } from '@/api';
import { formatDateTime } from '@/utils/format';
import styles from './index.module.less';

const { TextArea } = Input;
const { Meta } = Card;

// ============================================
// 主组件
// ============================================
export default function List() {
  const [flows, setFlows] = useState<codeApi.Flow[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<codeApi.Flow | null>(null);

  // 单个发布状态
  const [publishingKey, setPublishingKey] = useState<string | null>(null);

  // 检查是否可以显示发布功能
  const canPublish = codeApi.canShowPublishFeature();
  const prodConfig = codeApi.getProdConfig();

  const [form] = Form.useForm();
  const [testForm] = Form.useForm();

  // ============================================
  // 1. 加载流程列表
  // ============================================
  async function loadFlows() {
    try {
      setLoading(true);
      const data = await codeApi.listFlows();
      setFlows(data);
    } catch (error: any) {
      message.error(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFlows();
  }, []);


  // ============================================
  // 1.5 单个发布到生产环境
  // ============================================
  async function handlePublishSingle(flow: codeApi.Flow) {
    if (!prodConfig) {
      message.error('生产环境配置未设置');
      return;
    }

    Modal.confirm({
      title: '确认发布',
      content: (
        <div>
          <p>确定要将以下流程发布到生产环境吗？</p>
          <p>
            <strong>{flow.name}</strong>{' '}
            <Tag color="blue" style={{ fontSize: 10 }}>
              {flow.key}
            </Tag>
          </p>
          <p style={{ color: '#ff4d4f', fontSize: 12 }}>
            发布后将立即在生产环境生效！
          </p>
        </div>
      ),
      okText: '确认发布',
      cancelText: '取消',
      onOk: async () => {
        setPublishingKey(flow.key);
        try {
          // 获取完整的流程信息（包含代码）
          const fullFlow = await codeApi.getFlow(flow.key);
          const result = await codeApi.publishFlowToProd(fullFlow, prodConfig);

          if (result.success) {
            message.success(`${flow.name} 发布成功`);
            loadFlows(); // 刷新列表
          } else {
            message.error(`发布失败: ${result.message}`);
          }
        } catch (error: any) {
          message.error(error.message || '发布失败');
        } finally {
          setPublishingKey(null);
        }
      },
    });
  }

  // ============================================
  // 2. 删除流程
  // ============================================
  async function handleDelete(flow: codeApi.Flow) {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除流程 "${flow.name}" (${flow.key}) 吗？此操作不可恢复！`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          await codeApi.deleteFlow(flow.key);
          message.success('删除成功');
          await loadFlows();
        } catch (error: any) {
          message.error(error.message || '删除失败');
        } finally {
          setLoading(false);
        }
      },
    });
  }

  // ============================================
  // 3. 创建流程
  // ============================================
  function openCreate() {
    form.resetFields();
    setCurrentFlow(null);
    setCreateModalOpen(true);
  }

  async function handleCreate(values: any) {
    try {
      setLoading(true);
      const newFlow = await codeApi.createFlow(values);
      message.success(`流程创建成功！KEY: ${newFlow.key}`);

      // 显示创建成功的信息
      Modal.info({
        title: '流程创建成功',
        width: 700,
        content: (
          <div style={{ marginTop: 16 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <strong>流程 KEY:</strong>{' '}
                <Tag color="blue">{newFlow.key}</Tag>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(newFlow.key);
                    message.success('KEY 已复制');
                  }}
                >
                  复制 KEY
                </Button>
              </div>

              <div>
                <strong>创建时间:</strong> {formatDateTime(newFlow.createdAt)}
              </div>

              <div>
                <strong>更新时间:</strong> {formatDateTime(newFlow.updatedAt)}
              </div>

              {newFlow.code && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <strong>代码模板：</strong>
                    <Button
                      size="small"
                      type="primary"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(newFlow.code || '');
                        message.success('代码模板已复制');
                      }}
                    >
                      复制代码
                    </Button>
                  </div>
                  <pre
                    style={{
                      background: '#f5f5f5',
                      padding: 12,
                      borderRadius: 4,
                      fontSize: 12,
                      maxHeight: 400,
                      overflow: 'auto',
                    }}
                  >
                    {newFlow.code}
                  </pre>
                </div>
              )}
            </Space>
          </div>
        ),
      });

      setCreateModalOpen(false);
      form.resetFields();
      loadFlows();
    } catch (error: any) {
      message.error(error.message || '创建失败');
    } finally {
      setLoading(false);
    }
  }


  // ============================================
  // 4. 编辑流程
  // ============================================
  async function openEdit(flow: codeApi.Flow) {
    try {
      setLoading(true);
      const fullFlow = await codeApi.getFlow(flow.key);
      setCurrentFlow(fullFlow);
      form.setFieldsValue({
        name: fullFlow.name,
        category: fullFlow.category,
        description: fullFlow.description,
        code: fullFlow.code,
      });
      setEditModalOpen(true);
    } catch (error: any) {
      message.error(error.message || '获取流程详情失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(values: any) {
    if (!currentFlow) return;
    try {
      setLoading(true);
      await codeApi.updateFlow(currentFlow.key, values);
      message.success('更新成功');
      setEditModalOpen(false);
      form.resetFields();
      loadFlows();
    } catch (error: any) {
      message.error(error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // 5. 测试执行流程
  // ============================================
  function openTest(flow: codeApi.Flow) {
    setCurrentFlow(flow);
    testForm.resetFields();
    setTestModalOpen(true);
  }

  async function handleTest(values: any) {
    if (!currentFlow) return;
    try {
      setLoading(true);
      let params = {};
      try {
        params = JSON.parse(values.params || '{}');
      } catch (e) {
        message.error('参数格式错误，请输入正确的 JSON');
        return;
      }

      const result = await codeApi.executeFlow(currentFlow.key, params);

      Modal.success({
        title: '执行成功',
        width: 600,
        content: (
          <pre
            style={{
              background: '#f5f5f5',
              padding: 12,
              borderRadius: 4,
              maxHeight: 400,
              overflow: 'auto',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        ),
      });

      setTestModalOpen(false);
    } catch (error: any) {
      Modal.error({
        title: '执行失败',
        content: error.message || '执行失败',
      });
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // 6. 查看流程详情
  // ============================================
  function viewDetail(flow: codeApi.Flow) {
    Modal.info({
      title: `流程详情 - ${flow.name}`,
      width: 700,
      content: (
        <div style={{ marginTop: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <strong>ID:</strong> {flow.id}
            </div>
            <div>
              <strong>KEY:</strong>{' '}
              <Tag color="blue">{flow.key}</Tag>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(flow.key);
                  message.success('KEY 已复制');
                }}
              >
                复制
              </Button>
            </div>
            <div>
              <strong>名称:</strong> {flow.name}
            </div>
            <div>
              <strong>分类:</strong> {flow.category || '无'}
            </div>
            <div>
              <strong>描述:</strong> {flow.description || '无'}
            </div>
            <div>
              <strong>状态:</strong>{' '}
              <Tag color={flow.status === 1 ? 'green' : 'red'}>
                {flow.status === 1 ? '启用' : '禁用'}
              </Tag>
            </div>
            <div>
              <strong>创建时间:</strong> {formatDateTime(flow.createdAt)}
            </div>
            <div>
              <strong>更新时间:</strong> {formatDateTime(flow.updatedAt)}
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(formatDateTime(flow.updatedAt));
                  message.success('更新时间已复制');
                }}
                style={{ marginLeft: 8 }}
              >
                复制
              </Button>
            </div>
            {flow.code && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <strong>代码内容:</strong>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(flow.code || '');
                      message.success('代码模板已复制');
                    }}
                  >
                    复制代码
                  </Button>
                </div>
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    maxHeight: 300,
                    overflow: 'auto',
                    fontSize: 12,
                  }}
                >
                  {flow.code}
                </pre>
              </div>
            )}
          </Space>
        </div>
      ),
    });
  }


  // ============================================
  // 7. 渲染卡片
  // ============================================
  function renderFlowCard(flow: codeApi.Flow) {
    const publishStatus = codeApi.getPublishStatus(flow);
    const publishStatusText = codeApi.getPublishStatusText(publishStatus);
    const isPublishing = publishingKey === flow.key;

    return (
      <Col xs={24} sm={12} md={8} lg={6} xl={4} key={flow.id}>
        <Card
          className={styles.flowCard}
          hoverable
          actions={[
            <Tooltip title="查看详情" key="view">
              <EyeOutlined onClick={() => viewDetail(flow)} />
            </Tooltip>,
            <Tooltip title="编辑" key="edit">
              <EditOutlined onClick={() => openEdit(flow)} />
            </Tooltip>,
            <Tooltip title="执行测试" key="test">
              <PlayCircleOutlined onClick={() => openTest(flow)} />
            </Tooltip>,
            <Tooltip title="删除" key="delete">
              <DeleteOutlined onClick={() => handleDelete(flow)} />
            </Tooltip>,
          ]}
        >
          {/* 发布按钮 - 右上角，仅开发环境显示 */}
          {canPublish && (
            <div className={styles.flowCardPublish}>
              <Tooltip title="发布到生产环境">
                <Button
                  type="primary"
                  size="small"
                  shape="circle"
                  icon={<CloudUploadOutlined />}
                  loading={isPublishing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePublishSingle(flow);
                  }}
                />
              </Tooltip>
            </div>
          )}

          <Meta
            title={
              <div style={{ fontSize: 14, fontWeight: 'bold' }}>{flow.name}</div>
            }
            description={
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div className={styles.flowCardId}>ID: {flow.id}</div>
                <div
                  className={styles.flowCardKey}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                    {flow.key}
                  </Tag>
                  <CopyOutlined
                    style={{ fontSize: 12, cursor: 'pointer', color: '#1890ff' }}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(flow.key);
                      message.success('KEY 已复制');
                    }}
                  />
                </div>
                <div className={styles.flowCardTime}>
                  <div style={{ marginBottom: 2 }}>
                    创建: {formatDateTime(flow.createdAt, 'datetime')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    更新: {formatDateTime(flow.updatedAt, 'datetime')}
                    <CopyOutlined
                      style={{ fontSize: 11, cursor: 'pointer', color: '#666' }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(formatDateTime(flow.updatedAt));
                        message.success('更新时间已复制');
                      }}
                    />
                  </div>
                </div>
                {/* 发布状态显示 */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}
                >
                  <Tag color={publishStatus === 'published' ? 'green' : 'default'}>
                    {publishStatusText}
                  </Tag>
                  {/* 有本地更新未发布的标识 */}
                  {codeApi.hasLocalChanges(flow) && (
                    <Tag color="red" style={{ fontSize: 10, fontWeight: 'bold' }}>
                      有更新
                    </Tag>
                  )}
                  {flow.publishedAt && (
                    <Tooltip title={`发布时间: ${formatDateTime(flow.publishedAt)}`}>
                      <span style={{ fontSize: 11, color: '#999' }}>
                        {formatDateTime(flow.publishedAt, 'datetime')}
                      </span>
                    </Tooltip>
                  )}
                </div>
              </Space>
            }
          />
        </Card>
      </Col>
    );
  }


  // ============================================
  // 8. 主渲染
  // ============================================
  return (
    <div className={styles.codeFlowList}>
      {/* 标题栏 */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <span className={styles.icon}>📋</span>
          代码流程列表
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建代码流程
        </Button>
      </div>

      {/* 流程卡片 */}
      <Spin spinning={loading}>
        {flows.length === 0 ? (
          <Empty description="暂无代码流程" style={{ marginTop: 100 }} />
        ) : (
          <Row gutter={[16, 16]}>{flows.map((flow) => renderFlowCard(flow))}</Row>
        )}
      </Spin>

      {/* 创建流程弹窗 */}
      <Modal
        title="新建代码流程"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="流程名称"
            name="name"
            rules={[{ required: true, message: '请输入流程名称' }]}
          >
            <Input placeholder="例如：创建客户" />
          </Form.Item>

          <Form.Item label="流程分类" name="category">
            <Input placeholder="例如：客户管理" />
          </Form.Item>

          <Form.Item label="流程描述" name="description">
            <TextArea rows={3} placeholder="简要描述流程功能..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑流程弹窗 */}
      <Modal
        title="编辑代码流程"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          style={{ marginTop: 24 }}
        >
          <Form.Item label="流程名称" name="name">
            <Input />
          </Form.Item>

          <Form.Item label="流程分类" name="category">
            <Input />
          </Form.Item>

          <Form.Item label="流程描述" name="description">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item label="代码内容" name="code">
            <TextArea rows={15} style={{ fontFamily: 'monospace', fontSize: 12 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试执行弹窗 */}
      <Modal
        title={`测试执行 - ${currentFlow?.name}`}
        open={testModalOpen}
        onCancel={() => setTestModalOpen(false)}
        onOk={() => testForm.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={testForm}
          layout="vertical"
          onFinish={handleTest}
          style={{ marginTop: 24 }}
        >
          <Form.Item label="请求参数（JSON 格式）" name="params" initialValue="{}">
            <TextArea
              rows={10}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
              placeholder={`{\n  "customerId": 1,\n  "content": "测试数据"\n}`}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
