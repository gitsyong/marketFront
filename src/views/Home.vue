<template>
  <div class="home">
    <el-card class="welcome-card">
      <h1>欢迎来到 YUJU 员工福利商城</h1>
      <div class="user-info-section">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ username }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ roleText }}</el-descriptions-item>
          <el-descriptions-item label="积分余额">
            <span class="points-balance">{{ userPoints }}</span> 积分
          </el-descriptions-item>
          <el-descriptions-item label="账户状态">
            <el-tag type="success">正常</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
    
    <div class="quick-actions">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="action-card" @click="goToProducts">
            <el-icon :size="40" color="#409eff"><ShoppingCart /></el-icon>
            <h3>浏览商品</h3>
            <p>查看所有可兑换商品</p>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="action-card" @click="goToOrders">
            <el-icon :size="40" color="#67c23a"><List /></el-icon>
            <h3>我的订单</h3>
            <p>查看订单历史</p>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="action-card" @click="goToPoints">
            <el-icon :size="40" color="#e6a23c"><Coin /></el-icon>
            <h3>积分中心</h3>
            <p>查看积分明细</p>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="action-card" @click="goToCart">
            <el-icon :size="40" color="#f56c6c"><ShoppingBag /></el-icon>
            <h3>购物车</h3>
            <p>查看购物车</p>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ShoppingCart, List, Coin, ShoppingBag } from '@element-plus/icons-vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const userPoints = ref(0)

const username = computed(() => userStore.userInfo?.username || '用户')
const roleText = computed(() => {
  const role = userStore.userInfo?.role
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return '管理员'
  if (role === 'MANAGER') return '经理'
  return '员工'
})

onMounted(async () => {
  await loadUserPoints()
})

async function loadUserPoints() {
  try {
    const userId = userStore.userInfo?.id
    if (!userId) {
      console.error('用户ID不存在')
      return
    }
    
    // 调用后端API获取用户积分
    const response = await request.get(`/points/balance/${userId}`)
    if (response.success) {
      userPoints.value = response.data || 0
      userStore.setPoints(userPoints.value)
    }
  } catch (error) {
    console.error('加载用户积分失败:', error)
    // 如果API调用失败，使用store中的积分
    userPoints.value = userStore.points || 0
  }
}

function goToProducts() {
  router.push('/products')
}

function goToOrders() {
  router.push('/orders')
}

function goToPoints() {
  router.push('/points')
}

function goToCart() {
  router.push('/cart')
}
</script>

<style scoped>
.home {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 30px;
}

h1 {
  color: #409eff;
  margin-bottom: 20px;
  text-align: center;
}

.user-info-section {
  margin-top: 20px;
}

.points-balance {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.quick-actions {
  margin-top: 20px;
}

.action-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 20px;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-card h3 {
  margin: 15px 0 10px 0;
  color: #303133;
}

.action-card p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}
</style>
