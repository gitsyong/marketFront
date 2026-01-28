<template>
  <div class="checkout-page">
    <h1>确认订单</h1>
    
    <div v-if="loading" class="loading-container">
      <Loading />
    </div>
    
    <div v-else class="checkout-content">
      <div class="checkout-main">
        <!-- 收货地址 -->
        <div class="section address-section">
          <h2>收货地址</h2>
          <el-form :model="addressForm" label-width="100px">
            <el-form-item label="收货人">
              <el-input v-model="addressForm.receiverName" placeholder="请输入收货人姓名" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="addressForm.receiverPhone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="收货地址">
              <el-input
                v-model="addressForm.address"
                type="textarea"
                :rows="3"
                placeholder="请输入详细地址"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 商品清单 -->
        <div class="section items-section">
          <h2>商品清单</h2>
          <div class="order-items">
            <div v-for="item in cartItems" :key="item.skuId" class="order-item">
              <img :src="item.productImage || '/placeholder.png'" :alt="item.productName" class="item-image" />
              <div class="item-info">
                <h3>{{ item.productName }}</h3>
                <p class="item-spec">规格: {{ item.skuName }}</p>
              </div>
              <div class="item-quantity">x{{ item.quantity }}</div>
              <div class="item-points">{{ item.pointsRequired * item.quantity }} 积分</div>
            </div>
          </div>
        </div>
        
        <!-- 支付方式 -->
        <div class="section payment-section">
          <h2>支付方式</h2>
          <el-radio-group v-model="paymentMethod">
            <el-radio label="points">纯积分兑换</el-radio>
            <el-radio label="mixed" disabled>混合支付（暂未开放）</el-radio>
          </el-radio-group>
        </div>
      </div>
      
      <!-- 订单摘要 -->
      <div class="checkout-summary">
        <h2>订单摘要</h2>
        <div class="summary-row">
          <span>商品总数:</span>
          <span>{{ totalQuantity }} 件</span>
        </div>
        <div class="summary-row">
          <span>所需积分:</span>
          <span class="points">{{ totalPoints }} 积分</span>
        </div>
        <div class="summary-row">
          <span>当前余额:</span>
          <span :class="{ 'insufficient': !pointsSufficient }">{{ userPoints }} 积分</span>
        </div>
        <div class="summary-row total">
          <span>应付积分:</span>
          <span class="total-points">{{ totalPoints }} 积分</span>
        </div>
        
        <el-button
          type="primary"
          size="large"
          class="submit-btn"
          :disabled="!canSubmit"
          @click="submitOrder"
        >
          提交订单
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'

const router = useRouter()

const loading = ref(false)
const cartItems = ref([])
const userPoints = ref(0)
const paymentMethod = ref('points')

const addressForm = ref({
  receiverName: '',
  receiverPhone: '',
  address: ''
})

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPoints = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.pointsRequired * item.quantity), 0)
})

const pointsSufficient = computed(() => {
  return userPoints.value >= totalPoints.value
})

const canSubmit = computed(() => {
  return pointsSufficient.value &&
    addressForm.value.receiverName &&
    addressForm.value.receiverPhone &&
    addressForm.value.address
})

const loadData = async () => {
  loading.value = true
  try {
    // 加载购物车
    const cartResponse = await request.get('/cart/list')
    cartItems.value = cartResponse.data || []
    
    if (cartItems.value.length === 0) {
      ElMessage.warning('购物车是空的')
      router.push('/cart')
      return
    }
    
    // 加载用户积分
    const pointsResponse = await request.get('/points/balance')
    userPoints.value = pointsResponse.data || 0
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const submitOrder = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请填写完整的收货信息')
    return
  }
  
  loading.value = true
  try {
    const orderData = {
      shippingAddress: `${addressForm.value.receiverName}, ${addressForm.value.receiverPhone}, ${addressForm.value.address}`,
      paymentMethod: paymentMethod.value === 'points' ? 'POINTS' : 'MIXED',
      items: cartItems.value.map(item => ({
        productId: item.productId,
        skuId: item.skuId,
        quantity: item.quantity
      }))
    }
    
    await request.post('/orders/create', orderData)
    ElMessage.success('订单提交成功')
    router.push('/orders')
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error('提交订单失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.checkout-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.checkout-content {
  display: flex;
  gap: 20px;
}

.checkout-main {
  flex: 1;
}

.section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section h2 {
  font-size: 18px;
  margin-bottom: 16px;
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

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
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
}

.item-points {
  color: #f56c6c;
  font-weight: bold;
}

.checkout-summary {
  width: 300px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.checkout-summary h2 {
  font-size: 18px;
  margin-bottom: 16px;
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

.summary-row .insufficient {
  color: #f56c6c;
}

.summary-row.total {
  font-size: 18px;
  font-weight: bold;
  padding-top: 12px;
  border-top: 1px solid #eee;
  margin-top: 12px;
}

.total-points {
  color: #f56c6c;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
}
</style>
