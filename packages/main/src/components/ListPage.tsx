/**
 * 通用列表页面组件
 */

import { ReactNode } from 'react'
import { Card, Table, Button, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType, TableProps, TablePaginationConfig } from 'antd/es/table'

interface ListPageProps<T = any> {
  title: string
  columns: ColumnsType<T>
  data?: T[]
  dataSource?: T[]
  loading?: boolean
  onAdd?: () => void
  tableProps?: TableProps<T>
  pagination?: false | TablePaginationConfig
  extra?: ReactNode
}

export default function ListPage<T = any>({
  title,
  columns,
  data,
  dataSource,
  loading,
  onAdd,
  tableProps,
  pagination,
  extra,
}: ListPageProps<T>) {
  const finalDataSource = data || dataSource || []
  const finalPagination = pagination !== undefined ? pagination : {
    pageSize: 20,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }

  return (
    <div style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title={title}
        extra={
          <Space>
            {extra}
            {onAdd && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                新增
              </Button>
            )}
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={finalDataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={finalPagination}
          {...tableProps}
        />
      </Card>
    </div>
  )
}

