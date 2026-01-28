<template>
  <div class="admin-points-page">
    <div class="page-header">
      <h1>积分管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showGrantDialog">发放积分</el-button>
        <el-button type="warning" @click="showDeductDialog">扣除积分</el-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <Loading />
    </div>
    
    <div v-else class="points-content">
      <!-- 员工列表 -->
      <div class="users-table-container">
        <h2>员工积分</h2>
        <el-table :data="users" stripe style="width: 100%">
          <el-table-column prop="id" label="用户ID" width="100" />
          <el-table-column prop="username" label="用户名" width="150" />
          <el-table-column prop="realName" label="姓名" width="150" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="getRoleType(row.role)">
                {{ getRoleText(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="pointsBalance" label="积分余额" width="150">
            <template #default="{ row }">
              <span class="points-balance">{{ row.pointsBalance || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="grantToUser(row)">发放</el-button>
              <el-button size="small" type="warning" @click="deductFromUser(row)">扣除</el-button>
              <el-button size="small" type="info" @click="viewUserHistory(row)">历史</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-if="users.length === 0" class="empty-state">
          <el-empty description="暂无用户数据" />
        </div>
      </div>
      
      <!-- 积分变动历史 -->
      <div class="history-section">
        <h2>最近积分变动</h2>
        <el-table :data="recentTransactions" stripe style="width: 100%">
          <el-table-column prop="createdAt" label="时间" width="180" />
          <el-table-column prop="userId" label="用户ID" width="100" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTransactionType(row.type)">
                {{ getTransactionText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">
              <span :class="row.amount > 0 ? 'text-success' : 'text-danger'">
                {{ row.amount > 0 ? '+' : '' }}{{ row.amount }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="原因" min-width="200" />
        </el-table>
        
        <div v-if="recentTransactions.length === 0" class="empty-state">
          <el-empty description="暂无变动记录" />
        </div>
      </div>
    </div>
    
    <!-- 发放积分对话框 -->
    <el-dialog
      v-model="grantDialogVisible"
      title="发放积分"
      width="500px"
    >
      <el-form :model="grantForm" label-width="100px">
        <el-form-item label="用户ID">
          <el-input v-model.number="grantForm.userId" :disabled="!!grantForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="发放金额">
          <el-input-number v-model="grantForm.amount" :min="0" :step="100" />
        </el-form-item>
        <el-form-item label="发放原因">
          <el-input v-model="grantForm.reason" type="textarea" :rows="3" placeholder="请输入发放原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="grantDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGrant">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 扣除积分对话框 -->
    <el-dialog
      v-model="deductDialogVisible"
      title="扣除积分"
      width="500px"
    >
      <el-form :model="deductForm" label-width="100px">
        <el-form-item label="用户ID">
          <el-input v-model.number="deductForm.userId" :disabled="!!deductForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="扣除金额">
          <el-input-number v-model="deductForm.amount" :min="0" :step="100" />
        </el-form-item>
        <el-form-item label="扣除原因">
          <el-input v-model="deductForm.reason" type="textarea" :rows="3" placeholder="请输入扣除原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deductDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="submitDeduct">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 用户积分历史对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="积分变动历史"
      width="800px"
    >
      <el-table :data="userHistory" stripe style="width: 100%">
        <el-table-column prop="createdAt" label="时间" width="180" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTransactionType(row.type)">
              {{ getTransactionText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span :class="row.amount > 0 ? 'text-success' : 'text-danger'">
              {{ row.amount > 0 ? '+' : '' }}{{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balanceAfter" label="余额" width="120" />
        <el-table-column prop="reason" label="原因" min-width="200" />
      </el-table>
      
      <div v-if="userHistory.length === 0" class="empty-state">
        <el-empty description="暂无历史记录" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'

const loading = ref(false)
const users = ref([])
const recentTransactions = ref([])
const grantDialogVisible = ref(false)
const deductDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const userHistory = ref([])

const grantForm = ref({
  userId: null,
  amount: 0,
  reason: ''
})

const deductForm = ref({
  userId: null,
  amount: 0,
  reason: ''
})

onMounted(() => {
  loadUsers()
  loadRecentTransactions()
})

const loadUsers = async () => {
  loading.value = true
  try {
    // 这里应该调用用户列表API，暂时使用模拟数据
    // 实际应该有一个 /users/list 接口
    users.value = [
      { id: 1, username: 'admin', realName: '管理员', role: 'SUPER_ADMIN', pointsBalance: 5000 },
      { id: 2, username: 'manager', realName: '经理', role: 'ADMINISTRATOR', pointsBalance: 3000 },
      { id: 3, username: 'employee1', realName: '员工1', role: 'EMPLOYEE', pointsBalance: 1000 },
      { id: 4, username: 'employee2', realName: '员工2', role: 'EMPLOYEE', pointsBalance: 1500 }
    ]
  } catch (error) {
    console.error('加载用户失败:', error)
    ElMessage.error('加载用户失败')
  } finally {
    loading.value = false
  }
}

const loadRecentTransactions = async () => {
  try {
    // 这里应该调用最近交易记录API
    // 暂时留空，实际需要后端提供接口
    recentTransactions.value = []
  } catch (error) {
    console.error('加载交易记录失败:', error)
  }
}

const getRoleType = (role) => {
  const typeMap = {
    'SUPER_ADMIN': 'danger',
    'ADMINISTRATOR': 'warning',
    'EMPLOYEE': 'success'
  }
  return typeMap[role] || 'info'
}

const getRoleText = (role) => {
  const textMap = {
    'SUPER_ADMIN': '超级管理员',
    'ADMINISTRATOR': '管理员',
    'EMPLOYEE': '员工'
  }
  return textMap[role] || role
}

const getTransactionType = (type) => {
  const typeMap = {
    'GRANT': 'success',
    'DEDUCT': 'warning',
    'TRANSFER_IN': 'primary',
    'TRANSFER_OUT': 'info',
    'CONSUME': 'danger'
  }
  return typeMap[type] || 'info'
}

const getTransactionText = (type) => {
  const textMap = {
    'GRANT': '发放',
    'DEDUCT': '扣除',
    'TRANSFER_IN': '转入',
    'TRANSFER_OUT': '转出',
    'CONSUME': '消费'
  }
  return textMap[type] || type
}

const showGrantDialog = () => {
  grantForm.value = {
    userId: null,
    amount: 0,
    reason: ''
  }
  grantDialogVisible.value = true
}

const showDeductDialog = () => {
  deductForm.value = {
    userId: null,
    amount: 0,
    reason: ''
  }
  deductDialogVisible.value = true
}

const grantToUser = (user) => {
  grantForm.value = {
    userId: user.id,
    amount: 0,
    reason: ''
  }
  grantDialogVisible.value = true
}

const deductFromUser = (user) => {
  deductForm.value = {
    userId: user.id,
    amount: 0,
    reason: ''
  }
  deductDialogVisible.value = true
}

const submitGrant = async () => {
  if (!grantForm.value.userId) {
    ElMessage.warning('请输入用户ID')
    return
  }
  
  if (grantForm.value.amount <= 0) {
    ElMessage.warning('发放金额必须大于0')
    return
  }
  
  if (!grantForm.value.reason) {
    ElMessage.warning('请输入发放原因')
    return
  }
  
  try {
    await request.post('/points/grant', grantForm.value)
    ElMessage.success('发放成功')
    grantDialogVisible.value = false
    await loadUsers()
    await loadRecentTransactions()
  } catch (error) {
    console.error('发放失败:', error)
    ElMessage.error('发放失败')
  }
}

const submitDeduct = async () => {
  if (!deductForm.value.userId) {
    ElMessage.warning('请输入用户ID')
    return
  }
  
  if (deductForm.value.amount <= 0) {
    ElMessage.warning('扣除金额必须大于0')
    return
  }
  
  if (!deductForm.value.reason) {
    ElMessage.warning('请输入扣除原因')
    return
  }
  
  try {
    await request.post('/points/deduct', deductForm.value)
    ElMessage.success('扣除成功')
    deductDialogVisible.value = false
    await loadUsers()
    await loadRecentTransactions()
  } catch (error) {
    console.error('扣除失败:', error)
    ElMessage.error('扣除失败')
  }
}

const viewUserHistory = async (user) => {
  try {
    // 这里需要一个查询指定用户积分历史的API
    // 暂时使用空数据
    userHistory.value = []
    historyDialogVisible.value = true
  } catch (error) {
    console.error('加载历史失败:', error)
    ElMessage.error('加载历史失败')
  }
}
</script>

<style scoped>
.admin-points-page {
  padding: 20px;
  max-width: 1400px;
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
  gap: 12px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.points-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.users-table-container,
.history-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.users-table-container h2,
.history-section h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.empty-state {
  padding: 20px;
}

.points-balance {
  font-weight: 600;
  color: #409eff;
  font-size: 16px;
}

.text-success {
  color: #67c23a;
  font-weight: 600;
}

.text-danger {
  color: #f56c6c;
  font-weight: 600;
}
</style>
