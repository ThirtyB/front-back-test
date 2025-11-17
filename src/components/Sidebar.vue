<template>
  <nav class="sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">
        <span class="sidebar-icon">📋</span>
        导航菜单
      </h2>
    </div>
    
    <ul class="sidebar-menu">
      <li 
        v-for="item in menuItems" 
        :key="item.path"
        :class="['menu-item', { active: isActive(item.path) }]"
        @click="navigateTo(item.path)"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <span class="menu-text">{{ item.text }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 导航菜单项
const menuItems = ref([
  {
    path: '/',
    text: '系统总览',
    icon: '📊'
  },
  {
    path: '/dashboard',
    text: '活跃机器监控',
    icon: '🖥️'
  },
  {
    path: '/health-config',
    text: '健康度配置',
    icon: '⚙️'
  }
])

// 检查当前路由是否激活
const isActive = (path) => {
  return route.path === path
}

// 导航到指定路径
const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e8e8e8;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.sidebar-icon {
  font-size: 18px;
}

.sidebar-menu {
  list-style: none;
  padding: 16px 0;
  margin: 0;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  font-size: 14px;
}

.menu-item:hover {
  background: #f5f7fa;
  color: #1890ff;
}

.menu-item.active {
  background: #e6f7ff;
  color: #1890ff;
  border-left: 3px solid #1890ff;
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-text {
  font-weight: 500;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .sidebar-header {
    padding: 16px 12px;
  }
  
  .menu-item {
    padding: 10px 12px;
    margin: 2px 4px;
  }
}
</style>