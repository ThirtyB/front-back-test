<template>
  <div class="machine-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <div class="header-left">
        <button @click="goBack" class="back-btn">
          <span class="back-icon">←</span>
          返回
        </button>
        <h1 class="detail-title">
          <span class="title-icon">🖥️</span>
          机器详情 - {{ machine.ip }}
        </h1>
      </div>
      <div class="header-right">
        <div class="status-badge">
          <span class="status-dot"></span>
          <span>在线</span>
        </div>
        <button @click="fetchMachineDetail" :disabled="loading" class="refresh-btn">
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
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载机器详情...</p>
    </div>

    <!-- 机器详情内容 -->
    <div v-else-if="machine.ip" class="detail-content">
      <!-- 基本信息卡片 -->
      <div class="info-cards">
        <div class="info-card">
          <div class="card-header">
            <span class="card-icon">💻</span>
            <span class="card-title">CPU信息</span>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">用户使用率:</span>
              <span class="info-value">{{ formatPercent(machine.cpu_usr) }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">系统使用率:</span>
              <span class="info-value">{{ formatPercent(machine.cpu_sys) }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">I/O等待:</span>
              <span class="info-value">{{ formatPercent(machine.cpu_iow) }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">总使用率:</span>
              <span class="info-value total-usage">{{ formatPercent(machine.cpu_usr + machine.cpu_sys + machine.cpu_iow) }}%</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <div class="card-header">
            <span class="card-icon">🧠</span>
            <span class="card-title">内存信息</span>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">总内存:</span>
              <span class="info-value">{{ formatBytes(machine.mem_total) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">空闲内存:</span>
              <span class="info-value">{{ formatBytes(machine.mem_free) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">缓存:</span>
              <span class="info-value">{{ formatBytes(machine.mem_cache) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">使用率:</span>
              <span class="info-value total-usage">{{ formatPercent((machine.mem_total - machine.mem_free) / machine.mem_total * 100) }}%</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <div class="card-header">
            <span class="card-icon">🔄</span>
            <span class="card-title">Swap信息</span>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">总Swap:</span>
              <span class="info-value">{{ formatBytes(machine.swap_total) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">空闲Swap:</span>
              <span class="info-value">{{ formatBytes(machine.swap_free) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">已使用Swap:</span>
              <span class="info-value">{{ formatBytes((machine.swap_total || 0) - (machine.swap_free || 0)) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">使用率:</span>
              <span class="info-value total-usage">{{ formatPercent(((machine.swap_total || 0) - (machine.swap_free || 0)) / (machine.swap_total || 1) * 100) }}%</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <div class="card-header">
            <span class="card-icon">💾</span>
            <span class="card-title">磁盘信息</span>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">磁盘名称:</span>
              <span class="info-value">{{ machine.disk_name || '/' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">总空间:</span>
              <span class="info-value">{{ formatBytes(machine.disk_total) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">已使用:</span>
              <span class="info-value">{{ formatBytes(machine.disk_used) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">使用率:</span>
              <span class="info-value total-usage">{{ formatPercent(machine.disk_used_percent) }}%</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <div class="card-header">
            <span class="card-icon">🌐</span>
            <span class="card-title">网络信息</span>
          </div>
          <div class="card-content">
            <div class="info-item">
              <span class="info-label">接收流量:</span>
              <span class="info-value">{{ formatKbps(machine.net_rx_kbps) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">发送流量:</span>
              <span class="info-value">{{ formatKbps(machine.net_tx_kbps) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">接收字节:</span>
              <span class="info-value">{{ formatBytes(machine.net_rx_kbytes * 1024) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">发送字节:</span>
              <span class="info-value">{{ formatBytes(machine.net_tx_kbytes * 1024) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <h2 class="charts-title">详细监控图表</h2>
        <div class="charts-grid">
          <!-- CPU使用率图表 -->
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-icon">💻</span>
              <span class="chart-label">CPU使用率分布</span>
            </div>
            <VChart :option="cpuChartOption" class="chart-container" />
          </div>

          <!-- 内存使用率图表 -->
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-icon">🧠</span>
              <span class="chart-label">内存使用分布</span>
            </div>
            <VChart :option="memoryChartOption" class="chart-container" />
          </div>

          <!-- 磁盘使用率图表 -->
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-icon">💾</span>
              <span class="chart-label">磁盘使用率</span>
            </div>
            <VChart :option="diskChartOption" class="chart-container" />
          </div>

          <!-- 网络流量图表 -->
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-icon">🌐</span>
              <span class="chart-label">网络流量</span>
            </div>
            <VChart :option="networkChartOption" class="chart-container" />
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="system-info">
        <div class="system-card">
          <div class="card-header">
            <span class="card-icon">⚙️</span>
            <span class="card-title">系统信息</span>
          </div>
          <div class="card-content">
            <div class="system-grid">
              <div class="system-item">
                <span class="system-label">版本:</span>
                <span class="system-value">{{ machine.version || '未知' }}</span>
              </div>
              <div class="system-item">
                <span class="system-label">最后更新:</span>
                <span class="system-value">{{ formatTime(machine.inserted_at) }}</span>
              </div>
              <div class="system-item">
                <span class="system-label">时间戳:</span>
                <span class="system-value">{{ formatTimestamp(machine.ts) }}</span>
              </div>
              <div class="system-item">
                <span class="system-label">系统中断:</span>
                <span class="system-value">{{ machine.system_in || 0 }}</span>
              </div>
              <div class="system-item">
                <span class="system-label">上下文切换:</span>
                <span class="system-value">{{ machine.system_cs || 0 }}</span>
              </div>
              <div class="system-item">
                <span class="system-label">磁盘IOPS:</span>
                <span class="system-value">{{ machine.disk_iops || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart, GaugeChart } from 'echarts/charts'
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
  PieChart,
  LineChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const route = useRoute()
const router = useRouter()

const machine = ref({})
const loading = ref(false)
const error = ref(null)

// 图表选项
const cpuChartOption = ref({})
const memoryChartOption = ref({})
const diskChartOption = ref({})
const networkChartOption = ref({})

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

// 获取机器详情
async function fetchMachineDetail() {
  const ip = route.params.ip
  if (!ip) {
    error.value = '未指定机器IP'
    return
  }

  loading.value = true
  error.value = null
  try {
    console.group('🖥️ 获取机器详情')
    
    const result = await apiRequest(`/monitor-metrics/ip/${ip}/complete`)
    
    if (result.code === 200) {
      console.log('✅ 获取详情成功')
      machine.value = result.data
      updateCharts()
    } else {
      console.error('❌ API返回错误:', result.message)
      throw new Error(result.message || '获取详情失败')
    }
    
    console.groupEnd()
  } catch (e) {
    console.error('❌ 获取机器详情失败:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// 更新图表数据
function updateCharts() {
  console.log('📊 开始更新详情页图表')
  
  if (!machine.value.ip) {
    console.log('📊 无机器数据，显示空图表')
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
    networkChartOption.value = emptyOption
    return
  }

  // CPU使用率饼图
  cpuChartOption.value = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: 'CPU使用率',
      type: 'pie',
      radius: '50%',
      data: [
        { value: machine.value.cpu_usr || 0, name: '用户使用率' },
        { value: machine.value.cpu_sys || 0, name: '系统使用率' },
        { value: machine.value.cpu_iow || 0, name: 'I/O等待' },
        { value: Math.max(0, 100 - (machine.value.cpu_usr + machine.value.cpu_sys + machine.value.cpu_iow)), name: '空闲' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  // 内存使用率饼图（包含Swap）
  const memUsed = machine.value.mem_total - machine.value.mem_free - machine.value.mem_cache - machine.value.mem_buffer
  const swapUsed = (machine.value.swap_total || 0) - (machine.value.swap_free || 0)
  
  memoryChartOption.value = {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const value = params.value
        const name = params.name
        const percent = params.percent
        
        if (name === '已使用内存' || name === '空闲内存' || name === '缓存') {
          return `${params.seriesName}<br/>${name}: ${formatBytes(value)} (${percent}%)`
        } else {
          return `${params.seriesName}<br/>${name}: ${formatBytes(value)} (${percent}%)`
        }
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [{
      name: '内存与Swap使用',
      type: 'pie',
      radius: ['30%', '70%'],
      center: ['60%', '50%'],
      roseType: 'area',
      data: [
        { value: memUsed, name: '已使用内存' },
        { value: machine.value.mem_free || 0, name: '空闲内存' },
        { value: machine.value.mem_cache || 0, name: '缓存' },
        { value: swapUsed, name: '已使用Swap' },
        { value: machine.value.swap_free || 0, name: '空闲Swap' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        formatter: '{b}: {d}%'
      }
    }]
  }

  // 磁盘使用率仪表盘
  diskChartOption.value = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [{
      name: '磁盘使用率',
      type: 'gauge',
      radius: '80%',
      center: ['50%', '60%'],
      progress: {
        show: true,
        width: 18
      },
      axisLine: {
        lineStyle: {
          width: 18
        }
      },
      axisLabel: {
        distance: -60,
        fontSize: 12
      },
      pointer: {
        length: '75%',
        width: 8,
        itemStyle: {
          color: 'auto'
        }
      },
      axisTick: {
        distance: -30,
        splitNumber: 5,
        lineStyle: {
          width: 2,
          color: '#999'
        }
      },
      splitLine: {
        distance: -30,
        length: 14,
        lineStyle: {
          width: 3,
          color: '#999'
        }
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        fontSize: 20,
        offsetCenter: [0, '70%']
      },
      data: [{
        value: machine.value.disk_used_percent || 0,
        name: '使用率'
      }]
    }]
  }

  // 网络流量柱状图
  networkChartOption.value = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['接收流量', '发送流量']
    },
    yAxis: {
      type: 'value',
      name: 'KB/s'
    },
    series: [{
      name: '网络流量',
      type: 'bar',
      data: [
        machine.value.net_rx_kbps || 0,
        machine.value.net_tx_kbps || 0
      ],
      itemStyle: {
        color: function(params) {
          return params.dataIndex === 0 ? '#5470c6' : '#91cc75'
        }
      }
    }]
  }
  
  console.log('📊 详情页图表更新完成')
}

// 格式化函数
function formatPercent(value) {
  if (value === undefined || value === null) return '0.00'
  return value.toFixed(2)
}

function formatBytes(bytes) {
  if (bytes === undefined || bytes === null) return '-' 
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatKbps(value) {
  if (value === undefined || value === null) return '-'
  return `${value.toFixed(2)} KB/s`
}

function formatTime(datetime) {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleString('zh-CN')
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '-'
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

function goBack() {
  router.back()
}

onMounted(() => {
  fetchMachineDetail()
})
</script>

<style scoped>
.machine-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  padding: 0;
}

/* 页面头部 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 16px 0;
  border-bottom: 1px solid #e8e8e8;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f0f2f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #e6f7ff;
  border-color: #40a9ff;
}

.back-icon {
  font-size: 16px;
}

.detail-title {
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

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 20px;
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

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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

/* 详情内容 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 信息卡片网格 */
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.total-usage {
  color: #1890ff;
  font-weight: 700;
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

/* 系统信息 */
.system-info {
  margin-top: 24px;
}

.system-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.system-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.system-label {
  font-size: 14px;
  color: #666;
}

.system-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .system-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-title {
    font-size: 20px;
  }
}
</style>