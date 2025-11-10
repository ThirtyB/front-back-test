import { config } from '../config/index.js'
import { withAuthHeaders } from './auth.js'

// API基础配置
const API_CONFIG = {
  baseURL: config.apiPrefix, // 使用配置文件中的API前缀
  fullBaseURL: config.apiBaseUrl, // 完整的后端地址
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
  const fullUrl = `${API_CONFIG.fullBaseURL}${endpoint}`
  
  // 为需要认证的请求添加认证头（排除认证相关的端点）
  const requiresAuth = !endpoint.startsWith('/auth/')
  const authHeaders = requiresAuth ? withAuthHeaders() : {}
  
  const requestOptions = {
    method: 'GET',
    headers: { ...API_CONFIG.headers, ...authHeaders, ...options.headers },
    ...options
  }

  // 记录后端访问信息
  console.log('🌐 访问后端:', {
    proxy: url,
    backend: fullUrl,
    host: new URL(API_CONFIG.fullBaseURL).host,
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
      host: new URL(API_CONFIG.fullBaseURL).host,
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
      host: new URL(API_CONFIG.fullBaseURL).host,
      url: url
    })
    
    if (error.name === 'AbortError') {
      throw new Error(`请求超时，请检查网络连接或服务器状态 (后端主机: ${new URL(API_CONFIG.fullBaseURL).host})`)
    }
    throw error
  }
}

/**
 * 获取统计信息
 * @returns {Promise} 统计信息数据
 */
export async function getStatistics() {
  return await apiRequest(config.endpoints.statistics)
}

/**
 * 获取最新监控数据
 * @returns {Promise} 最新监控数据
 */
export async function getLatestMetrics() {
  return await apiRequest(config.endpoints.latest)
}

/**
 * 获取指定机器的详情数据
 * @param {string} ip - 机器IP地址
 * @returns {Promise} 机器详情数据
 */
export async function getMachineDetail(ip) {
  return await apiRequest(`${config.endpoints.latest}?ip=${ip}`)
}

/**
 * 获取指定机器的历史数据（最近10条）
 * @param {string} ip - 机器IP地址
 * @returns {Promise} 机器历史数据
 */
export async function getMachineHistory(ip) {
  return await apiRequest(`/monitor-metrics/ip/${ip}/latest-ten`)
}