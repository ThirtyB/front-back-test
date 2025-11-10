<template>
  <div class="machine-history">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <span class="back-icon">←</span> 返回详情
        </button>
        <h1 class="page-title">机器历史监控数据</h1>
        <div class="machine-info">
          <span class="ip-label">IP地址:</span>
          <span class="ip-value">{{ machineIp }}</span>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>监控指标详情</h3>
          <button class="modal-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedMetric" class="metric-details">
            <div class="detail-section time-section">
              <h4>⏰ 时间信息</h4>
              <div class="time-display">
                <span class="time-icon">🕐</span>
                <span class="time-value">{{ formatTimestamp(selectedMetric.ts) }}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>💻 CPU信息</h4>
              <div class="metric-grid">
                <div class="metric-item">
                  <span class="metric-label">总使用率:</span>
                  <span class="metric-value">{{ selectedMetric.cpu_total_usage.toFixed(2) }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">用户使用率:</span>
                  <span class="metric-value">{{ selectedMetric.cpu_usr.toFixed(2) }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">系统使用率:</span>
                  <span class="metric-value">{{ selectedMetric.cpu_sys.toFixed(2) }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">I/O等待:</span>
                  <span class="metric-value">{{ selectedMetric.cpu_iow.toFixed(2) }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">空闲率:</span>
                  <span class="metric-value">{{ selectedMetric.cpu_idle.toFixed(2) }}%</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>🧠 内存信息</h4>
              <div class="metric-grid">
                <div class="metric-item">
                  <span class="metric-label">总内存:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.mem_total) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">已使用:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.mem_used) }} ({{ selectedMetric.mem_usage_percent.toFixed(2) }}%)</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">空闲内存:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.mem_free) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">缓存:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.mem_cache) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">缓冲区:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.mem_buffer) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">实际使用:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.mem_actual_used) }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>💾 磁盘信息</h4>
              <div class="metric-grid">
                <div class="metric-item">
                  <span class="metric-label">磁盘名称:</span>
                  <span class="metric-value">{{ selectedMetric.disk_name }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">总空间:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.disk_total) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">已使用:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.disk_used) }} ({{ selectedMetric.disk_used_percent.toFixed(2) }}%)</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">IOPS:</span>
                  <span class="metric-value">{{ selectedMetric.disk_iops }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">读取速度:</span>
                  <span class="metric-value">{{ selectedMetric.disk_r }} KB/s</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">写入速度:</span>
                  <span class="metric-value">{{ selectedMetric.disk_w }} KB/s</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>🌐 网络信息</h4>
              <div class="metric-grid">
                <div class="metric-item">
                  <span class="metric-label">接收流量:</span>
                  <span class="metric-value">{{ formatNetworkSpeed(selectedMetric.net_rx_kbps) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">发送流量:</span>
                  <span class="metric-value">{{ formatNetworkSpeed(selectedMetric.net_tx_kbps) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">接收字节:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.net_rx_bytes) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">发送字节:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.net_tx_bytes) }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>🔄 系统信息</h4>
              <div class="metric-grid">
                <div class="metric-item">
                  <span class="metric-label">中断数:</span>
                  <span class="metric-value">{{ selectedMetric.system_in }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">上下文切换:</span>
                  <span class="metric-value">{{ selectedMetric.system_cs }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">版本:</span>
                  <span class="metric-value">{{ selectedMetric.version }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>💾 Swap信息</h4>
              <div class="metric-grid">
                <div class="metric-item">
                  <span class="metric-label">总Swap:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.swap_total) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">已使用:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.swap_used) }} ({{ selectedMetric.swap_usage_percent.toFixed(2) }}%)</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">空闲Swap:</span>
                  <span class="metric-value">{{ formatBytes(selectedMetric.swap_free) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Swap输入:</span>
                  <span class="metric-value">{{ selectedMetric.swap_in }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">Swap输出:</span>
                  <span class="metric-value">{{ selectedMetric.swap_out }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载历史数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" @click="fetchHistoryData">重试</button>
    </div>

    <!-- 数据展示 -->
    <div v-else-if="historyData" class="history-content">
      <!-- 数据摘要 -->
      <div class="summary-section">
        <h2 class="section-title">数据摘要</h2>
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-label">总记录数</div>
            <div class="summary-value">{{ historyData.summary.total_records }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">平均CPU使用率</div>
            <div class="summary-value">{{ historyData.summary.avg_cpu_total_usage.toFixed(2) }}%</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">平均内存使用率</div>
            <div class="summary-value">{{ historyData.summary.avg_mem_usage_percent.toFixed(2) }}%</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">平均磁盘使用率</div>
            <div class="summary-value">{{ historyData.summary.avg_disk_used_percent.toFixed(2) }}%</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <h2 class="section-title">监控图表</h2>
        
        <!-- CPU使用率图表 -->
        <div class="chart-container">
          <h3 class="chart-title">CPU使用率趋势</h3>
          <div ref="cpuChart" class="chart" style="height: 300px;"></div>
        </div>

        <!-- 内存使用率图表 -->
        <div class="chart-container">
          <h3 class="chart-title">内存使用率趋势</h3>
          <div ref="memoryChart" class="chart" style="height: 300px;"></div>
        </div>

        <!-- 磁盘使用率图表 -->
        <div class="chart-container">
          <h3 class="chart-title">磁盘使用率趋势</h3>
          <div ref="diskChart" class="chart" style="height: 300px;"></div>
        </div>

        <!-- 网络流量图表 -->
        <div class="chart-container">
          <h3 class="chart-title">网络流量趋势</h3>
          <div ref="networkChart" class="chart" style="height: 300px;"></div>
        </div>
      </div>

      <!-- 详细数据表格 -->
      <div class="table-section">
        <h2 class="section-title">详细数据</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>CPU使用率</th>
                <th>内存使用率</th>
                <th>磁盘使用率</th>
                <th>网络接收</th>
                <th>网络发送</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="metric in historyData.metrics" :key="metric.id">
                <td>{{ formatTimestamp(metric.ts) }}</td>
                <td>{{ metric.cpu_total_usage.toFixed(2) }}%</td>
                <td>{{ metric.mem_usage_percent.toFixed(2) }}%</td>
                <td>{{ metric.disk_used_percent.toFixed(2) }}%</td>
                <td>{{ formatNetworkSpeed(metric.net_rx_kbps) }}</td>
                <td>{{ formatNetworkSpeed(metric.net_tx_kbps) }}</td>
                <td>
                  <button class="detail-button" @click="viewMetricDetail(metric)">查看详情</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="no-data">
      <p>暂无历史数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getMachineHistory } from '../utils/api.js'

const route = useRoute()
const router = useRouter()

// 响应式数据
const machineIp = ref('')
const historyData = ref(null)
const loading = ref(false)
const error = ref(null)
const showDetailModal = ref(false)
const selectedMetric = ref(null)

// 图表引用
const cpuChart = ref(null)
const memoryChart = ref(null)
const diskChart = ref(null)
const networkChart = ref(null)

// 图表实例
let cpuChartInstance = null
let memoryChartInstance = null
let diskChartInstance = null
let networkChartInstance = null

// 获取历史数据
async function fetchHistoryData() {
  const ip = route.params.ip
  if (!ip) {
    error.value = '未指定机器IP'
    return
  }

  machineIp.value = ip
  loading.value = true
  error.value = null

  try {
    const result = await getMachineHistory(ip)
    if (result.code === 200 && result.status === 'success') {
      historyData.value = result.data
      // 数据加载完成后初始化图表
      setTimeout(initCharts, 100)
    } else {
      throw new Error(result.message || '获取历史数据失败')
    }
  } catch (err) {
    error.value = err.message || '获取历史数据失败'
    console.error('获取历史数据错误:', err)
  } finally {
    loading.value = false
  }
}

// 初始化图表
function initCharts() {
  if (!historyData.value || !historyData.value.metrics) return

  // 准备图表数据
  const metrics = historyData.value.metrics
  const timestamps = metrics.map(m => formatTimestamp(m.ts, 'HH:mm:ss'))
  
  // CPU使用率图表
  if (cpuChart.value) {
    cpuChartInstance = echarts.init(cpuChart.value)
    const cpuData = metrics.map(m => m.cpu_total_usage)
    const cpuMax = Math.max(...cpuData)
    const cpuMin = Math.min(...cpuData)
    const yAxisMax = cpuMax > 0 ? Math.ceil(cpuMax * 2) : 1 // 如果最大值很小，设置一个合适的范围
    
    cpuChartInstance.setOption({
      title: { text: '', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: timestamps,
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: '使用率(%)',
        min: 0,
        max: yAxisMax,
        interval: yAxisMax > 10 ? Math.ceil(yAxisMax / 5) : 0.2 // 根据范围调整刻度间隔
      },
      series: [{
        name: 'CPU使用率',
        type: 'line',
        data: cpuData,
        smooth: true,
        lineStyle: { 
          color: '#5470c6',
          width: 3 // 增加线宽
        },
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
          ])
        }
      }]
    })
  }

  // 内存使用率图表
  if (memoryChart.value) {
    memoryChartInstance = echarts.init(memoryChart.value)
    const memoryData = metrics.map(m => m.mem_usage_percent)
    const memoryMax = Math.max(...memoryData)
    const memoryMin = Math.min(...memoryData)
    const yAxisMax = memoryMax > 0 ? Math.ceil(memoryMax * 2) : 1 // 如果最大值很小，设置一个合适的范围
    
    memoryChartInstance.setOption({
      title: { text: '', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: timestamps,
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: '使用率(%)',
        min: 0,
        max: yAxisMax,
        interval: yAxisMax > 10 ? Math.ceil(yAxisMax / 5) : 0.2 // 根据范围调整刻度间隔
      },
      series: [{
        name: '内存使用率',
        type: 'line',
        data: memoryData,
        smooth: true,
        lineStyle: { 
          color: '#91cc75',
          width: 3 // 增加线宽
        },
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(145, 204, 117, 0.3)' },
            { offset: 1, color: 'rgba(145, 204, 117, 0.1)' }
          ])
        }
      }]
    })
  }

  // 磁盘使用率图表
  if (diskChart.value) {
    diskChartInstance = echarts.init(diskChart.value)
    const diskData = metrics.map(m => m.disk_used_percent)
    const diskMax = Math.max(...diskData)
    const diskMin = Math.min(...diskData)
    const yAxisMax = diskMax > 0 ? Math.ceil(diskMax * 2) : 1 // 如果最大值很小，设置一个合适的范围
    
    diskChartInstance.setOption({
      title: { text: '', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: timestamps,
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: '使用率(%)',
        min: 0,
        max: yAxisMax,
        interval: yAxisMax > 10 ? Math.ceil(yAxisMax / 5) : 0.2 // 根据范围调整刻度间隔
      },
      series: [{
        name: '磁盘使用率',
        type: 'line',
        data: diskData,
        smooth: true,
        lineStyle: { 
          color: '#fac858',
          width: 3 // 增加线宽
        },
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(250, 200, 88, 0.3)' },
            { offset: 1, color: 'rgba(250, 200, 88, 0.1)' }
          ])
        }
      }]
    })
  }

  // 网络流量图表
  if (networkChart.value) {
    networkChartInstance = echarts.init(networkChart.value)
    // 将KB/s转换为B/s，避免显示过小的数字
    const netRxData = metrics.map(m => m.net_rx_kbps * 1024) // KB/s -> B/s
    const netTxData = metrics.map(m => m.net_tx_kbps * 1024) // KB/s -> B/s
    const netMax = Math.max(...netRxData, ...netTxData)
    const netMin = Math.min(...netRxData, ...netTxData)
    
    // 更精确的Y轴范围计算
    let yAxisMax, yAxisInterval
    if (netMax <= 1) {
      // 极小的数据范围（小于1 B/s）
      yAxisMax = 2
      yAxisInterval = 0.5
    } else if (netMax <= 10) {
      // 小数据范围（1-10 B/s）
      yAxisMax = 20
      yAxisInterval = 5
    } else if (netMax <= 100) {
      // 中等小数据范围（10-100 B/s）
      yAxisMax = 200
      yAxisInterval = 50
    } else if (netMax <= 1024) {
      // 中等数据范围（100-1024 B/s）
      yAxisMax = 2048
      yAxisInterval = 512
    } else {
      // 大数据范围
      yAxisMax = Math.ceil(netMax * 1.5)
      yAxisInterval = Math.ceil(yAxisMax / 5)
    }
    
    networkChartInstance.setOption({
      title: { text: '', left: 'center' },
      tooltip: { 
        trigger: 'axis',
        formatter: function(params) {
          let result = params[0].axisValue + '<br/>'
          params.forEach(param => {
            const valueBps = param.value
            const formattedValue = formatNetworkSpeedForChart(valueBps)
            result += `${param.marker} ${param.seriesName}: ${formattedValue}<br/>`
          })
          return result
        }
      },
      legend: { data: ['网络接收', '网络发送'], top: '10px' },
      xAxis: {
        type: 'category',
        data: timestamps,
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: '流量',
        min: 0,
        max: yAxisMax,
        interval: yAxisInterval,
        axisLabel: {
          formatter: function(value) {
            return formatNetworkSpeedForChart(value)
          }
        }
      },
      series: [
        {
          name: '网络接收',
          type: 'line',
          data: netRxData,
          smooth: true,
          lineStyle: { 
            color: '#ee6666',
            width: 4 // 进一步增加线宽
          },
          symbol: 'circle',
          symbolSize: 8, // 增加符号大小
          itemStyle: {
            color: '#ee6666'
          }
        },
        {
          name: '网络发送',
          type: 'line',
          data: netTxData,
          smooth: true,
          lineStyle: { 
            color: '#73c0de',
            width: 4 // 进一步增加线宽
          },
          symbol: 'circle',
          symbolSize: 8, // 增加符号大小
          itemStyle: {
            color: '#73c0de'
          }
        }
      ],
      grid: {
        top: '15%',
        right: '5%',
        bottom: '15%',
        left: '10%'
      }
    })
  }
}

