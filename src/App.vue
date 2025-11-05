<script setup>
import { ref } from 'vue'
import NewWelcome from './components/NewWelcome.vue'
import Dashboard from './components/Dashboard.vue'

const currentView = ref('dashboard') // 'dashboard' 或 'metrics'

function switchView(view) {
  currentView.value = view
}
</script>

<template>
  <div class="app-container">
    <nav class="top-nav">
      <button 
        @click="switchView('dashboard')" 
        :class="{ active: currentView === 'dashboard' }"
        class="nav-tab"
      >
        📊 统计 Dashboard
      </button>
      <button 
        @click="switchView('metrics')" 
        :class="{ active: currentView === 'metrics' }"
        class="nav-tab"
      >
        📈 监控详情
      </button>
    </nav>

    <main>
      <Dashboard v-if="currentView === 'dashboard'" />
      <NewWelcome v-else />
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-nav {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  flex-shrink: 0;
}

.nav-tab {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.nav-tab:hover {
  background: #f5f5f5;
  color: #42b883;
}

.nav-tab.active {
  background: #42b883;
  color: white;
}

main {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
