<!--
专业监控统计 Dashboard 页面
采用专业监控系统的布局结构：顶部KPI卡片 + 中间主要图表 + 底部辅助图表
-->

<script setup>
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

import { getApiUrl, config } from '@/config'

const API_URL = getApiUrl(config.endpoints.statistics)
const statistics = ref(null)
const loading = ref(false)
const error = ref(null)

async function fetchStatistics() {
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
    statistics.value = await response.json()
  } catch (e) {
    error.value = e.message
    console.error('Error fetching statistics:', e)
  } finally {
    loading.value = false
  }
}

function formatPercent(value) {
  if (value === undefined || value === null) return '-'
  return `${value.toFixed(2)}%`
}

function formatKbps(value) {
  if (value === undefined || value === null) return '-'
  return `${value.toFixed(2)} KB/s`
}

// 资源使用率对比图（主要图表）
const resourceChartOption = computed(() => {
  if (!statistics.value) return null
  return {
    title: {
      text: '资源使用率统计',
      left: 'left',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b0}<br/>{a0}: {c0}%<br/>{a1}: {c1}%<br/>{a2}: {c2}%'
    },
    legend: {
      data: ['CPU', '内存', '磁盘'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['平均', '最大']
    },
    yAxis: {
      type: 'value',
      name: '使用率 (%)',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'CPU',
        type: 'bar',
        data: [
          statistics.value.avg_cpu_total,
          statistics.value.max_cpu_total
        ],
        itemStyle: { color: '#5470c6' },
        barWidth: '30%'
      },
      {
        name: '内存',
        type: 'bar',
        data: [
          statistics.value.avg_mem_usage_percent,
          statistics.value.max_mem_usage_percent
        ],
        itemStyle: { color: '#91cc75' },
        barWidth: '30%'
      },
      {
        name: '磁盘',
        type: 'bar',
        data: [
          statistics.value.avg_disk_used_percent,
          statistics.value.max_disk_used_percent
        ],
        itemStyle: { color: '#fac858' },
        barWidth: '30%'
      }
    ]
  }
})

// CPU 详细统计图
const cpuChartOption = computed(() => {
  if (!statistics.value) return null
  return {
    title: {
      text: 'CPU 使用率',
      left: 'left',
      textStyle: { fontSize: 14, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['平均', '最大', '最小']
    },
    yAxis: {
      type: 'value',
      name: '使用率 (%)',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      data: [
        statistics.value.avg_cpu_total,
        statistics.value.max_cpu_total,
        statistics.value.min_cpu_total
      ],
      type: 'bar',
      itemStyle: {
        color: (params) => {
          const value = params.value
          if (value > 80) return '#ee6666'
          if (value > 50) return '#fac858'
          return '#91cc75'
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%'
      },
      barWidth: '50%'
    }]
  }
})

// 网络流量统计图
const networkChartOption = computed(() => {
  if (!statistics.value) return null
  return {
    title: {
      text: '网络流量',
      left: 'left',
      textStyle: { fontSize: 14, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b0}<br/>{a0}: {c0} KB/s<br/>{a1}: {c1} KB/s'
    },
    legend: {
      data: ['接收', '发送'],
      bottom: 10
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['平均速率', '最大速率']
    },
    yAxis: {
      type: 'value',
      name: '速率 (KB/s)'
    },
    series: [
      {
        name: '接收',
        type: 'bar',
        data: [
          statistics.value.avg_net_rx_kbps,
          statistics.value.max_net_rx_kbps
        ],
        itemStyle: { color: '#5470c6' },
        barWidth: '40%'
      },
      {
        name: '发送',
        type: 'bar',
        data: [
          statistics.value.avg_net_tx_kbps,
          statistics.value.max_net_tx_kbps
        ],
        itemStyle: { color: '#ee6666' },
        barWidth: '40%'
      }
    ]
  }
})

// 磁盘使用率仪表盘
const diskGaugeOption = computed(() => {
  if (!statistics.value) return null
  return {
    title: {
      text: '磁盘使用率',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 'bold' }
    },
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
        value: statistics.value.max_disk_used_percent,
        name: '最大使用率'
      }],
      axisLine: {
        lineStyle: {
          width: 20,
          color: [
            [0.3, '#67e0e3'],
            [0.7, '#37a2da'],
            [1, '#fd666d']
          ]
        }
      }
    }]
  }
})

