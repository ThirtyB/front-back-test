<template>
  <div class="dashboard">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">
        <span class="title-icon">🖥️</span>
        活跃机器监控
      </h1>
      <div class="header-actions">
        <div class="machine-count">
          <span class="count-badge">{{ machines.length }}</span>
          <span>台活跃机器</span>
        </div>
        <button @click="fetchActiveMachines" :disabled="loading" class="refresh-btn">
          <span class="refresh-icon" :class="{ spinning: loading }">🔄</span>
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && machines.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载机器数据...</p>
    </div>

    <!-- 活跃机器列表 -->
    <div v-else-if="machines.length > 0" class="dashboard-content">
      <!-- 机器卡片网格 -->
      <div class="machines-grid">
        <div 
          v-for="machine in machines" 
          :key="machine.ip" 
          class="machine-card"
          @click="goToMachineDetail(machine.ip)"
        >
          <!-- 机器头部 -->
          <div class="machine-header">
            <div class="machine-info">
              <div class="machine-ip">{{ machine.ip }}</div>
              <div class="machine-status">
                <span class="status-dot"></span>
                <span class="status-text">在线</span>
              </div>
            </div>
            <div class="last-updated">
              {{ formatTime(machine.last_updated) }}
            </div>
          </div>

          <!-- 资源指标 -->
          <div class="metrics-grid">
            <!-- CPU 使用率 -->
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-icon">💻</span>
                <span class="metric-label">CPU</span>
              </div>
              <div class="metric-value">{{ formatPercent(machine.cpu_usage_percent) }}</div>
              <div class="metric-bar">
                <div 
                  class="metric-progress" 
                  :class="getUsageClass(machine.cpu_usage_percent)"
                  :style="{ width: machine.cpu_usage_percent + '%' }"
                ></div>
              </div>
            </div>

            <!-- 内存使用率 -->
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-icon">🧠</span>
                <span class="metric-label">内存</span>
              </div>
              <div class="metric-value">{{ formatPercent(machine.memory_usage_percent) }}</div>
              <div class="metric-bar">
                <div 
                  class="metric-progress" 
                  :class="getUsageClass(machine.memory_usage_percent)"
                  :style="{ width: machine.memory_usage_percent + '%' }"
                ></div>
              </div>
            </div>

            <!-- 磁盘使用率 -->
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-icon">💾</span>
                <span class="metric-label">磁盘</span>
              </div>
              <div class="metric-value">{{ formatPercent(machine.disk_usage_percent) }}</div>
              <div class="metric-bar">
                <div 
                  class="metric-progress" 
                  :class="getUsageClass(machine.disk_usage_percent)"
                  :style="{ width: machine.disk_usage_percent + '%' }"
                ></div>
              </div>
            </div>

            <!-- 网络流量 -->
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-icon">🌐</span>
                <span class="metric-label">网络</span>
              </div>
              <div class="metric-value">
                <div class="network-stats">
                  <span class="network-direction">↓ {{ formatKbps(machine.network_rx_kbps) }}</span>
                  <span class="network-direction">↑ {{ formatKbps(machine.network_tx_kbps) }}</span>
                </div>
              </div>
              <div class="metric-bar network-bar">
                <div class="network-indicator">
                  <span class="network-rx">接收</span>
                  <span class="network-tx">发送</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 时间戳 -->
          <div class="timestamp">
            数据时间: {{ formatTimestamp(machine.timestamp) }}
          </div>
        </div>
      </div>

      <!-- 资源使用率图表 -->
      <div class="charts-section">
        <h2 class="charts-title">资源使用率统计</h2>
        <div class="charts-grid">
          <!-- CPU使用率条形图 -->
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-icon">💻</span>
              <span class="chart-label">CPU使用率</span>
            </div>
            <VChart :option="cpuChartOption" class="chart-container" />
          </div>

          <!-- 内存使用率条形图 -->
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-icon">🧠</span>
              <span class="chart-label">内存使用率</span>
            </div>
            <VChart :option="memoryChartOption" class="chart-container" />
          </div>

          <!-- 磁盘使用率条形图 -->
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-icon">💾</span>
              <span class="chart-label">磁盘使用率</span>
            </div>
            <VChart :option="diskChartOption" class="chart-container" />
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="no-data-container">
      <div class="no-data-icon">📭</div>
      <p>暂无活跃机器数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册ECharts组件
