<template>
  <div class="health-config">
    <!-- 页面头部 -->
    <div class="config-header">
      <h1 class="config-title">
        <span class="title-icon">⚙️</span>
        健康度配置管理
      </h1>
      <div class="header-actions">
        <button @click="fetchHealthConfig" :disabled="loading" class="refresh-btn">
          <span class="refresh-icon" :class="{ spinning: loading }">🔄</span>
          {{ loading ? '加载中...' : '刷新' }}
        </button>
        <button @click="saveConfig" :disabled="saving" class="save-btn">
          <span class="save-icon">💾</span>
          {{ saving ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
    </div>

    <!-- 成功提示 -->
    <div v-if="success" class="success-message">
      <span class="success-icon">✅</span>
      <span>{{ success }}</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载健康度配置...</p>
    </div>

    <!-- 配置内容 -->
    <div v-else-if="configData" class="config-content">
      <!-- 阈值配置 -->
      <div class="config-section">
        <h2 class="section-title">
          <span class="section-icon">📊</span>
          告警阈值配置
        </h2>
        <div class="threshold-grid">
          <div class="threshold-group">
            <h3>CPU使用率阈值</h3>
            <div class="threshold-item">
              <label>警告阈值 (%)</label>
              <input 
                v-model="configData.cpu_warning_threshold" 
                type="number" 
                min="0" 
                max="100" 
                class="threshold-input"
              />
            </div>
            <div class="threshold-item">
              <label>告警阈值 (%)</label>
              <input 
                v-model="configData.cpu_alert_threshold" 
                type="number" 
                min="0" 
                max="100" 
                class="threshold-input"
              />
            </div>
          </div>

          <div class="threshold-group">
            <h3>内存使用率阈值</h3>
            <div class="threshold-item">
              <label>警告阈值 (%)</label>
              <input 
                v-model="configData.memory_warning_threshold" 
                type="number" 
                min="0" 
                max="100" 
                class="threshold-input"
              />
            </div>
            <div class="threshold-item">
              <label>告警阈值 (%)</label>
              <input 
                v-model="configData.memory_alert_threshold" 
                type="number" 
                min="0" 
                max="100" 
                class="threshold-input"
              />
            </div>
          </div>

          <div class="threshold-group">
            <h3>磁盘使用率阈值</h3>
            <div class="threshold-item">
              <label>警告阈值 (%)</label>
              <input 
                v-model="configData.disk_warning_threshold" 
                type="number" 
                min="0" 
                max="100" 
                class="threshold-input"
              />
            </div>
            <div class="threshold-item">
              <label>告警阈值 (%)</label>
              <input 
                v-model="configData.disk_alert_threshold" 
                type="number" 
                min="0" 
                max="100" 
                class="threshold-input"
              />
            </div>
          </div>

          <div class="threshold-group">
            <h3>Swap使用率阈值</h3>
            <div class="threshold-item">
              <label>警告阈值 (%)</label>
              <input 
                v-model="configData.swap_warning_threshold" 
                type="number" 
                min="0" 
                max="100" 
                class="threshold-input"
              />
            </div>
            <div class="threshold-item">
              <label>告警阈值 (%)</label>
              <input 
                v-model="configData.swap_alert_threshold" 
                type="number" 
                min="0" 
                max="100" 
                class="threshold-input"
              />
            </div>
          </div>

          <div class="threshold-group">
            <h3>网络使用率阈值</h3>
            <div class="threshold-item">
              <label>警告阈值 (%)</label>
              <input 
                v-model="configData.network_warning_threshold" 
                type="number" 
                min="0" 
                max="100" 
                class="threshold-input"
              />
            </div>
            <div class="threshold-item">
              <label>告警阈值 (%)</label>
              <input 
                v-model="configData.network_alert_threshold" 
                type="number" 
                min="0" 
                max="100" 
                class="threshold-input"
              />
            </div>
          </div>

          <div class="threshold-group">
            <h3>数据新鲜度阈值</h3>
            <div class="threshold-item">
              <label>警告阈值 (小时)</label>
              <input 
                v-model="configData.data_freshness_warning_hours" 
                type="number" 
                min="0" 
                max="24" 
                step="0.1"
                class="threshold-input"
              />
            </div>
            <div class="threshold-item">
              <label>告警阈值 (小时)</label>
              <input 
                v-model="configData.data_freshness_alert_hours" 
                type="number" 
                min="0" 
                max="24" 
                step="0.1"
                class="threshold-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 权重配置 -->
      <div class="config-section">
        <h2 class="section-title">
          <span class="section-icon">⚖️</span>
          健康度权重配置
        </h2>
        <div class="weight-grid">
          <div class="weight-item">
            <label>CPU权重</label>
            <input 
              v-model="configData.cpu_weight" 
              type="number" 
              min="0" 
              max="1" 
              step="0.05"
              class="weight-input"
            />
            <span class="weight-percent">{{ (configData.cpu_weight * 100).toFixed(0) }}%</span>
          </div>
          <div class="weight-item">
            <label>内存权重</label>
            <input 
              v-model="configData.memory_weight" 
              type="number" 
              min="0" 
              max="1" 
              step="0.05"
              class="weight-input"
            />
            <span class="weight-percent">{{ (configData.memory_weight * 100).toFixed(0) }}%</span>
          </div>
          <div class="weight-item">
            <label>磁盘权重</label>
            <input 
              v-model="configData.disk_weight" 
              type="number" 
              min="0" 
              max="1" 
              step="0.05"
              class="weight-input"
            />
            <span class="weight-percent">{{ (configData.disk_weight * 100).toFixed(0) }}%</span>
          </div>
          <div class="weight-item">
            <label>Swap权重</label>
            <input 
              v-model="configData.swap_weight" 
              type="number" 
              min="0" 
              max="1" 
              step="0.05"
              class="weight-input"
            />
            <span class="weight-percent">{{ (configData.swap_weight * 100).toFixed(0) }}%</span>
          </div>
          <div class="weight-item">
            <label>网络权重</label>
            <input 
              v-model="configData.network_weight" 
              type="number" 
              min="0" 
              max="1" 
              step="0.05"
              class="weight-input"
            />
            <span class="weight-percent">{{ (configData.network_weight * 100).toFixed(0) }}%</span>
          </div>
          <div class="weight-item">
            <label>数据新鲜度权重</label>
            <input 
              v-model="configData.freshness_weight" 
              type="number" 
              min="0" 
              max="1" 
              step="0.05"
              class="weight-input"
            />
            <span class="weight-percent">{{ (configData.freshness_weight * 100).toFixed(0) }}%</span>
          </div>
        </div>
        <div class="weight-summary">
          总权重: {{ (totalWeight * 100).toFixed(0) }}%
          <span v-if="totalWeight !== 1" class="weight-error">权重总和必须为100%</span>
        </div>
      </div>

      <!-- 高级配置 -->
      <div class="config-section">
        <h2 class="section-title">
          <span class="section-icon">🔧</span>
          高级配置
        </h2>
        <div class="advanced-grid">
          <div class="advanced-item">
            <label>网络基准带宽 (Mbps)</label>
            <input 
              v-model="configData.network_base_bandwidth_mbps" 
              type="number" 
              min="1" 
              max="10000" 
              class="advanced-input"
            />
          </div>
          <div class="advanced-item">
            <label>网络评分阈值 (%)</label>
            <input 
              v-model="configData.network_score_threshold" 
              type="number" 
              min="0" 
              max="100" 
              class="advanced-input"
            />
          </div>
          <div class="advanced-item">
            <label>新鲜度评分衰减率</label>
            <input 
              v-model="configData.freshness_score_decay_rate" 
              type="number" 
              min="0" 
              max="100" 
              class="advanced-input"
            />
          </div>
        </div>
      </div>

      <!-- 配置预览 -->
      <div class="config-section">
        <h2 class="section-title">
          <span class="section-icon">👁️</span>
          配置预览
        </h2>
        <div class="preview-content">
          <pre class="config-preview">{{ JSON.stringify(configData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getHealthConfig, updateHealthConfig } from '../utils/api.js'

const configData = ref(null)
const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const success = ref(null)

// 计算总权重
const totalWeight = computed(() => {
  if (!configData.value) return 0
  const weights = [
    configData.value.cpu_weight,
    configData.value.memory_weight,
    configData.value.disk_weight,
    configData.value.swap_weight,
    configData.value.network_weight,
    configData.value.freshness_weight
  ]
  // 使用toFixed(2)解决浮点数精度问题
  return parseFloat(weights.reduce((sum, weight) => sum + weight, 0).toFixed(2))
})

// 获取健康度配置
async function fetchHealthConfig() {
  loading.value = true
  error.value = null
  success.value = null
  
  try {
    const result = await getHealthConfig()
    
    if (result.code === 200) {
      configData.value = result.data
    } else {
      throw new Error(result.message || '获取健康度配置失败')
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// 保存配置
async function saveConfig() {
  // 使用Math.abs和容差来比较浮点数，解决精度问题
  if (Math.abs(totalWeight.value - 1) > 0.01) {
    error.value = '权重总和必须为100%，当前为' + (totalWeight.value * 100).toFixed(0) + '%'
    return
  }

  saving.value = true
  error.value = null
  success.value = null
  
  try {
    // 逐个更新配置项
    const updates = []
    for (const [key, value] of Object.entries(configData.value)) {
      const result = await updateHealthConfig(key, value)
      updates.push(result)
    }
    
    success.value = '健康度配置更新成功'
    
    // 3秒后清除成功消息
    setTimeout(() => {
      success.value = null
    }, 3000)
    
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchHealthConfig()
})
</script>

<style scoped>
.health-config {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  padding: 0;
}

/* 页面头部 */
.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 16px 0;
  border-bottom: 1px solid #e8e8e8;
}

.config-title {
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

.refresh-btn, .save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.refresh-btn {
  background: #42b883;
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: #35a06f;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.save-btn {
  background: #1890ff;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #096dd9;
  transform: translateY(-1px);
}

.save-btn:disabled {
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

/* 消息提示 */
.error-message, .success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.error-message {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
}

.success-message {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
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

/* 配置区域 */
.config-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-icon {
  font-size: 24px;
}

/* 阈值配置网格 */
.threshold-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.threshold-group {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.threshold-group h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
}

.threshold-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.threshold-item:last-child {
  margin-bottom: 0;
}

.threshold-item label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.threshold-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.threshold-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 权重配置网格 */
.weight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.weight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
}

.weight-item label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  min-width: 100px;
}

.weight-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.weight-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.weight-percent {
  font-size: 14px;
  color: #1890ff;
  font-weight: 600;
  min-width: 40px;
}

.weight-summary {
  text-align: center;
  padding: 12px;
  background: #f0f5ff;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.weight-error {
  display: block;
  font-size: 12px;
  color: #cf1322;
  font-weight: normal;
  margin-top: 4px;
}

/* 高级配置网格 */
.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.advanced-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.advanced-item label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.advanced-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.advanced-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 配置预览 */
.preview-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  max-height: 300px;
  overflow: auto;
}

.config-preview {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .threshold-grid, .weight-grid, .advanced-grid {
    grid-template-columns: 1fr;
  }
  
  .weight-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .weight-item label {
    min-width: auto;
  }
}
</style>