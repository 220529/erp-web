import { Tag, Space, Button, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { formatDateTime } from '@/utils/format'
import type { Material } from './types'

/**
 * 物料列表列定义
 */
export const materialColumns = (
  onEdit: (record: Material) => void,
  onDelete: (id: number) => void,
  onViewDetail: (record: Material) => void
): ColumnsType<Material> => [
  {
    title: '物料编码',
    dataIndex: 'code',
    key: 'code',
    width: 120,
    fixed: 'left',
  },
  {
    title: '物料名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: '物料类别',
    dataIndex: 'category',
    key: 'category',
    width: 100,
    render: (category: string) => {
      const categoryMap: Record<string, { text: string; color: string }> = {
        main: { text: '主材', color: 'blue' },
        auxiliary: { text: '辅材', color: 'green' },
        labor: { text: '人工', color: 'orange' },
      }
      return <Tag color={categoryMap[category]?.color}>{categoryMap[category]?.text || category}</Tag>
    },
  },
  {
    title: '规格型号',
    dataIndex: 'spec',
    key: 'spec',
    width: 120,
    render: (text: string) => text || '-',
  },
  {
    title: '品牌',
    dataIndex: 'brand',
    key: 'brand',
    width: 100,
    render: (text: string) => text || '-',
  },
  {
    title: '单位',
    dataIndex: 'unit',
    key: 'unit',
    width: 80,
  },
  {
    title: '成本价',
    dataIndex: 'costPrice',
    key: 'costPrice',
    width: 120,
    align: 'right' as const,
    render: (value: string | number) => {
      const price = typeof value === 'string' ? parseFloat(value) : value
      return `¥${(price || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
  },
  {
    title: '销售价',
    dataIndex: 'salePrice',
    key: 'salePrice',
    width: 120,
    align: 'right' as const,
    render: (value: string | number) => {
      const price = typeof value === 'string' ? parseFloat(value) : value
      return `¥${(price || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
    width: 200,
    fixed: 'right',
    render: (_: any, record: Material) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => onViewDetail(record)}>
          详情
        </Button>
        <Button type="link" size="small" onClick={() => onEdit(record)}>
          编辑
        </Button>
        <Popconfirm
          title="确定删除该物料吗？"
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

