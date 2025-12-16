/**
 * 定时任务管理页面
 */

import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  message,
  Tooltip,
  Descriptions,
  Timeline,
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  HistoryOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import * as schedulerApi from '@/api/scheduler'
import type { TaskExecution } from '@/api/scheduler'
import dayjs from 'dayjs'

interface TaskWithExecution {
  name: string
  running: boolean
  nextDate: string | null
  lastExecution?: TaskExecution
}

export default function SchedulerList() {
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<TaskWithExecution[]>([])
  const [historyVisible, setHistoryVisible] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyData, setHistoryData] = useState<TaskExecution[]>([])
  const [currentTask, setCurrentTask] = useState<string>('')

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoading(true)
    try {
      const res = await schedulerApi.getTasks()
      const taskList = res?.tasks || []
      const executions = res?.executions || {}
      const merged = taskList.map((t) => ({
        ...t,
        lastExecution: executions[t.name],
      }))
      setTasks(merged)
    } catch (error: any) {
      message.error(error.message || '获取任务列表失败')
    } finally {
      setLoading(false)
    }
  }


  async function handleToggleTask(name: string, running: boolean) {
    try {
      const res = running
        ? await schedulerApi.stopTask(name)
        : await schedulerApi.startTask(name)
      message.success(res.message)
      fetchTasks()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  async function handleViewHistory(name: string) {
    setCurrentTask(name)
    setHistoryVisible(true)
    setHistoryLoading(true)
    try {
      const { history } = await schedulerApi.getTaskHistory(name, 20)
      setHistoryData(history)
    } catch (error: any) {
      message.error(error.message || '获取历史记录失败')
    } finally {
      setHistoryLoading(false)
    }
  }

  async function handleManualRun(name: string) {
    Modal.confirm({
      title: '手动执行',
      content: `确定要手动执行任务「${name}」吗？`,
      onOk: async () => {
        try {
          if (name === 'log-cleanup') {
            const res = await schedulerApi.triggerLogCleanup()
            message.success(`${res.message}，删除 ${res.deletedCount} 条`)
          }
          fetchTasks()
        } catch (error: any) {
          message.error(error.message || '执行失败')
        }
      },
    })
  }

  const columns: ColumnsType<TaskWithExecution> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: '状态',
      dataIndex: 'running',
      key: 'running',
      width: 100,
      render: (running: boolean) =>
        running ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>运行中</Tag>
        ) : (
          <Tag color="default" icon={<PauseCircleOutlined />}>已停止</Tag>
        ),
    },
    {
      title: '下次执行',
      dataIndex: 'nextDate',
      key: 'nextDate',
      width: 180,
      render: (date: string | null) =>
        date ? (
          <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {dayjs(date).format('MM-DD HH:mm')}
          </Tooltip>
        ) : '-',
    },
    {
      title: '最近执行',
      key: 'lastExecution',
      width: 200,
      render: (_, record) => {
        const exec = record.lastExecution
        if (!exec) return <span style={{ color: '#999' }}>暂无记录</span>
        return (
          <Space size={4}>
            {exec.success ? (
              <Tag color="success" style={{ margin: 0 }}>成功</Tag>
            ) : (
              <Tag color="error" style={{ margin: 0 }}>失败</Tag>
            )}
            <span style={{ color: '#666', fontSize: 12 }}>
              {dayjs(exec.executedAt).format('MM-DD HH:mm')}
            </span>
            <span style={{ color: '#999', fontSize: 12 }}>
              {exec.duration}ms
            </span>
          </Space>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.running ? '停止' : '启动'}>
            <Button
              type="text"
              size="small"
              icon={record.running ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleTask(record.name, record.running)}
            />
          </Tooltip>
          <Tooltip title="手动执行">
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleManualRun(record.name)}
            />
          </Tooltip>
          <Tooltip title="执行历史">
            <Button
              type="text"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record.name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]


  return (
    <div style={{ padding: 24 }}>
      <Card
        title="定时任务管理"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchTasks} loading={loading}>
            刷新
          </Button>
        }
      >
        <Table
          rowKey="name"
          columns={columns}
          dataSource={tasks}
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>

      <Modal
        title={`执行历史 - ${currentTask}`}
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={null}
        width={600}
      >
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : historyData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无执行记录</div>
        ) : (
          <Timeline
            items={historyData.map((item) => ({
              color: item.success ? 'green' : 'red',
              dot: item.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
              children: (
                <Descriptions size="small" column={1} style={{ marginBottom: 8 }}>
                  <Descriptions.Item label="时间">
                    {dayjs(item.executedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="触发">
                    <Tag color={item.triggerType === 'cron' ? 'blue' : 'orange'}>
                      {item.triggerType === 'cron' ? '定时' : '手动'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="耗时">{item.duration}ms</Descriptions.Item>
                  {item.result && (
                    <Descriptions.Item label="结果">{item.result}</Descriptions.Item>
                  )}
                  {item.error && (
                    <Descriptions.Item label="错误">
                      <span style={{ color: '#ff4d4f' }}>{item.error}</span>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              ),
            }))}
          />
        )}
      </Modal>
    </div>
  )
}
