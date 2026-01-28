<template>
  <div class="notifications-page">
    <div class="page-header">
      <h1>通知中心</h1>
      <div class="header-actions">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
          <el-icon :size="24"><Bell /></el-icon>
        </el-badge>
        <el-button v-if="unreadCount > 0" type="primary" size="small" @click="markAllAsRead">
          全部标记为已读
        </el-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <Loading />
    </div>
    
    <div v-else-if="notifications.length === 0" class="empty-notifications">
      <el-empty description="暂无通知" />
    </div>
    
    <div v-else class="notifications-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification-item', { 'unread': !notification.isRead }]"
        @click="markAsRead(notification)"
      >
        <div class="notification-icon">
          <el-icon :size="32" :color="getNotificationColor(notification.type)">
            <component :is="getNotificationIcon(notification.type)" />
          </el-icon>
        </div>
        
        <div class="notification-content">
          <div class="notification-header">
            <h3 class="notification-title">{{ notification.title }}</h3>
            <el-tag v-if="!notification.isRead" type="danger" size="small">未读</el-tag>
          </div>
          <p class="notification-message">{{ notification.content }}</p>
          <span class="notification-time">{{ formatDate(notification.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, Message, ShoppingCart, Warning, InfoFilled } from '@element-plus/icons-vue'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'

const loading = ref(false)
const notifications = ref([])
const unreadCount = ref(0)

const loadNotifications = async () => {
  loading.value = true
  try {
    const response = await request.get('/notifications/list')
    notifications.value = response.data || []
    
    // 加载未读数量
    const countResponse = await request.get('/notifications/unread-count')
    unreadCount.value = countResponse.data || 0
  } catch (error) {
    console.error('加载通知失败:', error)
    ElMessage.error('加载通知失败')
  } finally {
    loading.value = false
  }
}

const markAsRead = async (notification) => {
  if (notification.isRead) return
  
  try {
    await request.post(`/notifications/${notification.id}/read`)
    notification.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

const markAllAsRead = async () => {
  try {
    await request.post('/notifications/read-all')
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
    ElMessage.success('已全部标记为已读')
  } catch (error) {
    console.error('标记全部已读失败:', error)
    ElMessage.error('标记全部已读失败')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 小于1天
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  
  return date.toLocaleString('zh-CN')
}

const getNotificationIcon = (type) => {
  const iconMap = {
    'SYSTEM': InfoFilled,
    'ORDER': ShoppingCart,
    'POINTS': Message,
    'RESTOCK': Warning
  }
  return iconMap[type] || InfoFilled
}

const getNotificationColor = (type) => {
  const colorMap = {
    'SYSTEM': '#409EFF',
    'ORDER': '#67C23A',
    'POINTS': '#E6A23C',
    'RESTOCK': '#F56C6C'
  }
  return colorMap[type] || '#909399'
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notifications-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  cursor: pointer;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.empty-notifications {
  padding: 40px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.notification-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.notification-item.unread {
  background: #f0f9ff;
  border-left: 4px solid #409EFF;
}

.notification-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f5f7fa;
  border-radius: 50%;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.notification-message {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px 0;
  line-height: 1.6;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}
</style>
