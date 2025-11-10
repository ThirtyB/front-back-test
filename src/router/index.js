import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import MachineDetail from '../components/MachineDetail.vue'
import MachineHistory from '../components/MachineHistory.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import { isAuthenticated } from '../utils/auth.js'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/machine/:ip',
    name: 'MachineDetail',
    component: MachineDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/machine/:ip/history',
    name: 'MachineHistory',
    component: MachineHistory,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    // 如果需要认证但用户未登录，重定向到登录页面
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated()) {
    // 如果用户已登录但尝试访问登录/注册页面，重定向到首页
    next('/')
  } else {
    // 正常导航
    next()
  }
})

export default router