import { Tag, Space, Button, Popconfirm, Progress } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { formatDateTime } from '@/utils/format'
import type { Project } from './types'

/**
 * 项目列表列定义
 */
export const projectColumns = (
  onEdit: (record: Project) => void,
  onDelete: (id: number) => void,
  onViewDetail: (record: Project) => void
): ColumnsType<Project> => [
  {
    title: '项目名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    fixed: 'left',
  },
  {
    title: '订单编号',
    dataIndex: 'orderNumber',
    key: 'orderNumber',
    width: 150,
  },
  {
    title: '客户姓名',
    dataIndex: 'customerName',
    key: 'customerName',
    width: 120,
  },
  {
    title: '项目地址',
    dataIndex: 'address',
    key: 'address',
    width: 200,
    ellipsis: true,
  },
  {
    title: '项目状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: number) => {
      const statusMap: Record<number, { text: string; color: string }> = {
        0: { text: '待开工', color: 'default' },
        1: { text: '施工中', color: 'processing' },
        2: { text: '暂停中', color: 'warning' },
        3: { text: '已完工', color: 'success' },
        4: { text: '已验收', color: 'success' },
      }
      return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
    },
  },
  {
    title: '项目进度',
    dataIndex: 'progress',
    key: 'progress',
    width: 150,
    render: (progress: number) => <Progress percent={progress} size="small" />,
  },
  {
    title: '工长',
    dataIndex: 'foremanName',
    key: 'foremanName',
    width: 100,
  },
  {
    title: '设计师',
    dataIndex: 'designerName',
    key: 'designerName',
    width: 100,
  },
  {
    title: '计划工期',
    dataIndex: 'planDays',
    key: 'planDays',
    width: 100,
    render: (days: number) => (days ? `${days} 天` : '-'),
  },
  {
    title: '实际工期',
    dataIndex: 'actualDays',
    key: 'actualDays',
    width: 100,
    render: (days: number) => (days ? `${days} 天` : '-'),
  },
  {
    title: '开工日期',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 120,
    render: (text: string) => text || '-',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 160,
    render: (text: string) => formatDateTime(text),
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
    render: (_: any, record: Project) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => onViewDetail(record)}>
          详情
        </Button>
        <Button type="link" size="small" onClick={() => onEdit(record)}>
          编辑
        </Button>
        <Popconfirm
          title="确定删除该项目吗？"
          onConfirm={() => onDelete(record.id)}
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

