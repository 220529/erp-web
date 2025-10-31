import { Tag, Space, Button, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { formatDateTime } from '@/utils/format'
import type { DictData } from './types'

/**
 * 字典数据列配置
 */
export const dictDataColumns = (
  onEdit: (record: DictData) => void,
  onDelete: (id: number) => void
): ColumnsType<DictData> => [
  {
    title: '字典标签',
    dataIndex: 'label',
    key: 'label',
    width: 150,
  },
  {
    title: '字典值',
    dataIndex: 'value',
    key: 'value',
    width: 150,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
  },
  {
    title: '样式',
    dataIndex: 'cssClass',
    key: 'cssClass',
    width: 100,
    render: (cssClass: string, record: DictData) => {
      if (!cssClass) return '-'
      const colorMap: Record<string, string> = {
        blue: '#1890ff',
        green: '#52c41a',
        orange: '#faad14',
        red: '#ff4d4f',
        purple: '#722ed1',
      }
      return (
        <Tag color={colorMap[cssClass] || 'default'}>
          {record.label}
        </Tag>
      )
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (status: number) => (
      <Tag color={status ? '#87d068' : '#f50'}>{status ? '启用' : '停用'}</Tag>
    ),
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
    width: 150,
    fixed: 'right',
    render: (_: any, record: DictData) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => onEdit(record)}>
          编辑
        </Button>
        <Popconfirm
          title="确定删除该字典数据吗？"
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
