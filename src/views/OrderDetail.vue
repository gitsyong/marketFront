<template>
  <div class="order-detail-page">
    <div class="page-header">
      <el-button class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>订单详情</h1>
    </div>
    
    <div v-if="loading" class="loading-container">
      <Loading />
    </div>
    
    <div v-else-if="order" class="order-detail">
      <!-- 订单状态 -->
      <div class="section status-section">
        <el-tag :type="getStatusType(order.status)" size="large">
          {{ getStatusText(order.status) }}
        </el-tag>
      </div>
      
      <!-- 订单信息 -->
      <div class="section info-section">
        <h2>订单信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">订单号:</span>
            <span class="value">{{ order.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">下单时间:</span>
            <span class="value">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式:</span>
            <span class="value">{{ getPaymentMethodText(order.paymentMethod) }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单状态:</span>
            <span class="value">{{ getStatusText(order.status) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 收货地址 -->
      <div class="section address-section">
        <h2>收货地址</h2>
        <p>{{ order.shippingAddress }}</p>
      </div>
      
      <!-- 商品信息 -->
      <div class="section items-section">
        <h2>商品信息</h2>
        <div class="order-items">
          <div v-for="item in orderItems" :key="item.id" class="order-item">
            <div class="item-info">
              <h3>{{ item.productName }}</h3>
              <p class="item-spec">规格: {{ item.skuName }}</p>
            </div>
            <div class="item-quantity">x{{ item.quantity }}</div>
            <div class="item-points">{{ item.pointsUsed }} 积分</div>
          </div>
        </div>
      </div>
      
      <!-- 费用明细 -->
      <div class="section summary-section">
        <h2>费用明细</h2>
        <div class="summary-row">
          <span>商品积分:</span>
          <span class="points">{{ order.totalPoints }} 积分</span>
        </div>
        <div v-if="order.totalCash > 0" class="summary-row">
          <span>现金支付:</span>
          <span class="cash">¥{{ order.totalCash }}</span>
        </div>
        <div class="summary-row total">
          <span>实付:</span>
          <span class="total-amount">
            {{ order.totalPoints }} 积分
            <span v-if="order.totalCash > 0"> + ¥{{ order.totalCash }}</span>
          </span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions-section">
        <el-button
          v-if="order.status === 'PENDING'"
          type="danger"
          size="large"
          @click="cancelOrder"
        >
          取消订单
        </el-button>
      </div>
    </div>
    
    <div v-else class="error-message">
      <el-empty description="订单不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const order = ref(null)
const orderItems = ref([])

const loadOrderDetail = async () => {
  loading.value = true
  try {
    const orderId = route.params.id
    const response = await request.get(`/orders/${orderId}`)
    order.value = response.data
    
    // 模拟订单项数据（实际应该从后端获取）
    orderItems.value = []
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？取消后积分将退回账户。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await request.post(`/orders/${order.value.id}/cancel`)
    ElMessage.success('订单已取消')
    loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

const goBack = () => {
  router.back()
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
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

h1 {
  margin: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.error-message {
  padding: 40px;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section h2 {
  font-size: 18px;
  margin: 0 0 16px 0;
  color: #303133;
}

.status-section {
  text-align: center;
  padding: 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-item .label {
  color: #909399;
  min-width: 80px;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}

.address-section p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: 14px;
  margin: 0 0 4px 0;
}

.item-spec {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.item-quantity {
  color: #606266;
  min-width: 60px;
}

.item-points {
  color: #f56c6c;
  font-weight: bold;
  min-width: 100px;
  text-align: right;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-row .points {
  color: #f56c6c;
}

.summary-row .cash {
  color: #67c23a;
}

.summary-row.total {
  font-size: 18px;
  font-weight: bold;
  padding-top: 12px;
  border-top: 1px solid #eee;
  margin-top: 12px;
}

.total-amount {
  color: #f56c6c;
}

.actions-section {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.actions-section .el-button {
  min-width: 200px;
}
</style>
