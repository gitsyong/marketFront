<template>
  <div class="orders-page">
    <h1>我的订单</h1>
    
    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-select v-model="filterStatus" placeholder="订单状态" clearable @change="loadOrders" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="待发货" value="PENDING" />
        <el-option label="已发货" value="SHIPPED" />
        <el-option label="已完成" value="COMPLETED" />
        <el-option label="已取消" value="CANCELLED" />
      </el-select>
      
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="loadOrders"
        class="filter-date"
      />
      
      <el-button @click="resetFilters">重置</el-button>
      
      <div style="flex: 1"></div>
      
      <el-dropdown @command="handleExport" trigger="click">
        <el-button type="primary">
          导出订单 <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="excel">导出为 Excel</el-dropdown-item>
            <el-dropdown-item command="pdf">导出为 PDF</el-dropdown-item>
            <el-dropdown-item command="csv">导出为 CSV</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <div v-if="loading" class="loading-container">
      <Loading />
    </div>
    
    <div v-else-if="orders.length === 0" class="empty-orders">
      <el-empty description="暂无订单">
        <el-button type="primary" @click="goToProducts">去购物</el-button>
      </el-empty>
    </div>
    
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">订单号: {{ order.orderNo }}</span>
          <span class="order-time">{{ formatDate(order.createdAt) }}</span>
          <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
        </div>
        
        <div class="order-body">
          <div class="order-info">
            <p><strong>收货地址:</strong> {{ order.shippingAddress }}</p>
            <p><strong>支付方式:</strong> {{ getPaymentMethodText(order.paymentMethod) }}</p>
          </div>
          
          <div class="order-summary">
            <p class="order-points">{{ order.totalPoints }} 积分</p>
            <p v-if="order.totalCash > 0" class="order-cash">¥{{ order.totalCash }}</p>
          </div>
        </div>
        
        <div class="order-actions">
          <el-button size="small" @click="viewDetail(order.id)">查看详情</el-button>
          <el-button
            v-if="order.status === 'PENDING'"
            size="small"
            type="danger"
            @click="cancelOrder(order.id)"
          >
            取消订单
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'

const router = useRouter()

const loading = ref(false)
const orders = ref([])
const filterStatus = ref('')
const dateRange = ref(null)

const loadOrders = async () => {
  loading.value = true
  try {
    const params = {}
    
    if (filterStatus.value) {
      params.status = filterStatus.value
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0].toISOString()
      params.endTime = dateRange.value[1].toISOString()
    }
    
    const response = await request.get('/orders/list', { params })
    orders.value = response.data || []
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filterStatus.value = ''
  dateRange.value = null
  loadOrders()
}

const viewDetail = (orderId) => {
  router.push(`/order/${orderId}`)
}

const cancelOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await request.post(`/orders/${orderId}/cancel`)
    ElMessage.success('订单已取消')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

const goToProducts = () => {
  router.push('/products')
}

const handleExport = async (format) => {
  try {
    const params = {}
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0].toISOString()
      params.endTime = dateRange.value[1].toISOString()
    } else {
      // 默认导出最近30天的数据
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      params.startTime = startDate.toISOString()
      params.endTime = endDate.toISOString()
    }
    
    ElMessage.info('正在生成报表，请稍候...')
    
    const response = await request.get(`/reports/export/${format}`, {
      params,
      responseType: 'blob'
    })
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 设置文件名
    const timestamp = new Date().toISOString().split('T')[0]
    const extensionMap = {
      'excel': 'xlsx',
      'pdf': 'pdf',
      'csv': 'csv'
    }
    link.download = `订单报表_${timestamp}.${extensionMap[format]}`
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('报表导出成功')
  } catch (error) {
    console.error('导出报表失败:', error)
    ElMessage.error('导出报表失败')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getStatusType = (status) => {
  const typeMap = {
    'PENDING': 'warning',
    'SHIPPED': 'info',
    'COMPLETED': 'success',
    'CANCELLED': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'PENDING': '待发货',
    'SHIPPED': '已发货',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return textMap[status] || status
}

const getPaymentMethodText = (method) => {
  const textMap = {
    'POINTS': '纯积分',
    'MIXED': '混合支付'
  }
  return textMap[method] || method
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-select {
  width: 150px;
}

.filter-date {
  width: 300px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.empty-orders {
  padding: 40px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}

.order-no {
  font-weight: bold;
  color: #303133;
}

.order-time {
  color: #909399;
  font-size: 14px;
}

.order-body {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-info {
  flex: 1;
}

.order-info p {
  margin: 8px 0;
  color: #606266;
}

.order-summary {
  text-align: right;
}

.order-points {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 4px 0;
}

.order-cash {
  color: #67c23a;
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}
</style>
