/**
 * 应用配置文件
 * 从环境变量读取配置，提供默认值
 */

export const config = {
  // API 基础地址
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  
  // API 路径前缀
  apiPrefix: import.meta.env.VITE_API_PREFIX || '/api',
  
  // 数据刷新间隔（毫秒）
  refreshInterval: parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '30000', 10),
  
  // API 端点
  endpoints: {
    statistics: '/monitor-metrics/statistics',
    latest: '/monitor-metrics/latest'
  }
}

/**
 * 获取完整的 API URL
 * @param {string} endpoint - API 端点
 * @returns {string} 完整的 API URL
 */
export function getApiUrl(endpoint) {
  return `${config.apiPrefix}${endpoint}`
}

// 开发环境下的配置日志
if (import.meta.env.DEV) {
  console.log('📋 应用配置:', {
    apiBaseUrl: config.apiBaseUrl,
    apiPrefix: config.apiPrefix,
    refreshInterval: config.refreshInterval
  })
}
