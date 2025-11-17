<template>
  <div class="overview">
    <!-- 页面头部 -->
    <div class="overview-header">
      <h1 class="overview-title">
        <span class="title-icon">📊</span>
        系统监控总览
      </h1>
      <div class="header-actions">
        <button @click="fetchSystemOverview" :disabled="loading" class="refresh-btn">
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
      <p>正在加载系统概览数据...</p>
    </div>

    <!-- 系统概览内容 -->
    <div v-else-if="overviewData" class="overview-content">
      <!-- 健康状态卡片 -->
      <div class="health-section">
        <div class="health-card">
          <div class="health-header">
            <span class="health-icon">❤️</span>
            <span class="health-title">系统健康状态</span>
          </div>
          <div class="health-row">
            <!-- 中间：健康分雷达图 -->
            <div class="health-middle">
              <div class="health-radar">
                <h4>系统健康分</h4>
                <div class="radar-container">
                  <VChart :option="healthRadarOption" class="radar-chart" />
                  <div class="health-score-overlay">
                    <span class="overlay-score">{{ overviewData.health_status.overall_score }}</span>
                    <span class="overlay-label">健康分</span>
                  </div>
                </div>
                <div class="health-rate-info">
                  <div class="health-rate-item">
                    <span class="rate-label">健康率</span>
                    <span class="rate-value">{{ formatPercent(overviewData.health_status.health_percentage) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 右侧：五维健康度具体数值 -->
            <div class="health-right">
              <div class="dimension-scores-section">
                <h4>五维健康度分析</h4>
                <div class="dimension-scores">
                  <div 
                    v-for="(score, dimension) in getDimensionScores()" 
                    :key="dimension"
                    :class="['dimension-item', { 'lowest-score': score.isLowest }]"
                  >
                    <div class="dimension-info">
                      <span class="dimension-label">{{ score.label }}</span>
                      <span class="dimension-value">{{ score.value }}分</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 下方：告警提示信息 -->
            <div class="health-bottom">
              <div class="health-alerts">
                <h4>告警提示</h4>
                <div class="alerts-summary">
                  <div class="alert-row">
                    <div class="alert-item critical">
                      <span class="alert-count">{{ overviewData.alerts_summary.critical_issues }}</span>
                      <span class="alert-label">严重问题</span>
                    </div>
                    <div class="alert-item warning">
                      <span class="alert-count">{{ overviewData.alerts_summary.warning_issues }}</span>
                      <span class="alert-label">警告问题</span>
                    </div>
                  </div>
                </div>
                
                <div v-if="overviewData.alerts_summary.critical_issues === 0 && overviewData.alerts_summary.warning_issues === 0" class="no-alerts">
                  <span class="no-alerts-icon">✅</span>
                  <span>暂无告警</span>
                </div>
                
                <!-- 详细告警信息 -->
                <div v-if="overviewData.detailed_alerts && (overviewData.detailed_alerts.critical.length > 0 || overviewData.detailed_alerts.warning.length > 0)" class="detailed-alerts">
                  <h4 class="detailed-alerts-title">详细告警</h4>
                  <div class="alerts-list">
                    <!-- 严重告警 -->
                    <div v-if="overviewData.detailed_alerts.critical.length > 0" class="alert-type critical">
                      <h5 class="alert-type-title">严重告警</h5>
                      <div v-for="alert in overviewData.detailed_alerts.critical" :key="alert.ip" class="alert-detail">
                        <span class="alert-ip">{{ alert.ip }}</span>
                        <span class="alert-message">{{ alert.warning }}</span>
                        <button @click="goToMachineDetail(alert.ip)" class="alert-action-btn">查看详情</button>
                      </div>
                    </div>
                    
                    <!-- 警告告警 -->
                    <div v-if="overviewData.detailed_alerts.warning.length > 0" class="alert-type warning">
                      <h5 class="alert-type-title">警告告警</h5>
                      <div v-for="alert in overviewData.detailed_alerts.warning" :key="alert.ip" class="alert-detail">
                        <span class="alert-ip">{{ alert.ip }}</span>
                        <span class="alert-message">{{ alert.warning }}</span>
                        <button @click="goToMachineDetail(alert.ip)" class="alert-action-btn">查看详情</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <!-- 活跃机器和告警信息 -->
      <div class="info-section">
        <div class="info-grid">
          <!-- 活跃机器 -->
          <div class="info-card">
            <div class="info-header">
              <span class="info-icon">🖥️</span>
              <span class="info-title">活跃机器</span>
            </div>
            <div class="info-content">
              <div class="machine-count">
                <span class="count-value">{{ overviewData.active_machines.total }}</span>
                <span class="count-label">台机器</span>
              </div>
              <div class="machine-list">
                <div v-for="ip in overviewData.active_machines.ips" :key="ip" class="machine-item">
                  <span class="machine-ip">{{ ip }}</span>
                  <button @click="goToMachineDetail(ip)" class="view-detail-btn">查看详情</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 告警摘要 -->
          <div class="info-card">
            <div class="info-header">
              <span class="info-icon">🚨</span>
              <span class="info-title">告警摘要</span>
            </div>
            <div class="info-content">
              <div class="alert-summary">
                <div class="alert-item critical">
                  <span class="alert-count">{{ overviewData.alerts_summary.critical_issues }}</span>
                  <span class="alert-label">严重问题</span>
                </div>
                <div class="alert-item warning">
                  <span class="alert-count">{{ overviewData.alerts_summary.warning_issues }}</span>
                  <span class="alert-label">警告问题</span>
                </div>
              </div>
              <div v-if="overviewData.alerts_summary.critical_issues === 0 && overviewData.alerts_summary.warning_issues === 0" class="no-alerts">
                <span class="no-alerts-icon">✅</span>
                <span>暂无告警</span>
              </div>
              
              <!-- 详细告警信息 -->
              <div v-if="overviewData.detailed_alerts && (overviewData.detailed_alerts.critical.length > 0 || overviewData.detailed_alerts.warning.length > 0)" class="detailed-alerts">
                <h4 class="detailed-alerts-title">详细告警</h4>
                <div class="alerts-list">
                  <!-- 严重告警 -->
                  <div v-if="overviewData.detailed_alerts.critical.length > 0" class="alert-type critical">
                    <h5 class="alert-type-title">严重告警</h5>
                    <div v-for="alert in overviewData.detailed_alerts.critical" :key="alert.ip" class="alert-detail">
                      <span class="alert-ip">{{ alert.ip }}</span>
                      <span class="alert-message">{{ alert.warning }}</span>
                      <button @click="goToMachineDetail(alert.ip)" class="alert-action-btn">查看详情</button>
                    </div>
                  </div>
                  
                  <!-- 警告告警 -->
                  <div v-if="overviewData.detailed_alerts.warning.length > 0" class="alert-type warning">
                    <h5 class="alert-type-title">警告告警</h5>
                    <div v-for="alert in overviewData.detailed_alerts.warning" :key="alert.ip" class="alert-detail">
                      <span class="alert-ip">{{ alert.ip }}</span>
                      <span class="alert-message">{{ alert.warning }}</span>
                      <button @click="goToMachineDetail(alert.ip)" class="alert-action-btn">查看详情</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能趋势和建议 -->
      <div class="trend-section">
        <div class="trend-card">
          <div class="trend-header">
            <span class="trend-icon">📈</span>
            <span class="trend-title">性能趋势分析</span>
          </div>
          <div class="trend-content">
            <div class="trend-status">
              <span class="trend-label">趋势:</span>
              <span class="trend-value" :class="getTrendClass(overviewData.performance_trend.trend)">
                {{ getTrendText(overviewData.performance_trend.trend) }}
              </span>
            </div>
            <div class="trend-confidence">
              <span class="confidence-label">置信度:</span>
              <span class="confidence-value">{{ formatPercent(overviewData.performance_trend.confidence * 100) }}</span>
            </div>
            <div class="trend-analysis">
              <p>{{ overviewData.performance_trend.analysis }}</p>
            </div>
            <div v-if="overviewData.performance_trend.suggestions.length > 0" class="suggestions">
              <h4>优化建议:</h4>
              <ul>
                <li v-for="(suggestion, index) in overviewData.performance_trend.suggestions" :key="index">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { getSystemOverview } from '../utils/api.js'

// 注册ECharts组件
use([
  CanvasRenderer,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const router = useRouter()

const overviewData = ref(null)
const loading = ref(false)
const error = ref(null)
const timeWindow = ref('1')
const radarChartOption = ref({})
const healthRadarOption = ref({})

// 更新五维健康度雷达图
function updateHealthRadarChart() {
  if (!overviewData.value || !overviewData.value.health_status || !overviewData.value.health_status.five_dimension_scores) {
    healthRadarOption.value = {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 14
        }
      },
      radar: { show: false },
      series: []
    }
    return
  }

  const scores = overviewData.value.health_status.five_dimension_scores
  const dimensionNames = ['CPU健康度', '内存健康度', 'Swap健康度', '磁盘健康度', '网络健康度']
  
  healthRadarOption.value = {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return `${dimensionNames[params.dataIndex]}: ${params.value}分`
      }
    },
    radar: {
      indicator: [
        { name: '', max: 100 },
        { name: '', max: 100 },
        { name: '', max: 100 },
        { name: '', max: 100 },
        { name: '', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: ['rgba(238, 197, 102, 0.1)', 'rgba(238, 197, 102, 0.2)', 
                 'rgba(238, 197, 102, 0.4)', 'rgba(238, 197, 102, 0.6)', 
                 'rgba(238, 197, 102, 0.8)']
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(238, 197, 102, 0.1)', 'rgba(238, 197, 102, 0.2)', 
                 'rgba(238, 197, 102, 0.4)', 'rgba(238, 197, 102, 0.6)', 
                 'rgba(238, 197, 102, 0.8)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(238, 197, 102, 0.5)'
        }
      }
    },
    series: [{
      name: '健康度',
      type: 'radar',
      data: [{
        value: [
          scores.cpu_score || 0,
          scores.memory_score || 0,
          scores.swap_score || 0,
          scores.disk_score || 0,
          scores.network_score || 0
        ],
        name: '健康度',
        areaStyle: {
          color: 'rgba(255, 144, 128, 0.6)'
        },
        lineStyle: {
          color: 'rgba(255, 144, 128, 0.8)',
          width: 2
        },
        itemStyle: {
          color: 'rgba(255, 144, 128, 1)'
        }
      }]
    }]
  }
}

