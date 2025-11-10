<template>
  <div class="register-container">
    <div class="register-card">
      <!-- 注册表单头部 -->
      <div class="register-header">
        <h1 class="register-title">
          <span class="title-icon">👤</span>
          注册新账户
        </h1>
        <p class="register-subtitle">创建您的系统监控平台账户</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>

      <!-- 成功提示 -->
      <div v-if="success" class="success-message">
        <span class="success-icon">✅</span>
        <span>注册成功！正在跳转到登录页面...</span>
      </div>

      <!-- 注册表单 -->
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            required
            :disabled="loading"
          />
          <div class="form-hint">用户名长度应为3-20个字符</div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            required
            :disabled="loading"
          />
          <div class="form-hint">密码长度至少为6个字符</div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">确认密码</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-input"
            placeholder="请再次输入密码"
            required
            :disabled="loading"
          />
        </div>

        <button 
          type="submit" 
          class="register-button"
          :disabled="loading"
          :class="{ loading: loading }"
        >
          <span v-if="loading" class="button-spinner"></span>
          <span v-else>注册</span>
        </button>
      </form>

      <!-- 登录链接 -->
      <div class="login-link">
        <span>已有账户？</span>
        <router-link to="/login" class="link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../utils/auth.js'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const success = ref(false)

const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

// 验证表单
function validateForm() {
  if (!form.value.username || !form.value.password || !form.value.confirmPassword) {
    error.value = '请填写所有必填字段'
    return false
  }

  if (form.value.username.length < 3 || form.value.username.length > 20) {
    error.value = '用户名长度应为3-20个字符'
    return false
  }

  if (form.value.password.length < 6) {
    error.value = '密码长度至少为6个字符'
    return false
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return false
  }

  return true
}

// 处理注册
async function handleRegister() {
  if (!validateForm()) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await register(form.value.username, form.value.password)
    
    if (result.success) {
      success.value = true
      // 注册成功，2秒后跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = result.message || '注册失败'
    }
  } catch (err) {
    error.value = '注册过程中发生错误，请重试'
    console.error('Register error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.title-icon {
  font-size: 28px;
}

.register-subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d00;
  font-size: 14px;
}

.success-message {
  background: #efe;
  border: 1px solid #cfc;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0a0;
  font-size: 14px;
}

.error-icon, .success-icon {
  font-size: 16px;
}

.register-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.register-button {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    padding: 24px;
    margin: 10px;
  }
  
  .register-title {
    font-size: 20px;
  }
}
</style>