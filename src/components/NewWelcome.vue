<!--
专业监控详情页面
展示实时监控数据，采用服务器卡片布局，每个服务器有独立的监控面板
-->

<script setup>
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

import { getApiUrl, config } from '@/config'

const API_URL = getApiUrl(config.endpoints.latest)
const metrics = ref([])
const loading = ref(false)
const error = ref(null)

async function fetchMetrics() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    metrics.value = await response.json()
  } catch (e) {
    error.value = e.message
    console.error('Error fetching metrics:', e)
  } finally {
    loading.value = false
  }
}

function formatDate(v) {
  if (!v) return ''
  return v.replace(/T/, ' ').replace(/\.\d+/, '').replace(/[+-]\d{2}:\d{2}$/, '')
}

function formatBytes(bytes) {
  if (bytes === undefined || bytes === null) return '-'
  const kb = bytes / 1024
  const mb = kb / 1024
  const gb = mb / 1024
  if (gb >= 1) return `${gb.toFixed(2)} GB`
  if (mb >= 1) return `${mb.toFixed(2)} MB`
  if (kb >= 1) return `${kb.toFixed(2)} KB`
  return `${bytes} B`
}

function formatPercent(value) {
  if (value === undefined || value === null) return '-'
  return `${value.toFixed(2)}%`
}

// CPU 使用率饼图
function getCpuPieOption(metric) {
  if (!metric) return null
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      bottom: 8,
      left: 'center',
      textStyle: { fontSize: 12 }
    },
    series: [{
      name: 'CPU 使用情况',
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{c}%',
        fontSize: 11
      },
      data: [
        { value: metric.cpu_usr || 0, name: '用户态', itemStyle: { color: '#5470c6' } },
        { value: metric.cpu_sys || 0, name: '系统态', itemStyle: { color: '#91cc75' } },
        { value: metric.cpu_iow || 0, name: 'I/O等待', itemStyle: { color: '#fac858' } }
      ]
    }]
  }
}

// 内存使用率饼图
function getMemoryPieOption(metric) {
  if (!metric) return null
  const used = metric.mem_total - metric.mem_free - metric.mem_buff - metric.mem_cache
  const usedPercent = ((used / metric.mem_total) * 100).toFixed(1)
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const mb = (params.value / 1024).toFixed(2)
        return `${params.name}: ${mb} MB (${params.percent}%)`
      }
    },
    legend: {
      bottom: 8,
      left: 'center',
      textStyle: { fontSize: 12 }
    },
    series: [{
      name: '内存使用情况',
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: (params) => {
          const mb = (params.value / 1024).toFixed(1)
          return `${params.name}\n${mb}MB`
        },
        fontSize: 11
      },
      data: [
        { value: metric.mem_free, name: '空闲', itemStyle: { color: '#91cc75' } },
        { value: metric.mem_buff, name: '缓冲区', itemStyle: { color: '#fac858' } },
        { value: metric.mem_cache, name: '缓存', itemStyle: { color: '#ee6666' } },
        { value: used, name: '已使用', itemStyle: { color: '#5470c6' } }
      ]
    }]
  }
}

// 磁盘使用率仪表盘
function getDiskGaugeOption(metric) {
  if (!metric) return null
  return {
    tooltip: {
      formatter: '{a} <br/>{b}: {c}%'
    },
    series: [{
      name: '磁盘使用率',
      type: 'gauge',
      progress: {
        show: true
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        fontSize: 16,
        fontWeight: 'bold'
      },
      data: [{
        value: metric.disk_used_percent,
        name: '使用率'
      }],
      axisLine: {
        lineStyle: {
          width: 18,
          color: [
            [0.3, '#67e0e3'],
            [0.7, '#37a2da'],
            [1, '#fd666d']
          ]
        }
      }
    }]
  }
}

onMounted(() => {
  fetchMetrics()
  // 根据配置的间隔自动刷新数据
  setInterval(fetchMetrics, config.refreshInterval)
})
</script>

