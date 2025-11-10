<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getUsername, logout, isAuthenticated } from './utils/auth.js'

const router = useRouter()

// 更新时间
const currentTime = ref('')
const username = ref(getUsername())

function updateTime() {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

// 定时更新时间
let timer
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 计算属性：是否已登录
const loggedIn = computed(() => isAuthenticated())

// 处理登出
function handleLogout() {
  logout()
  username.value = null
  router.push('/login')
}

// 处理登录
function handleLogin() {
  router.push('/login')
}

// 处理注册
function handleRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <span class="title-icon">📊</span>
          系统监控平台
        </h1>
        <div class="header-info">
          <span class="time-info">{{ currentTime }}</span>
          <div v-if="loggedIn" class="user-info">
            <span class="user-name">{{ username }}</span>
            <button @click="handleLogout" class="logout-button">登出</button>
          </div>
          <div v-else class="auth-buttons">
            <button @click="handleLogin" class="login-button">登录</button>
            <button @click="handleRegister" class="register-button">注册</button>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.title-icon {
  font-size: 28px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-info {
  font-size: 14px;
  opacity: 0.9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  opacity: 0.9;
}

.logout-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-button, .register-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.login-button:hover, .register-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.register-button {
  background: rgba(255, 255, 255, 0.1);
}

.app-main {
  flex: 1;
  padding: 24px;
  overflow: auto;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .app-main {
    padding: 16px;
  }
  
  .app-title {
    font-size: 20px;
  }
}
</style>
