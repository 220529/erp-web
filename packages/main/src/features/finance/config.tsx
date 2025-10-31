import { Tag, Space, Button, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { formatDateTime } from '@/utils/format'
import type { Payment } from './types'
import { PaymentType, PaymentStatus } from '@/constants/enums'

/**
 * 财务列表列定义
 */
export const financeColumns = (
  onEdit: (record: Payment) => void,
  onDelete: (id: number) => void,
  onViewDetail: (record: Payment) => void,
  onConfirm: (record: Payment) => void
): ColumnsType<Payment> => [
  {
    title: '收款单号',
    dataIndex: 'paymentNo',
    key: 'paymentNo',
    width: 150,
    fixed: 'left',
  },
  {
    title: '订单编号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    width: 150,
    render: (text: string) => text || '-',
  },
  {
    title: '收款类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    render: (type: PaymentType) => {
      const typeMap: Record<string, { text: string; color: string }> = {
        [PaymentType.DEPOSIT]: { text: '定金', color: 'blue' },
        [PaymentType.CONTRACT]: { text: '合同款', color: 'green' },
        [PaymentType.DESIGN_FEE]: { text: '设计费', color: 'orange' },
        [PaymentType.ADDITION]: { text: '增项款', color: 'purple' },
      }
      return <Tag color={typeMap[type]?.color}>{typeMap[type]?.text || type}</Tag>
    },
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    render: (amount: number) => (
      <span style={{ fontWeight: 500 }}>¥{amount.toLocaleString()}</span>
    ),
  },
  {
    title: '收款方式',
    dataIndex: 'method',
    key: 'method',
    width: 100,
    render: (method: string) => method || '-',
  },
  {
    title: '收款时间',
    dataIndex: 'paidAt',
    key: 'paidAt',
    width: 160,
    render: (text: string) => (text ? formatDateTime(text) : '-'),
  },
  {
    title: '创建人',
    dataIndex: 'createdByName',
    key: 'createdByName',
    width: 100,
    render: (text: string) => text || '-',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: PaymentStatus) => {
      const statusMap: Record<string, { text: string; color: string }> = {
        [PaymentStatus.PENDING]: { text: '待确认', color: 'default' },
        [PaymentStatus.CONFIRMED]: { text: '已确认', color: 'success' },
        [PaymentStatus.CANCELLED]: { text: '已取消', color: 'error' },
      }
      return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text || status}</Tag>
    },
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
    width: 240,
    fixed: 'right',
    render: (_: any, record: Payment) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => onViewDetail(record)}>
          详情
        </Button>
        {record.status === PaymentStatus.PENDING && (
          <Button type="link" size="small" onClick={() => onConfirm(record)}>
            确认收款
          </Button>
        )}
        <Button type="link" size="small" onClick={() => onEdit(record)}>
          编辑
        </Button>
        <Popconfirm
          title="确定删除该记录吗？"
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
