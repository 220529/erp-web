/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param dateString ISO 格式的日期字符串
 * @param format 格式化类型：'datetime' | 'date' | 'time'
 */
export function formatDateTime(
  dateString: string,
  format: 'datetime' | 'date' | 'time' = 'datetime'
): string {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return dateString
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    if (format === 'date') {
      return `${year}-${month}-${day}`
    }

    if (format === 'time') {
      return `${hours}:${minutes}:${seconds}`
    }

    // datetime
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    return dateString
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 格式化数字（千分位分隔）
 * @param num 数字
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化金额
 * @param amount 金额
 * @param precision 精度，默认2位小数
 */
export function formatMoney(amount: number, precision: number = 2): string {
  if (amount === null || amount === undefined) return '¥0.00'
  return `¥${Number(amount).toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

