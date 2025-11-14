import { config } from '../config/index.js'
import { withAuthHeaders } from './auth.js'

// API基础配置
const API_CONFIG = {
  baseURL: config.apiPrefix, // 使用配置文件中的API前缀（代理路径）
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
}

/**
 * 统一的API请求函数
 * @param {string} endpoint - API端点路径
 * @param {Object} options - 请求选项
 * @returns {Promise} 响应数据
 */
export async function apiRequest(endpoint, options = {}) {
  // 所有API请求都通过Vite代理，使用相对路径
  const url = `${API_CONFIG.baseURL}${endpoint}`
  
  // 为需要认证的请求添加认证头（排除认证相关的端点）
  const requiresAuth = !endpoint.startsWith('/auth/')
  const authHeaders = requiresAuth ? withAuthHeaders() : {}
  
  const requestOptions = {
    method: 'GET',
    headers: { ...API_CONFIG.headers, ...authHeaders, ...options.headers },
    ...options
  }

  // 记录代理访问信息
  console.log('🌐 代理访问:', {
    proxy: url,
    method: requestOptions.method,
    headers: requestOptions.headers,
    body: requestOptions.body,
    credentials: requestOptions.credentials,
    mode: requestOptions.mode
  })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)
    
    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    const responseText = await response.text()
    
    // 解析响应内容，如果是JSON则保持格式
    let responseContent = responseText
    try {
      if (response.headers.get('content-type')?.includes('application/json')) {
        responseContent = JSON.parse(responseText)
      }
    } catch (e) {
      // 如果不是有效的JSON，保持原样
    }
    
    // 记录后端响应信息
    console.log('📥 后端响应:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      length: responseText.length + ' 字符',
      content: responseContent,
      ok: response.ok,
      redirected: response.redirected,
      type: response.type,
      url: response.url
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return JSON.parse(responseText)
  } catch (error) {
    // 记录后端访问错误
    console.error('❌ 后端访问错误:', {
      type: error.name,
      message: error.message,
      url: url
    })
    
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接或服务器状态')
    }
    throw error
  }
}

// ==================== 认证相关 API ====================

/**
 * 用户注册
 * @param {Object} userData - 用户注册数据
 * @returns {Promise} 注册结果
 */
export async function registerUser(userData) {
  return await apiRequest(config.endpoints.auth.register, {
    method: 'POST',
    body: JSON.stringify(userData)
  })
}

/**
 * 用户登录
 * @param {Object} loginData - 登录数据
 * @returns {Promise} 登录结果
 */
export async function loginUser(loginData) {
  return await apiRequest(config.endpoints.auth.login, {
    method: 'POST',
    body: JSON.stringify(loginData)
  })
}

/**
 * 获取当前用户信息
 * @returns {Promise} 用户信息
 */
export async function getCurrentUser() {
  return await apiRequest(config.endpoints.auth.me)
}

/**
 * 更新用户个人信息
 * @param {Object} updateData - 更新数据
 * @returns {Promise} 更新结果
 */
export async function updateUserProfile(updateData) {
  return await apiRequest(config.endpoints.auth.profile, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  })
}

/**
 * Token续期
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise} 新的访问令牌
 */
export async function refreshToken(refreshToken) {
  return await apiRequest(`${config.endpoints.auth.refresh}?refresh_token=${refreshToken}`, {
    method: 'POST'
  })
}

// ==================== 监控指标相关 API ====================

/**
 * 获取最新的监控指标数据
 * @param {number} limit - 返回条数限制，默认5
 * @returns {Promise} 最新监控数据
 */
export async function getLatestMetrics(limit = 5) {
  return await apiRequest(`${config.endpoints.monitor.latest}?limit=${limit}`)
}

/**
 * 根据IP查询监控指标数据
 * @param {string} ip - IP地址
 * @param {number} limit - 返回条数限制，默认10
 * @returns {Promise} 监控数据
 */
export async function getMetricsByIp(ip, limit = 10) {
  const endpoint = config.endpoints.monitor.byIp.replace('{ip}', ip)
  return await apiRequest(`${endpoint}?limit=${limit}`)
}

/**
 * 获取指定IP的最新一条监控指标数据
 * @param {string} ip - IP地址
 * @returns {Promise} 最新监控数据
 */
export async function getLatestMetricByIp(ip) {
  const endpoint = config.endpoints.monitor.latestByIp.replace('{ip}', ip)
  return await apiRequest(endpoint)
}

/**
 * 根据时间范围查询监控指标数据
 * @param {number} startTs - 开始时间戳
 * @param {number} endTs - 结束时间戳
 * @param {string} ip - IP地址（可选）
 * @param {number} limit - 返回条数限制，默认100
 * @returns {Promise} 监控数据
 */
export async function getMetricsByTimeRange(startTs, endTs, ip = null, limit = 100) {
  let url = `${config.endpoints.monitor.timeRange}?start_ts=${startTs}&end_ts=${endTs}&limit=${limit}`
  if (ip) {
    url += `&ip=${ip}`
  }
  return await apiRequest(url)
}

/**
 * 分页查询监控指标数据
 * @param {number} page - 页码，默认1
 * @param {number} pageSize - 每页条数，默认20
 * @param {string} ip - IP地址（可选）
 * @returns {Promise} 分页监控数据
 */
