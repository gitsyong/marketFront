<template>
  <el-header class="app-header">
    <div class="header-left">
      <h2 class="logo">YUJU 员工福利商城</h2>
    </div>
    
    <div class="header-center">
      <el-menu
        :default-active="activeMenu"
        mode="horizontal"
        :ellipsis="false"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/home">首页</el-menu-item>
        <el-menu-item index="/products">商品列表</el-menu-item>
        <el-menu-item index="/cart">购物车 <el-badge :value="cartCount" v-if="cartCount > 0" /></el-menu-item>
        <el-menu-item index="/orders">我的订单</el-menu-item>
        <el-menu-item index="/points">积分中心</el-menu-item>
        <el-menu-item v-if="isAdmin" index="/admin/products">商品管理</el-menu-item>
        <el-menu-item v-if="isAdmin" index="/admin/inventory">库存管理</el-menu-item>
        <el-menu-item v-if="isAdmin" index="/admin/points">积分管理</el-menu-item>
        <el-menu-item v-if="isAdmin" index="/admin/reports">数据统计</el-menu-item>
      </el-menu>
    </div>
    
    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-icon><User /></el-icon>
          <span>{{ username }}</span>
          <span class="points-badge">{{ points }}积分</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              <div class="user-dropdown-info">
                <div>用户: {{ username }}</div>
                <div>角色: {{ roleText }}</div>
                <div class="points-info">积分: {{ points }}</div>
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <el-badge :value="notificationCount" :hidden="notificationCount === 0" class="notification-badge">
        <el-button :icon="Bell" circle @click="showNotifications" />
      </el-badge>
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { User, ArrowDown, Bell } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

const activeMenu = computed(() => route.path)
const username = computed(() => userStore.userInfo?.username || '用户')
const points = computed(() => userStore.points || 0)
const isAdmin = computed(() => userStore.userInfo?.role === 'ADMIN' || userStore.userInfo?.role === 'SUPER_ADMIN')
const cartCount = computed(() => cartStore.cartCount)
const notificationCount = computed(() => 0) // TODO: 实现通知功能

const roleText = computed(() => {
  const role = userStore.userInfo?.role
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return '管理员'
  if (role === 'MANAGER') return '经理'
  return '员工'
})

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}

const showNotifications = () => {
  // TODO: 实现通知中心
  router.push('/notifications')
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left .logo {
  margin: 0;
  color: #409eff;
  font-size: 20px;
  white-space: nowrap;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.notification-badge {
  margin-left: 10px;
}

.points-badge {
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

.user-dropdown-info {
  padding: 5px 0;
  min-width: 150px;
}

.user-dropdown-info div {
  padding: 3px 0;
  color: #606266;
}

.points-info {
  color: #409eff !important;
  font-weight: bold;
}
</style>
