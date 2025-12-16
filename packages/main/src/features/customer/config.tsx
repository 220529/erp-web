import { Tag, Space, Button, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { formatDateTime } from '@/utils/format'
import { hasPermission } from '@/utils/auth'
import type { Customer } from '@/features/customer/types'
import { CustomerStatus, EnumLabels, EnumColors } from '@/constants/enums'

/**
 * 客户列表列定义
 */
export const customerColumns = (
  onEdit: (record: Customer) => void,
  onDelete: (id: number) => void,
  onViewDetail: (record: Customer) => void,
): ColumnsType<Customer> => [
  {
    title: '客户姓名',
    dataIndex: 'name',
    key: 'name',
    width: 120,
    fixed: 'left',
  },
  {
    title: '联系电话',
    dataIndex: 'mobile',
    key: 'mobile',
    width: 130,
  },
  {
    title: '所属区域',
    dataIndex: 'area',
    key: 'area',
    width: 120,
  },
  {
    title: '客户地址',
    dataIndex: 'address',
    key: 'address',
    width: 200,
    ellipsis: true,
  },
  {
    title: '客户状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: CustomerStatus) => (
      <Tag color={EnumColors.CustomerStatus[status]}>
        {EnumLabels.CustomerStatus[status] || status}
      </Tag>
    ),
  },
  {
    title: '负责销售',
    dataIndex: 'salesName',
    key: 'salesName',
    width: 100,
    render: (text: string) => text || '-',
  },
  {
    title: '负责设计师',
    dataIndex: 'designerName',
    key: 'designerName',
    width: 100,
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
    render: (_: any, record: Customer) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => onViewDetail(record)}>
          详情
        </Button>
        {hasPermission('customer:update') && (
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
        )}
        {hasPermission('customer:delete') && (
          <Popconfirm
            title="确定删除该客户吗？"
            onConfirm={() => onDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        )}
      </Space>
    ),
  },
]
