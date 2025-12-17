/**
 * 定时任务 API
 */

import request from './request'

export interface TaskInfo {
  name: string
  running: boolean
  nextDate: string | null
}

export interface TaskExecution {
  id: number
  taskName: string
  executedAt: string
  duration: number
  success: boolean
  result: string | null
  error: string | null
  triggerType: 'cron' | 'manual'
}

export interface TasksResponse {
  tasks: TaskInfo[]
  executions: Record<string, TaskExecution>
}

/** 获取所有定时任务状态 */
export function getTasks(): Promise<TasksResponse> {
  return request.get('/api/scheduler/tasks')
}

/** 获取任务执行历史 */
export function getTaskHistory(name: string, limit = 20): Promise<{ history: TaskExecution[] }> {
  return request.get(`/api/scheduler/tasks/${name}/history`, { params: { limit } })
}

/** 停止任务 */
export function stopTask(name: string): Promise<{ success: boolean; message: string }> {
  return request.post(`/api/scheduler/tasks/${name}/stop`)
}

/** 启动任务 */
export function startTask(name: string): Promise<{ success: boolean; message: string }> {
  return request.post(`/api/scheduler/tasks/${name}/start`)
}

/** 手动触发日志清理 */
export function triggerLogCleanup(days?: number): Promise<{ message: string; deletedCount: number }> {
  return request.post('/api/scheduler/log-cleanup', { days })
}
