import { ref } from 'vue'
import { apiRequest } from './api.js'

// 认证状态管理 - 只存储token，不存储完整的用户信息
const token = ref(localStorage.getItem('auth_token') || null)
const username = ref(localStorage.getItem('username') || null) // 只存储用户名

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} 注册结果
 */
export async function register(username, password) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    
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
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: inputUsername, password })
    })
    
    if (response.code === 200) {
      // 只保存token和用户名，不保存完整的用户信息
      token.value = response.data.token.access_token
      username.value = inputUsername // 只存储用户名
      
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('username', username.value) // 只存储用户名
      
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
  localStorage.removeItem('auth_token')
  localStorage.removeItem('username')
}

/**
 * 获取当前认证token
 * @returns {string|null} 认证token
 */
export function getToken() {
  return token.value
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