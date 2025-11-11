import { ref } from 'vue'
import { apiRequest, loginUser, registerUser, getCurrentUser, refreshToken } from './api.js'

// 认证状态管理
const token = ref(localStorage.getItem('auth_token') || null)
const username = ref(localStorage.getItem('username') || null)
const refreshTokenValue = ref(localStorage.getItem('refresh_token') || null)

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} 注册结果
 */
export async function register(username, password) {
  try {
    const response = await registerUser({ username, password })
    
    if (response.code === 200) {
      return { success: true, data: response.data }
    } else {
      return { success: false, message: response.message }
    }
  } catch (error) {
    return { 
      success: false, 
      message: error.message || '注册失败，请检查网络连接'
    }
  }
}

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} 登录结果
 */
export async function login(inputUsername, password) {
  try {
    const response = await loginUser({ username: inputUsername, password })
    
    if (response.code === 200) {
      // 保存token和用户信息
      token.value = response.data.token.access_token
      username.value = inputUsername
      refreshTokenValue.value = response.data.token.refresh_token
      
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('username', username.value)
      localStorage.setItem('refresh_token', refreshTokenValue.value)
      
      return { success: true, data: response.data }
    } else {
      return { success: false, message: response.message }
    }
  } catch (error) {
    return { 
      success: false, 
      message: error.message || '登录失败，请检查网络连接'
    }
  }
}

/**
 * 用户登出
 */
export function logout() {
  token.value = null
  username.value = null
  refreshTokenValue.value = null
  localStorage.removeItem('auth_token')
  localStorage.removeItem('username')
  localStorage.removeItem('refresh_token')
}

/**
 * 获取当前认证token
 * @returns {string|null} 认证token
 */
export function getToken() {
  return token.value
}

/**
 * 获取刷新token
 * @returns {string|null} 刷新token
 */
export function getRefreshToken() {
  return refreshTokenValue.value
}

/**
 * 获取当前用户名
 * @returns {string|null} 用户名
 */
export function getUsername() {
  return username.value
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isAuthenticated() {
  return !!token.value
}

/**
 * 为API请求添加认证头
 * @param {Object} headers - 原始请求头
 * @returns {Object} 添加认证头后的请求头
 */
export function withAuthHeaders(headers = {}) {
  const authToken = getToken()
  if (authToken) {
    return {
      ...headers,
      'Authorization': `Bearer ${authToken}`
    }
  }
  return headers
}

/**
 * 刷新访问令牌
 * @returns {Promise} 刷新结果
 */
export async function refreshAccessToken() {
  try {
    const currentRefreshToken = getRefreshToken()
    if (!currentRefreshToken) {
      throw new Error('没有可用的刷新令牌')
    }
    
    const response = await refreshToken(currentRefreshToken)
    
    if (response.code === 200) {
      token.value = response.data.token.access_token
      localStorage.setItem('auth_token', token.value)
      return { success: true, data: response.data }
    } else {
      return { success: false, message: response.message }
    }
  } catch (error) {
    return { 
      success: false, 
      message: error.message || '令牌刷新失败'
    }
  }
}

/**
 * 获取当前用户完整信息
 * @returns {Promise} 用户信息
 */
export async function getCurrentUserInfo() {
  try {
    const response = await getCurrentUser()
    if (response.code === 200) {
      return { success: true, data: response.data }
    } else {
      return { success: false, message: response.message }
    }
  } catch (error) {
    return { 
      success: false, 
      message: error.message || '获取用户信息失败'
    }
  }
}