/**
 * 统一的 HTTP 请求封装
 * 基于 axios，提供统一的请求/响应处理
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { message } from 'antd'
import { getToken } from '@/utils/auth'

// ============================================
// 响应数据格式定义
// ============================================
interface ApiResponse<T = any> {
  code?: number
  message?: string
  data?: T
}

// ============================================
// 创建 axios 实例
// ============================================
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3009',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================
// 请求拦截器
// ============================================
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token 并添加到请求头
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// ============================================
// 响应拦截器
// ============================================
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>): any => {
    const res = response.data

    // 如果后端返回的是标准格式 { code, message, data }
    // 则检查 code 判断是否成功
    if (res.code !== undefined) {
      // code 为 0 或 200 表示成功
      if (res.code === 0 || res.code === 200) {
        // 返回实际数据
        return res.data !== undefined ? res.data : res
      } else {
        // 业务错误
        const errorMsg = res.message || '请求失败'
        message.error(errorMsg)
        return Promise.reject(new Error(errorMsg))
      }
    }

    // 如果后端直接返回数据（没有包装），则直接返回
    // 支持 { data: [...] } 或直接返回数据
    return res.data !== undefined ? res.data : res
  },
  (error: AxiosError<ApiResponse>) => {
    console.error('响应错误:', error)

    // 处理 HTTP 错误状态码
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          message.error(data?.message || '请求参数错误')
          break
        case 401:
          message.error('未授权，请重新登录')
          // 可以在这里跳转到登录页
          // window.location.href = '/login'
          break
        case 403:
          message.error('拒绝访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器内部错误')
          break
        case 502:
          message.error('网关错误')
          break
        case 503:
          message.error('服务不可用')
          break
        default:
          message.error(data?.message || `请求失败 (${status})`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message.error('网络错误，请检查网络连接')
    } else {
      // 其他错误
      message.error(error.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

// ============================================
// 导出封装好的请求方法
// ============================================
export default request

// 也可以导出常用的方法
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return request.get(url, config)
}

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.post(url, data, config)
}

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.put(url, data, config)
}

export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return request.delete(url, config)
}

export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.patch(url, data, config)
}

