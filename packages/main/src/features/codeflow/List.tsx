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
  Checkbox,
  Progress,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  PlayCircleOutlined,
  CopyOutlined,
  EyeOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { codeflowApi as codeApi } from '@/api'
import { formatDateTime } from '@/utils/format'
import styles from './index.module.less'

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
  
  // 发布相关状态
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishResult, setPublishResult] = useState<codeApi.BatchPublishResult | null>(null);
  
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
  // 1.5 选择相关操作
  // ============================================
  function handleSelectFlow(flowKey: string, checked: boolean) {
    const newSelected = new Set(selectedKeys);
    if (checked) {
      newSelected.add(flowKey);
    } else {
      newSelected.delete(flowKey);
    }
    setSelectedKeys(newSelected);
  }

  function handleSelectAll() {
    const allKeys = new Set(flows.map(f => f.key));
    setSelectedKeys(allKeys);
  }

  function handleDeselectAll() {
    setSelectedKeys(new Set());
  }

  // ============================================
  // 1.6 发布到生产环境
  // ============================================
  function openPublishModal() {
    if (selectedKeys.size === 0) {
      message.warning('请先选择要发布的流程');
      return;
    }
    setPublishResult(null);
    setPublishProgress(0);
    setPublishModalOpen(true);
  }

  async function handlePublish() {
    if (!prodConfig) {
      message.error('生产环境配置未设置');
      return;
    }

    const selectedFlows = flows.filter(f => selectedKeys.has(f.key));
    if (selectedFlows.length === 0) {
      message.warning('请先选择要发布的流程');
      return;
    }

    // 需要先获取完整的流程代码
    setPublishing(true);
    setPublishProgress(0);

    try {
      // 获取所有选中流程的完整信息（包含代码）
      const fullFlows: codeApi.Flow[] = [];
      for (let i = 0; i < selectedFlows.length; i++) {
        const flow = selectedFlows[i];
        const fullFlow = await codeApi.getFlow(flow.key);
        fullFlows.push(fullFlow);
        setPublishProgress(Math.round(((i + 1) / selectedFlows.length) * 50));
      }

      // 批量发布
      const results: codeApi.PublishResult[] = [];
      for (let i = 0; i < fullFlows.length; i++) {
        const flow = fullFlows[i];
        const result = await codeApi.publishFlowToProd(flow, prodConfig);
        results.push(result);
        setPublishProgress(50 + Math.round(((i + 1) / fullFlows.length) * 50));
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      setPublishResult({
        total: fullFlows.length,
        successCount,
        failureCount,
        results,
      });

      if (failureCount === 0) {
        message.success(`成功发布 ${successCount} 个流程`);
      } else {
        message.warning(`发布完成：成功 ${successCount} 个，失败 ${failureCount} 个`);
      }

      // 清空选择
      setSelectedKeys(new Set());
      // 刷新列表
      loadFlows();
    } catch (error: any) {
      message.error(error.message || '发布失败');
    } finally {
      setPublishing(false);
    }
  }

  function getSelectedFlows(): codeApi.Flow[] {
    return flows.filter(f => selectedKeys.has(f.key));
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
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
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 12, 
                    borderRadius: 4, 
                    fontSize: 12,
                    maxHeight: 400,
                    overflow: 'auto',
                  }}>
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
  // 3. 编辑流程
  // ============================================
  async function openEdit(flow: codeApi.Flow) {
    try {
      setLoading(true);
      // 先获取完整的流程详情（包含代码）
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
  // 4. 测试执行流程
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
          <pre style={{ 
            background: '#f5f5f5', 
            padding: 12, 
            borderRadius: 4,
            maxHeight: 400,
            overflow: 'auto'
          }}>
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
  // 5. 查看流程详情
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
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
                <pre style={{
                  background: '#f5f5f5',
                  padding: 12,
                  borderRadius: 4,
                  maxHeight: 300,
                  overflow: 'auto',
                  fontSize: 12,
                }}>
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
  // 6. 渲染卡片
  // ============================================
  function renderFlowCard(flow: codeApi.Flow) {
    const isSelected = selectedKeys.has(flow.key);
    const publishStatus = codeApi.getPublishStatus(flow);
    const publishStatusText = codeApi.getPublishStatusText(publishStatus);

    return (
      <Col xs={24} sm={12} md={8} lg={6} xl={4} key={flow.id}>
        <Card
          className={`${styles.flowCard} ${isSelected ? styles.flowCardSelected : ''}`}
          hoverable
          actions={[
            <Tooltip title="查看详情">
              <EyeOutlined
                key="view"
                onClick={() => viewDetail(flow)}
              />
            </Tooltip>,
            <Tooltip title="编辑">
              <EditOutlined
                key="edit"
                onClick={() => openEdit(flow)}
              />
            </Tooltip>,
            <Tooltip title="执行测试">
              <PlayCircleOutlined
                key="test"
                onClick={() => openTest(flow)}
              />
            </Tooltip>,
            <Tooltip title="删除">
              <DeleteOutlined
                key="delete"
                onClick={() => handleDelete(flow)}
              />
            </Tooltip>,
          ]}
        >
          {/* 选择复选框 - 仅在开发环境且可发布时显示 */}
          {canPublish && (
            <div className={styles.flowCardCheckbox}>
              <Checkbox
                checked={isSelected}
                onChange={(e) => handleSelectFlow(flow.key, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <Meta
            title={
              <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                {flow.name}
              </div>
            }
            description={
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div className={styles.flowCardId}>ID: {flow.id}</div>
                <div className={styles.flowCardKey} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Tag color={publishStatus === 'published' ? 'green' : 'default'}>
                    {publishStatusText}
                  </Tag>
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
  // 7. 主渲染
  // ============================================
  return (
    <div className={styles.codeFlowList}>
      {/* 标题栏 */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <span className={styles.icon}>📋</span>
          代码流程列表
        </div>
        <Space>
          {/* 发布相关按钮 - 仅在开发环境显示 */}
          {canPublish && (
            <>
              <Button onClick={handleSelectAll}>全选</Button>
              <Button onClick={handleDeselectAll}>取消全选</Button>
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={openPublishModal}
                disabled={selectedKeys.size === 0}
              >
                发布到生产 {selectedKeys.size > 0 && `(${selectedKeys.size})`}
              </Button>
            </>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
          >
            新建代码流程
          </Button>
        </Space>
      </div>

      {/* 流程卡片 */}
      <Spin spinning={loading}>
        {flows.length === 0 ? (
          <Empty description="暂无代码流程" style={{ marginTop: 100 }} />
        ) : (
          <Row gutter={[16, 16]}>
            {flows.map((flow) => renderFlowCard(flow))}
          </Row>
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

          <Form.Item
            label="流程分类"
            name="category"
          >
            <Input placeholder="例如：客户管理" />
          </Form.Item>

          <Form.Item
            label="流程描述"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="简要描述流程功能..."
            />
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
            <TextArea
              rows={15}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
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
          <Form.Item
            label="请求参数（JSON 格式）"
            name="params"
            initialValue='{}'
          >
            <TextArea
              rows={10}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
              placeholder={`{\n  "customerId": 1,\n  "content": "测试数据"\n}`}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 发布确认弹窗 */}
      <Modal
        title="发布到生产环境"
        open={publishModalOpen}
        onCancel={() => {
          if (!publishing) {
            setPublishModalOpen(false);
            setPublishResult(null);
          }
        }}
        footer={
          publishResult ? (
            <Button type="primary" onClick={() => {
              setPublishModalOpen(false);
              setPublishResult(null);
            }}>
              关闭
            </Button>
          ) : (
            <Space>
              <Button onClick={() => setPublishModalOpen(false)} disabled={publishing}>
                取消
              </Button>
              <Button
                type="primary"
                onClick={handlePublish}
                loading={publishing}
                icon={<CloudUploadOutlined />}
              >
                确认发布
              </Button>
            </Space>
          )
        }
        width={600}
        closable={!publishing}
        maskClosable={!publishing}
      >
        {!publishResult ? (
          <div style={{ marginTop: 16 }}>
            <Alert
              message="即将发布以下流程到生产环境"
              description="请确认选中的流程代码已经过测试，发布后将立即在生产环境生效。"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              {getSelectedFlows().map(flow => (
                <div
                  key={flow.key}
                  style={{
                    padding: '8px 12px',
                    marginBottom: 8,
                    background: '#f5f5f5',
                    borderRadius: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{flow.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      <Tag color="blue" style={{ fontSize: 10 }}>{flow.key}</Tag>
                      {flow.category && <span style={{ marginLeft: 8 }}>{flow.category}</span>}
                    </div>
                  </div>
                  <Tag color={codeApi.getPublishStatus(flow) === 'published' ? 'green' : 'default'}>
                    {codeApi.getPublishStatusText(codeApi.getPublishStatus(flow))}
                  </Tag>
                </div>
              ))}
            </div>

            {publishing && (
              <div style={{ marginTop: 16 }}>
                <Progress percent={publishProgress} status="active" />
                <div style={{ textAlign: 'center', color: '#666', marginTop: 8 }}>
                  正在发布中，请勿关闭窗口...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <Alert
              message={`发布完成：成功 ${publishResult.successCount} 个，失败 ${publishResult.failureCount} 个`}
              type={publishResult.failureCount === 0 ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              {publishResult.results.map(result => (
                <div
                  key={result.flowKey}
                  style={{
                    padding: '8px 12px',
                    marginBottom: 8,
                    background: result.success ? '#f6ffed' : '#fff2f0',
                    borderRadius: 4,
                    border: `1px solid ${result.success ? '#b7eb8f' : '#ffccc7'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {result.success ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    )}
                    <span style={{ fontWeight: 500 }}>{result.flowName}</span>
                    <Tag color="blue" style={{ fontSize: 10 }}>{result.flowKey}</Tag>
                  </div>
                  {result.message && (
                    <div style={{ fontSize: 12, color: result.success ? '#52c41a' : '#ff4d4f', marginTop: 4, marginLeft: 22 }}>
                      {result.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