onMounted(() => {
  fetchStatistics()
  // 根据配置的间隔自动刷新数据
  setInterval(fetchStatistics, config.refreshInterval)
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 顶部工具栏 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">监控统计 Dashboard</h1>
      <button @click="fetchStatistics" :disabled="loading" class="refresh-btn">
        <span class="refresh-icon">🔄</span>
        {{ loading ? '加载中...' : '刷新' }}
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      <span>错误: {{ error }}</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && !statistics" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载数据...</p>
    </div>

    <!-- 主要内容区域 -->
    <div v-else-if="statistics" class="dashboard-content">
      <!-- 顶部 KPI 卡片区域 -->
      <div class="kpi-section">
        <div class="kpi-card">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <div class="kpi-label">监控记录数</div>
            <div class="kpi-value">{{ statistics.count }}</div>
          </div>
        </div>
        
        <div class="kpi-card">
          <div class="kpi-icon">💻</div>
          <div class="kpi-content">
            <div class="kpi-label">CPU 平均使用率</div>
            <div class="kpi-value">{{ formatPercent(statistics.avg_cpu_total) }}</div>
          </div>
        </div>
        
        <div class="kpi-card">
          <div class="kpi-icon">🧠</div>
          <div class="kpi-content">
            <div class="kpi-label">内存平均使用率</div>
            <div class="kpi-value">{{ formatPercent(statistics.avg_mem_usage_percent) }}</div>
          </div>
        </div>
        
        <div class="kpi-card">
          <div class="kpi-icon">💾</div>
          <div class="kpi-content">
            <div class="kpi-label">磁盘平均使用率</div>
            <div class="kpi-value">{{ formatPercent(statistics.avg_disk_used_percent) }}</div>
          </div>
        </div>
      </div>

      <!-- 中间主要图表区域 -->
      <div class="main-charts-section">
        <div class="chart-card main-chart">
          <v-chart v-if="resourceChartOption" :option="resourceChartOption" class="chart" />
        </div>
      </div>

      <!-- 底部辅助图表区域 -->
      <div class="secondary-charts-section">
        <div class="chart-card secondary-chart">
          <v-chart v-if="cpuChartOption" :option="cpuChartOption" class="chart" />
        </div>
        
        <div class="chart-card secondary-chart">
          <v-chart v-if="networkChartOption" :option="networkChartOption" class="chart" />
        </div>
        
        <div class="chart-card secondary-chart">
          <v-chart v-if="diskGaugeOption" :option="diskGaugeOption" class="gauge-chart" />
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="no-data-container">
      <div class="no-data-icon">📭</div>
      <p>暂无数据</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  padding: 16px;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.dashboard-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
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
  transform: none;
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

.loading-container {
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

.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  flex: 1;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}

/* KPI 卡片区域 */
.kpi-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  flex-shrink: 0;
}

.kpi-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.kpi-icon {
  font-size: 32px;
  line-height: 1;
}

.kpi-content {
  flex: 1;
}

.kpi-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

/* 主要图表区域 */
.main-charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.main-chart {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chart {
  height: 100%;
  width: 100%;
  min-height: 300px;
}

/* 辅助图表区域 */
.secondary-charts-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  flex-shrink: 0;
}

.secondary-chart {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

.gauge-chart {
  height: 100%;
  width: 100%;
  min-height: 260px;
}

.chart-card {
  transition: all 0.3s;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .kpi-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .secondary-charts-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .kpi-section {
    grid-template-columns: 1fr;
  }

  .secondary-charts-section {
    grid-template-columns: 1fr;
  }
}
</style>