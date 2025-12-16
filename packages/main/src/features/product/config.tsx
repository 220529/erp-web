import { Tag, Space, Button, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { formatDateTime, formatMoney } from '@/utils/format'
import type { Product } from './types'
import { ProductStatus, EnumLabels, EnumColors } from '@/constants/enums'

/**
 * 套餐列表列定义
 */
export const productColumns = (
  onEdit: (record: Product) => void,
  onDelete: (id: number) => void,
  onViewDetail: (record: Product) => void,
  onManageMaterials: (record: Product) => void,
  permissions: { canUpdate: boolean; canDelete: boolean } = { canUpdate: true, canDelete: true }
): ColumnsType<Product> => [
  {
    title: '套餐编码',
    dataIndex: 'code',
    key: 'code',
    width: 120,
    fixed: 'left',
  },
  {
    title: '套餐名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    ellipsis: true,
  },
  {
    title: '成本价',
    dataIndex: 'costPrice',
    key: 'costPrice',
    width: 120,
    align: 'right',
    render: (value: number) => formatMoney(value),
  },
  {
    title: '售价',
    dataIndex: 'salePrice',
    key: 'salePrice',
    width: 120,
    align: 'right',
    render: (value: number) => formatMoney(value),
  },
  {
    title: '毛利',
    key: 'profit',
    width: 120,
    align: 'right',
    render: (_: any, record: Product) => {
      const profit = record.salePrice - record.costPrice
      return (
        <span style={{ color: profit >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {formatMoney(profit)}
        </span>
      )
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => (
      <Tag color={EnumColors.ProductStatus[status as ProductStatus]}>
        {EnumLabels.ProductStatus[status as ProductStatus]}
      </Tag>
    ),
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
    align: 'center',
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
    render: (_: any, record: Product) => (
      <Space size="small">
        {permissions.canUpdate && (
          <Button type="link" size="small" onClick={() => onManageMaterials(record)}>
            管理物料
          </Button>
        )}
        <Button type="link" size="small" onClick={() => onViewDetail(record)}>
          详情
        </Button>
        {permissions.canUpdate && (
          <Button type="link" size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
        )}
        {permissions.canDelete && (
          <Popconfirm
            title="确定删除该套餐吗？"
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