// 更新关键指标雷达图数据
function updateRadarChart() {
  if (!overviewData.value || !overviewData.value.key_metrics) {
    radarChartOption.value = {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 14
        }
      },
      radar: { show: false },
      series: []
    }
    return
  }

  const metrics = overviewData.value.key_metrics
  
  radarChartOption.value = {
    title: {
      text: '关键指标最大值雷达图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: [
        { name: 'CPU使用率', max: 100 },
        { name: '内存使用率', max: 100 },
        { name: '磁盘使用率', max: 100 },
        { name: 'Swap使用率', max: 100 },
        { name: '网络使用率', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: ['rgba(238, 197, 102, 0.1)', 'rgba(238, 197, 102, 0.2)', 
                 'rgba(238, 197, 102, 0.4)', 'rgba(238, 197, 102, 0.6)', 
                 'rgba(238, 197, 102, 0.8)']
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(238, 197, 102, 0.1)', 'rgba(238, 197, 102, 0.2)', 
                 'rgba(238, 197, 102, 0.4)', 'rgba(238, 197, 102, 0.6)', 
                 'rgba(238, 197, 102, 0.8)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(238, 197, 102, 0.5)'
        }
      }
    },
    series: [{
      name: '最大值',
      type: 'radar',
      data: [{
        value: [
          metrics.cpu_usage.max || 0,
          metrics.memory_usage.max || 0,
          metrics.disk_usage.max || 0,
          metrics.swap_usage.max || 0,
          metrics.network_usage.max || 0
        ],
        name: '最大值',
        areaStyle: {
          color: 'rgba(255, 144, 128, 0.6)'
        },
        lineStyle: {
          color: 'rgba(255, 144, 128, 0.8)',
          width: 2
        },
        itemStyle: {
          color: 'rgba(255, 144, 128, 1)'
        }
      }]
    }]
  }
}

