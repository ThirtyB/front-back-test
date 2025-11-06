<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 更新时间
const currentTime = ref('')

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