export async function getMetricsPaginated(page = 1, pageSize = 20, ip = null) {
  let url = `${config.endpoints.monitor.paginated}?page=${page}&page_size=${pageSize}`
  if (ip) {
    url += `&ip=${ip}`
  }
  return await apiRequest(url)
}

/**
 * 获取所有监控的IP列表
 * @returns {Promise} IP列表
 */
export async function getAllIps() {
  return await apiRequest(config.endpoints.monitor.ips)
}

/**
 * 获取监控指标的统计信息
 * @param {string} ip - IP地址（可选）
 * @param {number} startTs - 开始时间戳（可选）
 * @param {number} endTs - 结束时间戳（可选）
 * @returns {Promise} 统计信息
 */
export async function getMetricsStatistics(ip = null, startTs = null, endTs = null) {
  let url = config.endpoints.monitor.statistics
  const params = []
  
  if (ip) params.push(`ip=${ip}`)
  if (startTs) params.push(`start_ts=${startTs}`)
  if (endTs) params.push(`end_ts=${endTs}`)
  
  if (params.length > 0) {
    url += `?${params.join('&')}`
  }
  
  return await apiRequest(url)
}

/**
 * 查询CPU使用率超过阈值的监控指标
 * @param {number} cpuThreshold - CPU使用率阈值（%），默认80
 * @param {number} limit - 返回条数限制，默认20
 * @returns {Promise} 高CPU监控数据
 */
export async function getHighCpuMetrics(cpuThreshold = 80, limit = 20) {
  return await apiRequest(`${config.endpoints.monitor.highCpu}?cpu_threshold=${cpuThreshold}&limit=${limit}`)
}

/**
 * 查询内存使用率超过阈值的监控指标
 * @param {number} memThreshold - 内存使用率阈值（%），默认80
 * @param {number} limit - 返回条数限制，默认20
 * @returns {Promise} 高内存监控数据
 */
export async function getHighMemoryMetrics(memThreshold = 80, limit = 20) {
  return await apiRequest(`${config.endpoints.monitor.highMemory}?mem_threshold=${memThreshold}&limit=${limit}`)
}

/**
 * 获取活跃机器的最新监控指标
 * @param {number} timeWindowHours - 时间窗口（小时），默认1
 * @returns {Promise} 活跃机器数据
 */
export async function getActiveMachinesLatestMetrics(timeWindowHours = 1) {
  return await apiRequest(`${config.endpoints.monitor.activeMachines}?time_window_hours=${timeWindowHours}`)
}

/**
 * 根据IP地址获取该IP的最新完整监控信息
 * @param {string} ip - IP地址
 * @returns {Promise} 完整监控信息
 */
export async function getLatestCompleteMetricsByIp(ip) {
  const endpoint = config.endpoints.monitor.completeByIp.replace('{ip}', ip)
  return await apiRequest(endpoint)
}

/**
 * 根据IP地址获取该IP的最近十条完整监控信息
 * @param {string} ip - IP地址
 * @returns {Promise} 最近十条监控信息
 */
export async function getLatestTenCompleteMetricsByIp(ip) {
  const endpoint = config.endpoints.monitor.latestTenByIp.replace('{ip}', ip)
  return await apiRequest(endpoint)
}

// ==================== 用户管理 API（管理员功能） ====================

/**
 * 根据ID获取用户（仅管理员可用）
 * @param {number} userId - 用户ID
 * @returns {Promise} 用户信息
 */
export async function getUserById(userId) {
  const endpoint = config.endpoints.users.getUser.replace('{user_id}', userId)
  return await apiRequest(endpoint)
}

/**
 * 创建用户（仅管理员可用）
 * @param {Object} userData - 用户数据
 * @returns {Promise} 创建结果
 */
export async function createUser(userData) {
  return await apiRequest(config.endpoints.users.createUser, {
    method: 'POST',
    body: JSON.stringify(userData)
  })
}

/**
 * 修改用户信息（仅管理员可用）
 * @param {Object} userData - 用户数据
 * @returns {Promise} 修改结果
 */
export async function changeUser(userData) {
  return await apiRequest(config.endpoints.users.changeUser, {
    method: 'POST',
    body: JSON.stringify(userData)
  })
}

/**
 * 删除用户（仅管理员可用）
 * @param {Object} deleteData - 删除数据
 * @returns {Promise} 删除结果
 */
export async function deleteUser(deleteData) {
  return await apiRequest(config.endpoints.users.deleteUser, {
    method: 'POST',
    body: JSON.stringify(deleteData)
  })
}

/**
 * 获取所有用户列表（仅管理员可用）
 * @returns {Promise} 用户列表
 */
export async function getAllUsers() {
  return await apiRequest(config.endpoints.users.allUsers)
}

// ==================== 缓存管理 API（管理员功能） ====================

/**
 * 获取缓存统计信息（仅管理员可用）
 * @returns {Promise} 缓存统计信息
 */
export async function getCacheStatistics() {
  return await apiRequest(config.endpoints.cache.stats)
}

/**
 * 清除缓存（仅管理员可用）
 * @param {string} pattern - 缓存键模式，默认"*"
 * @returns {Promise} 清除结果
 */
export async function clearCache(pattern = '*') {
  return await apiRequest(`${config.endpoints.cache.clear}?pattern=${pattern}`, {
    method: 'POST'
  })
}