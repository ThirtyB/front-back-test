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
    // 认证相关
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      me: '/auth/me',
      profile: '/auth/profile',
      refresh: '/auth/refresh'
    },
    
    // 监控指标相关
    monitor: {
      latest: '/monitor-metrics/latest',
      byIp: '/monitor-metrics/ip/{ip}',
      latestByIp: '/monitor-metrics/ip/{ip}/latest',
      timeRange: '/monitor-metrics/time-range',
      paginated: '/monitor-metrics/paginated',
      ips: '/monitor-metrics/ips',
      statistics: '/monitor-metrics/statistics',
      highCpu: '/monitor-metrics/high-cpu',
      highMemory: '/monitor-metrics/high-memory',
      activeMachines: '/monitor-metrics/active-machines',
      completeByIp: '/monitor-metrics/ip/{ip}/complete',
      latestTenByIp: '/monitor-metrics/ip/{ip}/latest-ten',
      systemOverview: '/monitor-metrics/system-overview'
    },
    
    // 用户管理（管理员功能）
    users: {
      getUser: '/users/{user_id}',
      createUser: '/users/create',
      changeUser: '/users/change',
      deleteUser: '/users/delete',
      allUsers: '/admin/users'
    },
    
    // 缓存管理（管理员功能）
    cache: {
      stats: '/cache/stats',
      clear: '/cache/clear'
    }
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