// 获取系统概览数据
async function fetchSystemOverview() {
  loading.value = true
  error.value = null
  try {
    const result = await getSystemOverview(parseInt(timeWindow.value))
    
    if (result.code === 200) {
      overviewData.value = result.data
      updateRadarChart()
      updateHealthRadarChart()
    } else {
      throw new Error(result.message || '获取系统概览失败')
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// 格式化百分比
function formatPercent(value) {
  if (value === undefined || value === null) return '-'
  return `${value.toFixed(2)}%`
}

// 获取趋势样式类
function getTrendClass(trend) {
  switch (trend) {
    case 'improving': return 'trend-improving'
    case 'declining': return 'trend-declining'
    case 'stable': return 'trend-stable'
    default: return 'trend-unknown'
  }
}

// 获取趋势文本
function getTrendText(trend) {
  switch (trend) {
    case 'improving': return '改善中'
    case 'declining': return '下降中'
    case 'stable': return '稳定'
    default: return '未知'
  }
}

// 获取五维健康度具体数值
function getDimensionScores() {
  if (!overviewData.value || !overviewData.value.health_status || !overviewData.value.health_status.five_dimension_scores) {
    return []
  }
  
  const scores = overviewData.value.health_status.five_dimension_scores
  const dimensions = [
    { key: 'cpu_score', label: 'CPU健康度', value: scores.cpu_score || 0 },
    { key: 'memory_score', label: '内存健康度', value: scores.memory_score || 0 },
    { key: 'swap_score', label: 'Swap健康度', value: scores.swap_score || 0 },
    { key: 'disk_score', label: '磁盘健康度', value: scores.disk_score || 0 },
    { key: 'network_score', label: '网络健康度', value: scores.network_score || 0 }
  ]
  
  // 找出最低分
  const minScore = Math.min(...dimensions.map(d => d.value))
  
  // 标记最低分项
  return dimensions.map(dimension => ({
    ...dimension,
    isLowest: dimension.value === minScore && minScore < 100
  }))
}

// 获取维度图标
function getDimensionIcon(key) {
  const icons = {
    'cpu_score': '💻',
    'memory_score': '🧠',
    'swap_score': '🔄',
    'disk_score': '💾',
    'network_score': '🌐'
  }
  return icons[key] || '📊'
}

// 跳转到机器详情页
function goToMachineDetail(ip) {
  router.push(`/machine/${ip}`)
}

onMounted(() => {
  fetchSystemOverview()
})
</script>

<style scoped>
.overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  padding: 0;
}

/* 页面头部 */
.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 16px 0;
  border-bottom: 1px solid #e8e8e8;
}

.overview-title {
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

.time-window {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.time-select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.refresh-btn, .detail-btn {
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

.refresh-btn:hover:not(:disabled), .detail-btn:hover {
  background: #35a06f;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.detail-btn {
  background: #1890ff;
}

.detail-btn:hover {
  background: #096dd9;
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

/* 健康状态卡片 */
.health-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.health-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.health-icon {
  font-size: 24px;
}

.health-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.health-row {
  display: flex;
  gap: 20px;
  align-items: stretch;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.health-middle {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.health-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  min-width: 350px;
}

.health-bottom {
  width: 100%;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.health-score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #52c41a, #73d13d);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.score-value {
  font-size: 28px;
  font-weight: 700;
}

.score-label {
  font-size: 12px;
  opacity: 0.9;
}

.health-percentage {
  text-align: center;
}

.percentage-value {
  font-size: 20px;
  font-weight: 600;
  color: #52c41a;
}

.percentage-label {
  display: block;
  font-size: 12px;
  color: #666;
}

.health-radar {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 6px;
}

.health-radar h4 {
  margin: 0 0 12px 0;
  color: #1a1a1a;
  font-size: 16px;
  text-align: center;
}

.health-radar .radar-chart {
  width: 100%;
  height: 280px;
}

/* 雷达图容器和覆盖层样式 */
.radar-container {
  position: relative;
  width: 100%;
  height: 280px;
}

.health-score-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.overlay-score {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #52c41a;
  line-height: 1;
}

.overlay-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

/* 健康率信息样式 */
.health-rate-info {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.health-rate-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rate-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.rate-value {
  font-size: 16px;
  font-weight: 600;
  color: #52c41a;
}

/* 五维健康度具体数值样式 */
.dimension-scores-section h4 {
  margin: 0 0 16px 0;
  color: #1a1a1a;
  font-size: 16px;
  text-align: center;
}

.dimension-scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dimension-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.dimension-item:hover {
  background: #f8f9fa;
  border-color: #d9d9d9;
}

.dimension-item.lowest-score {
  background: #fff2f0;
  border-color: #ffccc7;
  color: #cf1322;
}

.dimension-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.dimension-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dimension-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.dimension-item.lowest-score .dimension-label {
  color: #cf1322;
  font-weight: 600;
}

.dimension-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.dimension-item.lowest-score .dimension-value {
  color: #cf1322;
}

.health-alerts {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.health-alerts h4 {
  margin: 0 0 12px 0;
  color: #1a1a1a;
  font-size: 16px;
  text-align: center;
}

.health-distribution h4 {
  margin: 0 0 16px 0;
  color: #1a1a1a;
  font-size: 16px;
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.distribution-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.status-label {
  font-size: 14px;
  color: #666;
}

.status-count {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 关键指标 */
.metrics-section {
  margin-top: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.radar-chart-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.radar-chart {
  width: 100%;
  height: 400px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.metric-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.metric-icon {
  font-size: 20px;
}

.metric-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.metric-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.value-label {
  font-size: 14px;
  color: #666;
}

.value-number {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 信息区域 */
.info-section {
  margin-top: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.info-icon {
  font-size: 20px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.machine-count {
  text-align: center;
  margin-bottom: 16px;
}

.count-value {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
}

.count-label {
  font-size: 14px;
  color: #666;
  margin-left: 8px;
}

.machine-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.machine-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.machine-ip {
  font-family: monospace;
  font-size: 14px;
  color: #1a1a1a;
}

.view-detail-btn {
  padding: 4px 8px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.view-detail-btn:hover {
  background: #096dd9;
}

.alert-summary {
  display: flex;
  justify-content: center;
}

.alert-row {
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

.alert-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  min-width: 100px;
  flex: 1;
}

.alert-item.critical {
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

.alert-item.warning {
  background: #fffbe6;
  border: 1px solid #ffe58f;
}

.alert-count {
  font-size: 24px;
  font-weight: 700;
}

.alert-item.critical .alert-count {
  color: #cf1322;
}

.alert-item.warning .alert-count {
  color: #d48806;
}

.alert-label {
  font-size: 12px;
  color: #666;
}

.no-alerts {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 20px;
  color: #52c41a;
}

.no-alerts-icon {
  font-size: 20px;
}

/* 详细告警信息 */
.detailed-alerts {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.detailed-alerts-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.alert-type {
  margin-bottom: 16px;
}

.alert-type-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 8px 0;
  padding: 4px 8px;
  border-radius: 4px;
}

.alert-type.critical .alert-type-title {
  background: #fff2f0;
  color: #cf1322;
}

.alert-type.warning .alert-type-title {
  background: #fffbe6;
  color: #d48806;
}

.alert-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 13px;
}

.alert-ip {
  font-family: monospace;
  font-weight: 600;
  color: #1a1a1a;
  min-width: 100px;
}

.alert-message {
  flex: 1;
  color: #666;
}

.alert-action-btn {
  padding: 4px 8px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.alert-action-btn:hover {
  background: #096dd9;
}

/* 趋势分析 */
.trend-section {
  margin-top: 24px;
}

.trend-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.trend-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.trend-icon {
  font-size: 20px;
}

.trend-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.trend-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trend-status, .trend-confidence {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trend-label, .confidence-label {
  font-size: 14px;
  color: #666;
  min-width: 60px;
}

.trend-value {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.trend-improving {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.trend-declining {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.trend-stable {
  background: #f0f5ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.trend-unknown {
  background: #fafafa;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}

.confidence-value {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.trend-analysis p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.suggestions h4 {
  margin: 0 0 8px 0;
  color: #1a1a1a;
  font-size: 14px;
}

.suggestions ul {
  margin: 0;
  padding-left: 20px;
}

.suggestions li {
  color: #666;
  line-height: 1.6;
  margin-bottom: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .health-content {
    flex-direction: column;
    gap: 24px;
  }
  
  .metrics-grid, .info-grid {
    grid-template-columns: 1fr;
  }
  
  .alert-summary {
    flex-direction: column;
    gap: 12px;
  }
}
</style>