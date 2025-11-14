import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  // 调试：打印环境变量
  console.log('🌐 Vite环境变量:', {
    mode: mode,
    VITE_API_BASE_URL: env.VITE_API_BASE_URL,
    VITE_API_PREFIX: env.VITE_API_PREFIX,
    VITE_REFRESH_INTERVAL: env.VITE_REFRESH_INTERVAL
  })
  
  // 获取 API 基础地址，默认为 localhost:8000
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8000'
  const apiPrefix = env.VITE_API_PREFIX || '/api'
  
  console.log('🌐 代理配置:', {
    apiBaseUrl: apiBaseUrl,
    apiPrefix: apiPrefix
  })

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        // 代理所有API请求（包括认证请求）
        [apiPrefix]: {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${apiPrefix}`), ''),
        },
      },
    },
  }
})
