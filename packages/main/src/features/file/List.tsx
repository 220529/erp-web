import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Upload,
  Breadcrumb,
  Empty,
  Image,
} from 'antd'
import {
  UploadOutlined,
  FolderOutlined,
  FileOutlined,
  DeleteOutlined,
  HomeOutlined,
  FolderAddOutlined,
  EyeOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import * as fileApi from '@/api/file'
import type { FileItem } from '@/api/file'
import './index.module.less'

export default function FileList() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<FileItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [currentFolderId, setCurrentFolderId] = useState<number | undefined>(undefined)
  const [breadcrumb, setBreadcrumb] = useState<{ id?: number; name: string }[]>([{ name: '全部文件' }])
  const [uploading, setUploading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await fileApi.getFileList({ page, pageSize, parentId: currentFolderId })
      setData(result.list || [])
      setTotal(result.total || 0)
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, currentFolderId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 进入文件夹
  const enterFolder = (folder: FileItem) => {
    setCurrentFolderId(folder.id)
    setBreadcrumb([...breadcrumb, { id: folder.id, name: folder.name }])
    setPage(1)
  }

  // 面包屑导航
  const navigateTo = (index: number) => {
    const item = breadcrumb[index]
    setCurrentFolderId(item.id)
    setBreadcrumb(breadcrumb.slice(0, index + 1))
    setPage(1)
  }


  // 删除文件/文件夹
  const handleDelete = async (id: number) => {
    try {
      await fileApi.deleteFile(id)
      message.success('删除成功')
      loadData()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  // 判断是否为图片
  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name)

  // 预览图片
  const handlePreview = (record: FileItem) => {
    if (record.url) {
      setPreviewUrl(record.url)
      setPreviewVisible(true)
    }
  }

  // 复制链接
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      message.success('链接已复制')
    }).catch(() => {
      message.error('复制失败')
    })
  }

  // 防止重复上传
  const uploadingRef = useRef(false)

  // 上传处理
  const handleUpload = async (fileList: File[], isFolder: boolean) => {
    if (fileList.length === 0 || uploadingRef.current) return
    uploadingRef.current = true

    try {
      setUploading(true)
      const paths = isFolder
        ? fileList.map((f: any) => f.webkitRelativePath || f.name)
        : fileList.map((f) => f.name)
      await fileApi.uploadFiles(fileList, paths, currentFolderId)
      message.success('上传成功')
      loadData()
    } catch (error: any) {
      message.error(error.message || '上传失败')
    } finally {
      setUploading(false)
      uploadingRef.current = false
    }
  }

  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: (file, fileList) => {
      // 只在第一个文件时触发上传
      if (file === fileList[0]) {
        handleUpload(fileList as File[], false)
      }
      return false
    },
  }

  const folderUploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    directory: true,
    beforeUpload: (file, fileList) => {
      if (file === fileList[0]) {
        handleUpload(fileList as File[], true)
      }
      return false
    },
  }

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '-'
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024
      i++
    }
    return `${bytes.toFixed(1)} ${units[i]}`
  }

  const columns: ColumnsType<FileItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (name, record) => (
        <Space>
          {record.isFolder ? (
            <FolderOutlined style={{ color: '#faad14', fontSize: 18 }} />
          ) : (
            <FileOutlined style={{ color: '#1890ff', fontSize: 18 }} />
          )}
          {record.isFolder ? (
            <a onClick={() => enterFolder(record)}>{name}</a>
          ) : (
            <span>{name}</span>
          )}
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      width: 120,
      render: (size, record) => (record.isFolder ? '-' : formatSize(size)),
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {!record.isFolder && record.url && (
            <>
              {isImage(record.name) && (
                <Button type="link" icon={<EyeOutlined />} size="small" onClick={() => handlePreview(record)}>
                  预览
                </Button>
              )}
              <Button type="link" icon={<CopyOutlined />} size="small" onClick={() => handleCopyLink(record.url!)}>
                复制
              </Button>
            </>
          )}
          <Popconfirm
            title={`确定删除${record.isFolder ? '文件夹' : '文件'}？`}
            description={record.isFolder ? '文件夹内的所有内容也将被删除' : undefined}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]


  return (
    <Card
      title={
        <Breadcrumb>
          {breadcrumb.map((item, index) => (
            <Breadcrumb.Item key={index}>
              {index === 0 ? (
                <a onClick={() => navigateTo(index)}>
                  <HomeOutlined /> {item.name}
                </a>
              ) : index === breadcrumb.length - 1 ? (
                item.name
              ) : (
                <a onClick={() => navigateTo(index)}>{item.name}</a>
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      }
      extra={
        <Space>
          <Upload {...folderUploadProps}>
            <Button icon={<FolderAddOutlined />} loading={uploading}>
              上传文件夹
            </Button>
          </Upload>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
              上传文件
            </Button>
          </Upload>
        </Space>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
        locale={{ emptyText: <Empty description="暂无文件" /> }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewVisible,
          src: previewUrl,
          onVisibleChange: (visible) => setPreviewVisible(visible),
        }}
      />
    </Card>
  )
}