<template>
  <div class="monitor-container">
    <!-- 顶部工具栏 -->
    <div class="monitor-header">
      <h1 class="monitor-title">实时监控数据</h1>
      <div class="header-actions">
        <div class="server-count">服务器数量: {{ metrics.length }}</div>
        <button @click="fetchMetrics" :disabled="loading" class="refresh-btn">
          <span class="refresh-icon">🔄</span>
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      <span>错误: {{ error }}</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && metrics.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载数据...</p>
    </div>

    <!-- 服务器列表 -->
    <div v-else-if="metrics.length > 0" class="servers-grid">
      <div v-for="metric in metrics" :key="metric.id" class="server-card">
        <!-- 服务器头部 -->
        <div class="server-header">
          <div class="server-info">
            <div class="server-ip">{{ metric.ip }}</div>
            <div class="server-meta">
              <span>ID: {{ metric.id }}</span>
              <span class="divider">|</span>
              <span>版本: {{ metric.version }}</span>
            </div>
          </div>
          <div class="server-status">
            <span class="status-dot"></span>
            <span>在线</span>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="server-charts">
          <div class="chart-item">
            <div class="chart-title">CPU 使用情况</div>
            <v-chart :option="getCpuPieOption(metric)" class="chart-small" />
            <div class="chart-stats">
              <div class="stat-row">
                <span>用户态:</span>
                <span class="stat-value">{{ metric.cpu_usr }}%</span>
              </div>
              <div class="stat-row">
                <span>系统态:</span>
                <span class="stat-value">{{ metric.cpu_sys }}%</span>
              </div>
              <div class="stat-row">
                <span>I/O等待:</span>
                <span class="stat-value">{{ metric.cpu_iow }}%</span>
              </div>
            </div>
          </div>

          <div class="chart-item">
            <div class="chart-title">内存使用情况</div>
            <v-chart :option="getMemoryPieOption(metric)" class="chart-small" />
            <div class="chart-stats">
              <div class="stat-row">
                <span>总内存:</span>
                <span class="stat-value">{{ formatBytes(metric.mem_total) }}</span>
              </div>
              <div class="stat-row">
                <span>已使用:</span>
                <span class="stat-value">{{ formatBytes(metric.mem_total - metric.mem_free - metric.mem_buff - metric.mem_cache) }}</span>
              </div>
              <div class="stat-row">
                <span>空闲:</span>
                <span class="stat-value">{{ formatBytes(metric.mem_free) }}</span>
              </div>
            </div>
          </div>

          <div class="chart-item">
            <div class="chart-title">磁盘使用率</div>
            <v-chart :option="getDiskGaugeOption(metric)" class="gauge-small" />
            <div class="chart-stats">
              <div class="stat-row">
                <span>磁盘:</span>
                <span class="stat-value">{{ metric.disk_name }}</span>
              </div>
              <div class="stat-row">
                <span>总容量:</span>
                <span class="stat-value">{{ formatBytes(metric.disk_total) }}</span>
              </div>
              <div class="stat-row">
                <span>已使用:</span>
                <span class="stat-value highlight">{{ formatPercent(metric.disk_used_percent) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细信息区域 -->
        <div class="server-details">
          <div class="detail-section">
            <h4>网络流量</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">接收速率:</span>
                <span class="detail-value">{{ metric.net_rx_kbps.toFixed(2) }} KB/s</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">发送速率:</span>
                <span class="detail-value">{{ metric.net_tx_kbps.toFixed(2) }} KB/s</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">接收总量:</span>
                <span class="detail-value">{{ metric.net_rx_kbytes.toFixed(2) }} KB</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">发送总量:</span>
                <span class="detail-value">{{ metric.net_tx_kbytes.toFixed(2) }} KB</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>系统信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">系统中断:</span>
                <span class="detail-value">{{ metric.system_in }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">上下文切换:</span>
                <span class="detail-value">{{ metric.system_cs }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">时间戳:</span>
                <span class="detail-value">{{ metric.ts }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">更新时间:</span>
                <span class="detail-value">{{ formatDate(metric.inserted_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="no-data-container">
      <div class="no-data-icon">📭</div>
      <p>暂无监控数据</p>
    </div>
  </div>
</template>

<style scoped>
.monitor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  padding: 16px;
  overflow: hidden;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
  flex-shrink: 0;
}

.monitor-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.server-count {
  padding: 8px 16px;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(66, 184, 131, 0.2);
}

.refresh-btn:hover:not(:disabled) {
  background: #35a06f;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 184, 131, 0.3);
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  color: #cf1322;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.error-icon {
  font-size: 18px;
}

.loading-container,
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  flex: 1;
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

.no-data-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 服务器网格布局 */
.servers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  align-content: start;
}

.server-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.server-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 服务器头部 */
.server-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.server-info {
  flex: 1;
}

.server-ip {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.server-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 8px;
}

.divider {
  color: #ddd;
}

.server-status {
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

/* 图表区域 */
.server-charts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.chart-item {
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
  text-align: center;
}

.chart-small {
  height: 180px;
  width: 100%;
  margin-bottom: 12px;
}

.gauge-small {
  height: 160px;
  width: 100%;
  margin-bottom: 12px;
}

.chart-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-weight: 600;
  color: #1a1a1a;
}

.stat-value.highlight {
  color: #42b883;
}

/* 详细信息区域 */
.server-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #999;
}

.detail-value {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .servers-grid {
    grid-template-columns: 1fr;
  }

  .server-charts {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .monitor-container {
    padding: 12px;
  }

  .monitor-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .server-charts {
    grid-template-columns: 1fr;
  }

  .server-details {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .chart-small {
    height: 200px;
  }

  .gauge-small {
    height: 180px;
  }
}
</style>