use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const router = useRouter()

const machines = ref([])
const loading = ref(false)
const error = ref(null)

// 图表选项
const cpuChartOption = ref({})
const memoryChartOption = ref({})
const diskChartOption = ref({})

// API基础配置
const API_CONFIG = {
  baseURL: '/api', // 使用Vite代理路径
  timeout: 10000, // 10秒超时
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json'
  }
}

// 统一的API请求函数
async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.baseURL}${endpoint}`
  const requestOptions = {
    method: 'GET',
    headers: { ...API_CONFIG.headers, ...options.headers },
    ...options
  }

  // 记录请求信息
  console.group('🌐 API Request')
  console.log('📤 请求地址:', url)
  console.log('📤 请求方法:', requestOptions.method)
  console.log('📤 请求头:', requestOptions.headers)
  if (requestOptions.body) {
    console.log('📤 请求数据:', requestOptions.body)
  }
  console.groupEnd()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)
    
    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    // 记录响应信息
    console.group('📥 API Response')
    console.log('📥 响应状态:', response.status, response.statusText)
    console.log('📥 响应头:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('📥 响应数据:', responseText)
    console.groupEnd()

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return JSON.parse(responseText)
  } catch (error) {
    console.group('❌ API Error')
    console.error('❌ 错误类型:', error.name)
    console.error('❌ 错误信息:', error.message)
    console.error('❌ 错误堆栈:', error.stack)
    console.groupEnd()
    
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接或服务器状态')
    }
    throw error
  }
}

// 获取活跃机器数据
async function fetchActiveMachines() {
  loading.value = true
  error.value = null
  try {
    console.group('🖥️ 获取活跃机器数据')
    
    const result = await apiRequest('/monitor-metrics/active-machines?time_window_hours=1')
    
    if (result.code === 200) {
      console.log('✅ 获取数据成功，机器数量:', result.data.length)
      machines.value = result.data
      // 数据获取成功后立即更新图表
      updateCharts()
    } else {
      console.error('❌ API返回错误:', result.message)
      throw new Error(result.message || '获取数据失败')
    }
    
    console.groupEnd()
  } catch (e) {
    console.error('❌ 获取活跃机器数据失败:', e)
    error.value = e.message
    // 出错时也更新图表（显示空状态）
    updateCharts()
  } finally {
    loading.value = false
  }
}

// 格式化百分比
function formatPercent(value) {
  if (value === undefined || value === null) return '-'
  return `${value.toFixed(2)}%`
}

// 格式化网络速率
function formatKbps(value) {
  if (value === undefined || value === null) return '-'
  return `${value.toFixed(2)} KB/s`
}

// 格式化时间
function formatTime(datetime) {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleString('zh-CN')
}

// 格式化时间戳
function formatTimestamp(timestamp) {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

// 获取使用率颜色类
function getUsageClass(usage) {
  if (usage > 80) return 'high-usage'
  if (usage > 60) return 'medium-usage'
  return 'low-usage'
}

// 更新图表数据
function updateCharts() {
  console.log('📊 开始更新图表数据，机器数量:', machines.value.length)
  
  if (machines.value.length === 0) {
    console.log('📊 无数据，显示空图表')
    // 无数据时的默认图表
    const emptyOption = {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 14
        }
      },
      xAxis: { show: false },
      yAxis: { show: false },
      series: []
    }
    cpuChartOption.value = emptyOption
    memoryChartOption.value = emptyOption
    diskChartOption.value = emptyOption
    return
  }

  // 准备图表数据
  const ips = machines.value.map(m => m.ip)
  console.log('📊 机器IP列表:', ips)
  
  // 检查数据字段，确保字段名称正确
  const firstMachine = machines.value[0]
  console.log('📊 第一台机器数据:', firstMachine)
  
  const cpuData = machines.value.map(m => {
    const value = m.cpu_usage_percent || m.cpu_usage || 0
    console.log(`📊 CPU数据 - IP: ${m.ip}, 值: ${value}`)
    return value
  })
  
  const memoryData = machines.value.map(m => {
    const value = m.memory_usage_percent || m.memory_usage || 0
    console.log(`📊 内存数据 - IP: ${m.ip}, 值: ${value}`)
    return value
  })
  
  const diskData = machines.value.map(m => {
    const value = m.disk_usage_percent || m.disk_usage || 0
    console.log(`📊 磁盘数据 - IP: ${m.ip}, 值: ${value}`)
    return value
  })

  console.log('📊 数据准备完成:', { cpuData, memoryData, diskData })

  // 基础图表配置 - 修复水平条形图配置
  const baseOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const data = params[0]
        return `${data.name}<br/>${data.seriesName}: ${data.value}%`
      }
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      min: 0,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    yAxis: {
      type: 'category',
      data: ips,
      axisLabel: {
        fontSize: 12,
        interval: 0
      }
    }
  }

  // CPU图表选项
  cpuChartOption.value = {
    ...baseOption,
    series: [{
      name: 'CPU使用率',
      type: 'bar',
      data: cpuData,
      itemStyle: {
        color: (params) => {
          const value = params.value
          if (value > 75) return '#f5222d'
          if (value > 40) return '#faad14'
          return '#52c41a'
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%'
      }
    }]
  }

  // 内存图表选项
  memoryChartOption.value = {
    ...baseOption,
    series: [{
      name: '内存使用率',
      type: 'bar',
      data: memoryData,
      itemStyle: {
        color: (params) => {
          const value = params.value
          if (value > 75) return '#f5222d'
          if (value > 40) return '#faad14'
          return '#52c41a'
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%'
      }
    }]
  }

  // 磁盘图表选项
  diskChartOption.value = {
    ...baseOption,
    series: [{
      name: '磁盘使用率',
      type: 'bar',
      data: diskData,
      itemStyle: {
        color: (params) => {
          const value = params.value
          if (value > 75) return '#f5222d'
          if (value > 40) return '#faad14'
          return '#52c41a'
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%'
      }
    }]
  }
  
  console.log('📊 图表更新完成')
}

// 跳转到机器详情页
function goToMachineDetail(ip) {
  console.log('🖱️ 点击机器卡片，跳转到详情页:', ip)
  router.push(`/machine/${ip}`)
}

// 监听机器数据变化，自动更新图表
watch(machines, () => {
  updateCharts()
}, { deep: true })

onMounted(() => {
  fetchActiveMachines()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  padding: 0;
}

/* 页面头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 16px 0;
  border-bottom: 1px solid #e8e8e8;
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.title-icon {
  font-size: 28px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.machine-count {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f0f2f5;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
}

.count-badge {
  background: #42b883;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #35a06f;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 16px;
  transition: transform 0.3s;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  color: #cf1322;
}

.error-icon {
  font-size: 18px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

/* 主内容布局 */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 机器网格布局 */
.machines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

/* 图表区域 */
.charts-section {
  margin-top: 24px;
}

.charts-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

/* 图表卡片 */
.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-icon {
  font-size: 20px;
}

.chart-label {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.chart-container {
  width: 100%;
  height: 300px;
}

/* 机器卡片 */
.machine-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
  cursor: pointer;
}

.machine-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #40a9ff;
}

.machine-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 机器头部 */
.machine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.machine-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.machine-ip {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.machine-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #52c41a;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #52c41a;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.last-updated {
  font-size: 12px;
  color: #999;
}

/* 指标网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

/* 指标项 */
.metric-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-icon {
  font-size: 16px;
}

.metric-label {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.network-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.network-direction {
  font-size: 12px;
  color: #666;
}

/* 进度条 */
.metric-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.metric-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.low-usage {
  background: linear-gradient(90deg, #52c41a, #73d13d);
}

.medium-usage {
  background: linear-gradient(90deg, #faad14, #ffc53d);
}

.high-usage {
  background: linear-gradient(90deg, #f5222d, #ff4d4f);
}

.network-bar {
  background: transparent;
  height: auto;
}

.network-indicator {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
}

/* 时间戳 */
.timestamp {
  font-size: 12px;
  color: #999;
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 无数据状态 */
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .machines-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .machines-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .machine-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .dashboard-title {
    font-size: 20px;
  }
}
</style>