// 格式化时间戳
function formatTimestamp(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 格式化字节大小
function formatBytes(bytes) {
  if (bytes === undefined || bytes === null) return '-' 
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化网络速度（用于图表显示）
function formatNetworkSpeedForChart(valueBps) {
  if (valueBps < 1024) {
    return valueBps.toFixed(0) + ' B/s'
  } else if (valueBps < 1024 * 1024) {
    return (valueBps / 1024).toFixed(2) + ' KB/s'
  } else {
    return (valueBps / (1024 * 1024)).toFixed(2) + ' MB/s'
  }
}

// 格式化网络速度（用于详情显示）
function formatNetworkSpeed(kbps) {
  const bps = kbps * 1024 // KB/s -> B/s
  if (bps < 1024) {
    return bps.toFixed(0) + ' B/s'
  } else if (bps < 1024 * 1024) {
    return (bps / 1024).toFixed(2) + ' KB/s'
  } else {
    return (bps / (1024 * 1024)).toFixed(2) + ' MB/s'
  }
}

// 查看指标详情
function viewMetricDetail(metric) {
  selectedMetric.value = metric
  showDetailModal.value = true
}

// 关闭详情弹窗
function closeDetailModal() {
  showDetailModal.value = false
  selectedMetric.value = null
}

// 返回上一页
function goBack() {
  router.back()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchHistoryData()
})

// 组件卸载时销毁图表
onUnmounted(() => {
  if (cpuChartInstance) cpuChartInstance.dispose()
  if (memoryChartInstance) memoryChartInstance.dispose()
  if (diskChartInstance) diskChartInstance.dispose()
  if (networkChartInstance) networkChartInstance.dispose()
})

// 监听窗口大小变化，重新渲染图表
window.addEventListener('resize', () => {
  if (cpuChartInstance) cpuChartInstance.resize()
  if (memoryChartInstance) memoryChartInstance.resize()
  if (diskChartInstance) diskChartInstance.resize()
  if (networkChartInstance) networkChartInstance.resize()
})
</script>

<style scoped>
.machine-history {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.back-button {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.back-button:hover {
  background: #e9e9e9;
}

.page-title {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.machine-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e3f2fd;
  padding: 8px 16px;
  border-radius: 20px;
}

.ip-label {
  font-weight: bold;
  color: #1976d2;
}

.ip-value {
  font-family: monospace;
  color: #1565c0;
}

.loading-container, .error-container, .no-data {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-message {
  color: #d32f2f;
  margin-bottom: 20px;
}

.retry-button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background: #1565c0;
}

.section-title {
  margin: 30px 0 20px 0;
  color: #333;
  font-size: 20px;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 8px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.summary-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.summary-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #1976d2;
}

.chart-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.chart-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 16px;
}

.chart {
  width: 100%;
}

.table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f5f5f5;
  font-weight: bold;
  color: #333;
}

.data-table td {
  color: #333;
  font-weight: 500;
}

.data-table tr:hover {
  background: #f9f9f9;
}

.detail-button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.detail-button:hover {
  background: #1565c0;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 20px;
  border: 1px solid #e0e0e0;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  background: #f5f5f5;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #e74c3c;
  color: white;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

.metric-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.detail-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8e8e8;
}

.time-section {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-color: #ffb74d;
}

.time-section h4 {
  border-bottom-color: #ffb74d;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid #ffb74d;
}

.time-icon {
  font-size: 24px;
}

.time-value {
  color: #e65100;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.metric-item:hover {
  background: #e3f2fd;
  border-color: #1976d2;
  transform: translateX(4px);
}

.metric-label {
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

.metric-value {
  color: #1976d2;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .machine-history {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .data-table {
    font-size: 14px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px;
  }
  
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .modal-body {
    padding: 15px;
  }
  
  .metric-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>