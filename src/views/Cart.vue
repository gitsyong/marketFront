<template>
  <div class="cart-page">
    <h1>购物车</h1>
    
    <div v-if="loading" class="loading-container">
      <Loading />
    </div>
    
    <div v-else-if="cartItems.length === 0" class="empty-cart">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="goToProducts">去逛逛</el-button>
      </el-empty>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.skuId" class="cart-item">
          <img :src="item.productImage || '/placeholder.png'" :alt="item.productName" class="item-image" />
          
          <div class="item-info">
            <h3 class="item-name">{{ item.productName }}</h3>
            <p class="item-spec">规格: {{ item.skuName }}</p>
            <p class="item-points">{{ item.pointsRequired }} 积分</p>
          </div>
          
          <div class="item-quantity">
            <el-input-number
              v-model="item.quantity"
              :min="1"
              :max="999"
              @change="updateQuantity(item)"
            />
          </div>
          
          <div class="item-total">
            <span class="total-points">{{ item.pointsRequired * item.quantity }} 积分</span>
          </div>
          
          <div class="item-actions">
            <el-button type="danger" text @click="removeItem(item)">移除</el-button>
          </div>
        </div>
      </div>
      
      <div class="cart-summary">
        <div class="summary-row">
          <span>商品总数:</span>
          <span>{{ totalQuantity }} 件</span>
        </div>
        <div class="summary-row total">
          <span>总积分:</span>
          <span class="total-points">{{ totalPoints }} 积分</span>
        </div>
        
        <div v-if="!pointsSufficient" class="insufficient-warning">
          <el-alert type="warning" :closable="false">
            积分不足，当前余额: {{ userPoints }} 积分
          </el-alert>
        </div>
        
        <div class="summary-actions">
          <el-button @click="clearCart">清空购物车</el-button>
          <el-button type="primary" :disabled="!pointsSufficient" @click="goToCheckout">
            去结算
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const cartItems = ref([])
const userPoints = ref(0)

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPoints = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.pointsRequired * item.quantity), 0)
})

const pointsSufficient = computed(() => {
  return userPoints.value >= totalPoints.value
})

const loadCartItems = async () => {
  loading.value = true
  try {
    const response = await request.get('/cart/list')
    cartItems.value = response.data || []
    
    // 加载用户积分
    const pointsResponse = await request.get('/points/balance')
    userPoints.value = pointsResponse.data || 0
  } catch (error) {
    console.error('加载购物车失败:', error)
    ElMessage.error('加载购物车失败')
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (item) => {
  try {
    await request.put('/cart/update', {
      skuId: item.skuId,
      quantity: item.quantity
    })
    ElMessage.success('数量已更新')
  } catch (error) {
    console.error('更新数量失败:', error)
    ElMessage.error('更新数量失败')
    // 重新加载购物车
    loadCartItems()
  }
}

const removeItem = async (item) => {
  try {
    await ElMessageBox.confirm('确定要移除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await request.delete(`/cart/remove/${item.skuId}`)
    ElMessage.success('已移除')
    loadCartItems()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除商品失败:', error)
      ElMessage.error('移除商品失败')
    }
  }
}

const clearCart = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await request.delete('/cart/clear')
    ElMessage.success('购物车已清空')
    cartItems.value = []
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空购物车失败:', error)
      ElMessage.error('清空购物车失败')
    }
  }
}

const goToProducts = () => {
  router.push('/products')
}

const goToCheckout = () => {
  router.push('/checkout')
}

onMounted(() => {
  loadCartItems()
})
</script>

<style scoped>
.cart-page {
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

.empty-cart {
  padding: 40px;
}

.cart-content {
  display: flex;
  gap: 20px;
}

.cart-items {
  flex: 1;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.item-spec {
  color: #909399;
  margin: 4px 0;
}

.item-points {
  color: #f56c6c;
  font-weight: bold;
  margin: 4px 0;
}

.item-quantity {
  width: 120px;
}

.item-total {
  width: 120px;
  text-align: right;
}

.total-points {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.item-actions {
  width: 80px;
}

.cart-summary {
  width: 300px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: bold;
  padding-top: 12px;
  border-top: 1px solid #eee;
  margin-top: 12px;
}

.insufficient-warning {
  margin: 16px 0;
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.summary-actions .el-button {
  width: 100%;
}
</style>
