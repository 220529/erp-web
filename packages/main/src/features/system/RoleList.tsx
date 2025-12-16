/**
 * 角色管理页面
 */

import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Tag, Tree } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import * as systemApi from '@/api/system'
import type { Role, Menu } from '@/api/system'
import AuthButton from '@/components/AuthButton'

export default function RoleList() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  // 弹窗状态
  const [roleModal, setRoleModal] = useState<{ open: boolean; data?: Role }>({ open: false })
  const [permModal, setPermModal] = useState<{ open: boolean; role?: Role }>({ open: false })
  const [menuTree, setMenuTree] = useState<Menu[]>([])
  const [checkedKeys, setCheckedKeys] = useState<number[]>([])
  const [permLoading, setPermLoading] = useState(false)

  const [form] = Form.useForm()

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async (page = 1) => {
    setLoading(true)
    try {
      const res: any = await systemApi.getRoles({ page, pageSize: pagination.pageSize })
      setRoles(res.list || [])
      setPagination((p) => ({ ...p, current: page, total: res.total }))
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    form.resetFields()
    setRoleModal({ open: true })
  }

  const handleEdit = (role: Role) => {
    form.setFieldsValue(role)
    setRoleModal({ open: true, data: role })
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    if (roleModal.data) {
      await systemApi.updateRole(roleModal.data.id, values)
      message.success('更新成功')
    } else {
      await systemApi.createRole(values)
      message.success('创建成功')
    }
    setRoleModal({ open: false })
    loadRoles(pagination.current)
  }

  const handleDelete = async (id: number) => {
    await systemApi.deleteRole(id)
    message.success('删除成功')
    loadRoles(pagination.current)
  }

  // 权限分配
  const handleAssignPerm = async (role: Role) => {
    if (role.key === 'admin') {
      message.info('管理员角色拥有所有权限，无需分配')
      return
    }
    setPermModal({ open: true, role })
    setPermLoading(true)
    try {
      const [tree, keys] = await Promise.all([
        systemApi.getMenuTree(),
        systemApi.getRoleMenus(role.key),
      ])
      setMenuTree(tree as Menu[])
      setCheckedKeys(keys as number[])
    } finally {
      setPermLoading(false)
    }
  }

  const handleSavePerm = async () => {
    if (!permModal.role) return
    await systemApi.assignRoleMenus(permModal.role.key, checkedKeys)
    message.success('权限分配成功')
    setPermModal({ open: false })
  }

  // 转换菜单树为 Tree 组件格式
  const convertMenuTree = (menus: Menu[]): any[] => {
    return menus.map((menu) => ({
      key: menu.id,
      title: menu.title,
      children: menu.children ? convertMenuTree(menu.children) : undefined,
    }))
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '角色标识', dataIndex: 'key', width: 120 },
    { title: '角色名称', dataIndex: 'name', width: 120 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: number) =>
        status === 1 ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>,
    },
    {
      title: '操作',
      width: 200,
      render: (_: any, record: Role) => (
        <Space size="small">
          <AuthButton
            permission="system:role:update"
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleAssignPerm(record)}
          >
            权限
          </AuthButton>
          <AuthButton
            permission="system:role:update"
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </AuthButton>
          {record.key !== 'admin' && (
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
              <AuthButton permission="system:role:delete" type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </AuthButton>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="角色管理"
      extra={
        <AuthButton permission="system:role:create" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增角色
        </AuthButton>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={roles}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: loadRoles,
        }}
      />

      {/* 角色编辑弹窗 */}
      <Modal
        title={roleModal.data ? '编辑角色' : '新增角色'}
        open={roleModal.open}
        onOk={handleSave}
        onCancel={() => setRoleModal({ open: false })}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="key" label="角色标识" rules={[{ required: true }]}>
            <Input disabled={!!roleModal.data} placeholder="如：sales, designer" />
          </Form.Item>
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '禁用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限分配弹窗 */}
      <Modal
        title={`分配权限 - ${permModal.role?.name}`}
        open={permModal.open}
        onOk={handleSavePerm}
        onCancel={() => setPermModal({ open: false })}
        width={500}
      >
        <Tree
          checkable
          loading={permLoading}
          treeData={convertMenuTree(menuTree)}
          checkedKeys={checkedKeys}
          onCheck={(keys) => setCheckedKeys(keys as number[])}
          defaultExpandAll
        />
      </Modal>
    </Card>
  )
}
