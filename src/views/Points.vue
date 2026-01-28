<template>
  <div class="points-page">
    <h1>积分中心</h1>
    
    <!-- 积分余额卡片 -->
    <div class="balance-card">
      <div class="balance-label">当前积分余额</div>
      <div class="balance-amount">{{ userBalance }} 积分</div>
      <el-button type="primary" @click="showTransferDialog = true">积分转赠</el-button>
    </div>
    
    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="loadHistory"
        class="filter-date"
      />
      <el-button @click="resetFilters">重置</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <Loading />
    </div>
    
    <div v-else-if="transactions.length === 0" class="empty-history">
      <el-empty description="暂无积分变动记录" />
    </div>
    
    <div v-else class="history-list">
      <div v-for="transaction in transactions" :key="transaction.id" class="history-item">
        <div class="transaction-info">
          <div class="transaction-type">
            <span :class="['amount', transaction.amount > 0 ? 'positive' : 'negative']">
              {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }}
            </span>
            <span class="type-label">{{ getTransactionTypeText(transaction.transactionType) }}</span>
          </div>
          <div class="transaction-reason">{{ transaction.reason || '无备注' }}</div>
          <div class="transaction-time">{{ formatDate(transaction.createdAt) }}</div>
        </div>
        <div class="transaction-balance">
          <span class="balance-label">余额</span>
          <span class="balance-value">{{ transaction.balanceAfter }} 积分</span>
        </div>
      </div>
    </div>
    
    <!-- 积分转赠对话框 -->
    <el-dialog v-model="showTransferDialog" title="积分转赠" width="500px">
      <el-form :model="transferForm" label-width="100px">
        <el-form-item label="接收人ID">
          <el-input v-model="transferForm.toUserId" type="number" placeholder="请输入接收人用户ID" />
        </el-form-item>
        <el-form-item label="转赠数量">
          <el-input v-model="transferForm.amount" type="number" placeholder="请输入转赠积分数量" />
        </el-form-item>
        <el-form-item label="当前余额">
          <span>{{ userBalance }} 积分</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransferDialog = false">取消</el-button>
        <el-button type="primary" @click="submitTransfer" :disabled="!canTransfer">确定转赠</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'

const loading = ref(false)
const userBalance = ref(0)
const transactions = ref([])
const dateRange = ref(null)
const showTransferDialog = ref(false)

const transferForm = ref({
  toUserId: '',
  amount: ''
})

const canTransfer = computed(() => {
  const amount = parseFloat(transferForm.value.amount)
  return transferForm.value.toUserId && 
         amount > 0 && 
         amount <= userBalance.value
})

const loadBalance = async () => {
  try {
    const response = await request.get('/points/balance')
    userBalance.value = response.data || 0
  } catch (error) {
    console.error('加载积分余额失败:', error)
    ElMessage.error('加载积分余额失败')
  }
}

const loadHistory = async () => {
  loading.value = true
  try {
    const params = {}
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0].toISOString()
      params.endTime = dateRange.value[1].toISOString()
    }
    
    const response = await request.get('/points/history', { params })
    transactions.value = response.data || []
  } catch (error) {
    console.error('加载积分历史失败:', error)
    ElMessage.error('加载积分历史失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  dateRange.value = null
  loadHistory()
}

const submitTransfer = async () => {
  if (!canTransfer.value) {
    ElMessage.warning('请填写正确的转赠信息')
    return
  }
  
  try {
    await request.post('/points/transfer', {
      toUserId: parseInt(transferForm.value.toUserId),
      amount: parseFloat(transferForm.value.amount)
    })
    
    ElMessage.success('积分转赠成功')
    showTransferDialog.value = false
    transferForm.value = { toUserId: '', amount: '' }
    
    // 重新加载数据
    await loadBalance()
    await loadHistory()
  } catch (error) {
    console.error('积分转赠失败:', error)
    ElMessage.error(error.response?.data?.message || '积分转赠失败')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getTransactionTypeText = (type) => {
  const typeMap = {
    'GRANT': '发放',
    'DEDUCT': '扣除',
    'TRANSFER_OUT': '转出',
    'TRANSFER_IN': '转入',
    'ORDER_PAYMENT': '订单支付',
    'ORDER_REFUND': '订单退款',
    'MONTHLY_GRANT': '每月发放'
  }
  return typeMap[type] || type
}

onMounted(async () => {
  await loadBalance()
  await loadHistory()
})
</script>

<style scoped>
.points-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
}

.balance-card .el-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.balance-card .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
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

.filter-date {
  width: 300px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.empty-history {
  padding: 40px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.transaction-info {
  flex: 1;
}

.transaction-type {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.amount {
  font-size: 24px;
  font-weight: bold;
}

.amount.positive {
  color: #67c23a;
}

.amount.negative {
  color: #f56c6c;
}

.type-label {
  font-size: 14px;
  color: #606266;
  padding: 2px 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.transaction-reason {
  color: #909399;
  font-size: 14px;
  margin-bottom: 4px;
}

.transaction-time {
  color: #c0c4cc;
  font-size: 12px;
}

.transaction-balance {
  text-align: right;
}

.transaction-balance .balance-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.transaction-balance .balance-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}
</style>
