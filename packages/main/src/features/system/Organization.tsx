/**
 * 组织架构页面
 * 左侧：公司/部门树
 * 右侧：用户列表
 */

import { useState, useEffect } from 'react'
import {
  Card,
  Tree,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Dropdown,
  TreeSelect,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  BankOutlined,
  MoreOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'
import * as systemApi from '@/api/system'
import type { Company, Department, User, Role } from '@/api/system'
import AuthButton from '@/components/AuthButton'
import styles from './Organization.module.less'

type TreeNodeData = {
  key: string
  title: React.ReactNode
  icon: React.ReactNode
  type: 'company' | 'department'
  data: Company | Department
  children?: TreeNodeData[]
  name: string // 用于显示
}

export default function Organization() {
  // 状态
  const [companies, setCompanies] = useState<Company[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(false)
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])

  // 弹窗状态
  const [companyModal, setCompanyModal] = useState<{ open: boolean; data?: Company }>({ open: false })
  const [deptModal, setDeptModal] = useState<{ open: boolean; data?: Department; companyId?: number }>({ open: false })
  const [userModal, setUserModal] = useState<{ open: boolean; data?: User }>({ open: false })
  const [passwordModal, setPasswordModal] = useState<{ open: boolean; userId?: number }>({ open: false })

  const [companyForm] = Form.useForm()
  const [deptForm] = Form.useForm()
  const [userForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  // 加载数据
  useEffect(() => {
    loadCompanies()
    loadRoles()
  }, [])

  const loadCompanies = async (keepExpanded = false) => {
    setLoading(true)
    try {
      const res: any = await systemApi.getCompanies({ pageSize: 100 })
      const companyList = res.list || []
      setCompanies(companyList)
      // 加载所有部门
      const deptRes: any = await systemApi.getDepartments()
      setDepartments(deptRes || [])
      // 首次加载时展开所有公司，刷新时保持当前展开状态
      if (!keepExpanded) {
        setExpandedKeys(companyList.map((c: Company) => `company-${c.id}`))
      }
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    const res: any = await systemApi.getRolesSimple()
    setRoles(res || [])
  }

  const loadUsers = async (companyId?: number, departmentId?: number, page = 1) => {
    setUserLoading(true)
    try {
      const res: any = await systemApi.getUsers({
        companyId,
        departmentId,
        page,
        pageSize: pagination.pageSize,
      })
      setUsers(res.list || [])
      setPagination((p) => ({ ...p, current: page, total: res.total }))
    } finally {
      setUserLoading(false)
    }
  }

  // 构建树数据
  const buildTreeData = (): TreeNodeData[] => {
    return companies.map((company) => {
      const companyDepts = departments.filter((d) => d.companyId === company.id)
      const buildDeptTree = (parentId?: number | null): TreeNodeData[] => {
        return companyDepts
          .filter((d) => (parentId ? d.parentId === parentId : !d.parentId))
          .map((dept) => ({
            key: `dept-${dept.id}`,
            title: dept.name,
            name: dept.name,
            icon: <ApartmentOutlined style={{ color: '#52c41a' }} />,
            type: 'department' as const,
            data: dept,
            children: buildDeptTree(dept.id),
          }))
      }
      return {
        key: `company-${company.id}`,
        title: company.name,
        name: company.name,
        icon: <BankOutlined style={{ color: '#1890ff' }} />,
        type: 'company' as const,
        data: company,
        children: buildDeptTree(undefined),
      }
    })
  }

  // 选择节点
  const handleSelect = (keys: React.Key[], info: any) => {
    if (keys.length === 0) {
      setSelectedNode(null)
      setUsers([])
      return
    }
    const node = info.node as TreeNodeData
    setSelectedNode(node)
    if (node.type === 'company') {
      loadUsers((node.data as Company).id, undefined)
    } else {
      const dept = node.data as Department
      loadUsers(dept.companyId, dept.id)
    }
  }

  // 公司操作
  const handleAddCompany = () => {
    companyForm.resetFields()
    setCompanyModal({ open: true })
  }

  const handleEditCompany = (company: Company) => {
    companyForm.setFieldsValue(company)
    setCompanyModal({ open: true, data: company })
  }

  const handleSaveCompany = async () => {
    const values = await companyForm.validateFields()
    if (companyModal.data) {
      await systemApi.updateCompany(companyModal.data.id, values)
      message.success('更新成功')
    } else {
      await systemApi.createCompany(values)
      message.success('创建成功')
    }
    setCompanyModal({ open: false })
    loadCompanies(true)
  }

  const handleDeleteCompany = async (id: number) => {
    await systemApi.deleteCompany(id)
    message.success('删除成功')
    loadCompanies(true)
    if (selectedNode?.type === 'company' && (selectedNode.data as Company).id === id) {
      setSelectedNode(null)
      setUsers([])
    }
  }

  // 部门操作
  const handleAddDept = (companyId: number) => {
    deptForm.resetFields()
    deptForm.setFieldsValue({ companyId })
    setDeptModal({ open: true, companyId })
  }

  const handleEditDept = (dept: Department) => {
    deptForm.setFieldsValue(dept)
    setDeptModal({ open: true, data: dept, companyId: dept.companyId })
  }

  const handleSaveDept = async () => {
    const values = await deptForm.validateFields()
    if (deptModal.data) {
      await systemApi.updateDepartment(deptModal.data.id, values)
      message.success('更新成功')
    } else {
      await systemApi.createDepartment(values)
      message.success('创建成功')
    }
    setDeptModal({ open: false })
    loadCompanies(true)
  }

  const handleDeleteDept = async (id: number) => {
    await systemApi.deleteDepartment(id)
    message.success('删除成功')
    loadCompanies(true)
  }

  // 用户操作
  const handleAddUser = () => {
    userForm.resetFields()
    if (selectedNode) {
      if (selectedNode.type === 'company') {
        userForm.setFieldsValue({ companyId: (selectedNode.data as Company).id })
      } else {
        const dept = selectedNode.data as Department
        userForm.setFieldsValue({ companyId: dept.companyId, departmentId: dept.id })
      }
    }
    setUserModal({ open: true })
  }

  const handleEditUser = (user: User) => {
    userForm.setFieldsValue(user)
    setUserModal({ open: true, data: user })
  }

  const handleSaveUser = async () => {
    const values = await userForm.validateFields()
    if (userModal.data) {
      await systemApi.updateUser(userModal.data.id, values)
      message.success('更新成功')
    } else {
      await systemApi.createUser(values)
      message.success('创建成功')
    }
    setUserModal({ open: false })
    loadUsers(
      selectedNode?.type === 'company'
        ? (selectedNode.data as Company).id
        : (selectedNode?.data as Department)?.companyId,
      selectedNode?.type === 'department' ? (selectedNode.data as Department).id : undefined
    )
  }

  const handleDeleteUser = async (id: number) => {
    await systemApi.deleteUser(id)
    message.success('删除成功')
    loadUsers(
      selectedNode?.type === 'company'
        ? (selectedNode.data as Company).id
        : (selectedNode?.data as Department)?.companyId,
      selectedNode?.type === 'department' ? (selectedNode.data as Department).id : undefined
    )
  }

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === 1 ? 0 : 1
    await systemApi.updateUserStatus(user.id, newStatus)
    message.success(newStatus === 1 ? '已启用' : '已禁用')
    loadUsers(
      selectedNode?.type === 'company'
        ? (selectedNode.data as Company).id
        : (selectedNode?.data as Department)?.companyId,
      selectedNode?.type === 'department' ? (selectedNode.data as Department).id : undefined
    )
  }

  const handleResetPassword = (userId: number) => {
    passwordForm.resetFields()
    setPasswordModal({ open: true, userId })
  }

  const handleSavePassword = async () => {
    const values = await passwordForm.validateFields()
    await systemApi.resetUserPassword(passwordModal.userId!, values.password)
    message.success('密码重置成功')
    setPasswordModal({ open: false })
  }

  // 树节点右键菜单
  const getTreeNodeMenu = (node: TreeNodeData) => {
    if (node.type === 'company') {
      return {
        items: [
          { key: 'edit', label: '编辑公司', icon: <EditOutlined /> },
          { key: 'addDept', label: '添加部门', icon: <PlusOutlined /> },
          { key: 'delete', label: '删除公司', icon: <DeleteOutlined />, danger: true },
        ],
        onClick: ({ key }: { key: string }) => {
          if (key === 'edit') handleEditCompany(node.data as Company)
          else if (key === 'addDept') handleAddDept((node.data as Company).id)
          else if (key === 'delete') {
            Modal.confirm({
              title: '确认删除',
              content: '删除公司将同时删除其下所有部门，确定要删除吗？',
              onOk: () => handleDeleteCompany((node.data as Company).id),
            })
          }
        },
      }
    }
    return {
      items: [
        { key: 'edit', label: '编辑部门', icon: <EditOutlined /> },
        { key: 'addChild', label: '添加子部门', icon: <PlusOutlined /> },
        { key: 'delete', label: '删除部门', icon: <DeleteOutlined />, danger: true },
      ],
      onClick: ({ key }: { key: string }) => {
        const dept = node.data as Department
        if (key === 'edit') handleEditDept(dept)
        else if (key === 'addChild') {
          deptForm.resetFields()
          deptForm.setFieldsValue({ companyId: dept.companyId, parentId: dept.id })
          setDeptModal({ open: true, companyId: dept.companyId })
        } else if (key === 'delete') {
          Modal.confirm({
            title: '确认删除',
            content: '确定要删除该部门吗？',
            onOk: () => handleDeleteDept(dept.id),
          })
        }
      },
    }
  }

  // 用户表格列
  const userColumns = [
    { title: '用户名', dataIndex: 'username', width: 100 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '手机号', dataIndex: 'mobile', width: 130 },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      render: (role: string) => {
        const r = roles.find((item) => item.key === role)
        return <Tag color="blue">{r?.name || role}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: number) =>
        status === 1 ? <Tag color="success">正常</Tag> : <Tag color="error">禁用</Tag>,
    },
    {
      title: '操作',
      width: 220,
      render: (_: any, record: User) => (
        <Space size="small">
          <AuthButton permission="system:user:update" type="link" size="small" onClick={() => handleEditUser(record)}>
            编辑
          </AuthButton>
          <AuthButton
            permission="system:user:update"
            type="link"
            size="small"
            onClick={() => handleToggleUserStatus(record)}
          >
            {record.status === 1 ? '禁用' : '启用'}
          </AuthButton>
          <AuthButton
            permission="system:user:update"
            type="link"
            size="small"
            onClick={() => handleResetPassword(record.id)}
          >
            重置密码
          </AuthButton>
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteUser(record.id)}>
            <AuthButton permission="system:user:delete" type="link" size="small" danger>
              删除
            </AuthButton>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 获取当前公司的部门树（用于 TreeSelect）
  const getDeptTreeOptions = (companyId?: number): any[] => {
    if (!companyId) return []
    const companyDepts = departments.filter((d) => d.companyId === companyId)
    const build = (parentId?: number | null): any[] => {
      return companyDepts
        .filter((d) => (parentId ? d.parentId === parentId : !d.parentId))
        .map((d) => ({
          value: d.id,
          title: d.name,
          children: build(d.id),
        }))
    }
    return build(null)
  }

  const treeData = buildTreeData()

  return (
    <div className={styles.container}>
      {/* 左侧：组织树 */}
      <Card
        className={styles.treeCard}
        title={
          <Space>
            <ApartmentOutlined />
            <span>组织架构</span>
          </Space>
        }
        extra={
          <AuthButton
            permission="system:company:create"
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAddCompany}
          >
            添加公司
          </AuthButton>
        }
      >
        {treeData.length === 0 ? (
          <Empty description="暂无公司，请先添加" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Tree
            blockNode
            defaultExpandAll
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            treeData={treeData as DataNode[]}
            selectedKeys={selectedNode ? [selectedNode.key] : []}
            onSelect={handleSelect}
            titleRender={(node: any) => (
              <div className={styles.treeNode}>
                <span className={styles.nodeIcon}>{node.icon}</span>
                <span className={styles.nodeTitle}>{node.name || node.title}</span>
                <Dropdown menu={getTreeNodeMenu(node)} trigger={['click']}>
                  <MoreOutlined className={styles.moreIcon} onClick={(e) => e.stopPropagation()} />
                </Dropdown>
              </div>
            )}
          />
        )}
      </Card>

      {/* 右侧：用户列表 */}
      <Card
        className={styles.userCard}
        title={
          selectedNode ? (
            <Space>
              {selectedNode.type === 'company' ? (
                <BankOutlined style={{ color: '#1890ff' }} />
              ) : (
                <ApartmentOutlined style={{ color: '#52c41a' }} />
              )}
              <span>{selectedNode.name} - 用户列表</span>
            </Space>
          ) : (
            '请选择公司或部门查看用户'
          )
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => loadCompanies()}>
              刷新
            </Button>
            <AuthButton
              permission="system:user:create"
              type="primary"
              icon={<PlusOutlined />}
              disabled={!selectedNode}
              onClick={handleAddUser}
            >
              添加用户
            </AuthButton>
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={userLoading}
          columns={userColumns}
          dataSource={users}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page) =>
              loadUsers(
                selectedNode?.type === 'company'
                  ? (selectedNode.data as Company).id
                  : (selectedNode?.data as Department)?.companyId,
                selectedNode?.type === 'department' ? (selectedNode.data as Department).id : undefined,
                page
              ),
          }}
          locale={{ emptyText: selectedNode ? '暂无用户' : '请先选择左侧的公司或部门' }}
        />
      </Card>

      {/* 公司弹窗 */}
      <Modal
        title={companyModal.data ? '编辑公司' : '添加公司'}
        open={companyModal.open}
        onOk={handleSaveCompany}
        onCancel={() => setCompanyModal({ open: false })}
      >
        <Form form={companyForm} layout="vertical">
          <Form.Item name="name" label="公司名称" rules={[{ required: true, message: '请输入公司名称' }]}>
            <Input placeholder="请输入公司名称" />
          </Form.Item>
          <Form.Item name="contact" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入公司地址" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select
              options={[
                { value: 1, label: '正常' },
                { value: 0, label: '停用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 部门弹窗 */}
      <Modal
        title={deptModal.data ? '编辑部门' : '添加部门'}
        open={deptModal.open}
        onOk={handleSaveDept}
        onCancel={() => setDeptModal({ open: false })}
      >
        <Form form={deptForm} layout="vertical">
          <Form.Item name="companyId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="parentId" label="上级部门">
            <TreeSelect allowClear placeholder="无（顶级部门）" treeData={getDeptTreeOptions(deptModal.companyId)} />
          </Form.Item>
          <Form.Item name="leader" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select
              options={[
                { value: 1, label: '正常' },
                { value: 0, label: '停用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户弹窗 */}
      <Modal
        title={userModal.data ? '编辑用户' : '添加用户'}
        open={userModal.open}
        onOk={handleSaveUser}
        onCancel={() => setUserModal({ open: false })}
        width={500}
      >
        <Form form={userForm} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input disabled={!!userModal.data} placeholder="请输入用户名（登录用）" />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          {!userModal.data && (
            <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="mobile" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色" options={roles.map((r) => ({ value: r.key, label: r.name }))} />
          </Form.Item>
          {/* 新增时显示当前选中的公司/部门（只读），编辑时允许修改 */}
          {!userModal.data && selectedNode ? (
            <>
              <Form.Item label="所属公司">
                <Input
                  disabled
                  value={
                    selectedNode.type === 'company'
                      ? (selectedNode.data as Company).name
                      : companies.find((c) => c.id === (selectedNode.data as Department).companyId)?.name
                  }
                />
              </Form.Item>
              <Form.Item name="companyId" hidden>
                <Input />
              </Form.Item>
              {selectedNode.type === 'department' && (
                <>
                  <Form.Item label="所属部门">
                    <Input disabled value={(selectedNode.data as Department).name} />
                  </Form.Item>
                  <Form.Item name="departmentId" hidden>
                    <Input />
                  </Form.Item>
                </>
              )}
            </>
          ) : (
            <>
              <Form.Item name="companyId" label="所属公司" rules={[{ required: true, message: '请选择公司' }]}>
                <Select placeholder="请选择公司" options={companies.map((c) => ({ value: c.id, label: c.name }))} />
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.companyId !== cur.companyId}>
                {({ getFieldValue }) => (
                  <Form.Item name="departmentId" label="所属部门">
                    <TreeSelect
                      allowClear
                      placeholder="请选择部门"
                      treeData={getDeptTreeOptions(getFieldValue('companyId'))}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* 重置密码弹窗 */}
      <Modal
        title="重置密码"
        open={passwordModal.open}
        onOk={handleSavePassword}
        onCancel={() => setPasswordModal({ open: false })}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item name="password" label="新密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('两次密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
