import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/Layout/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/Products.vue')
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetail.vue')
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/Cart.vue')
      },
      {
        path: 'checkout',
        name: 'Checkout',
        component: () => import('@/views/Checkout.vue')
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/Orders.vue')
      },
      {
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('@/views/OrderDetail.vue')
      },
      {
        path: 'points',
        name: 'Points',
        component: () => import('@/views/Points.vue')
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/Notifications.vue')
      },
      {
        path: 'admin/products',
        name: 'AdminProducts',
        component: () => import('@/views/AdminProducts.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/inventory',
        name: 'AdminInventory',
        component: () => import('@/views/AdminInventory.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/points',
        name: 'AdminPoints',
        component: () => import('@/views/AdminPoints.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/reports',
        name: 'AdminReports',
        component: () => import('@/views/AdminReports.vue'),
        meta: { requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  
  // Allow access to login page
  if (to.path === '/login') {
    if (token) {
      next('/home')
    } else {
      next()
    }
    return
  }
  
  // Require authentication for all other pages
  if (!token) {
    next('/login')
    return
  }
  
  // Check admin permission
  if (to.meta.requiresAdmin) {
    const isAdmin = userInfo.role === 'ADMINISTRATOR' || userInfo.role === 'SUPER_ADMINISTRATOR'
    if (!isAdmin) {
      next('/home')
      return
    }
  }
  
  next()
})

export default router
