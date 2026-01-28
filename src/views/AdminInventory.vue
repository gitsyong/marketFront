<template>
  <div class="admin-inventory-page">
    <div class="page-header">
      <h1>库存管理</h1>
      <el-button type="primary" @click="showModifyDialog">修改库存</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <Loading />
    </div>
    
    <div v-else class="inventory-content">
      <!-- 库存列表 -->
      <div class="inventory-table-container">
        <h2>商品库存</h2>
        <el-table :data="inventoryList" stripe style="width: 100%">
          <el-table-column prop="productId" label="商品ID" width="100" />
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column prop="skuId" label="SKU ID" width="100" />
          <el-table-column prop="skuName" label="规格" width="150" />
          <el-table-column prop="inventory" label="当前库存" width="120">
            <template #default="{ row }">
              <el-tag :type="getInventoryType(row.inventory)">
                {{ row.inventory }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="modifySingleInventory(row)">修改库存</el-button>
              <el-button size="small" type="info" @click="viewHistory(row)">历史</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-if="inventoryList.length === 0" class="empty-state">
          <el-empty description="暂无库存数据" />
        </div>
      </div>
      
      <!-- 库存预警 -->
      <div class="alert-section">
        <h2>库存预警</h2>
        <el-alert
          v-if="alertSkus.length > 0"
          title="以下商品库存不足"
          type="warning"
          :closable="false"
        >
          <div v-for="sku in alertSkus" :key="sku.skuId" class="alert-item">
            {{ sku.productName }} - {{ sku.skuName }}: 库存 {{ sku.inventory }}
          </div>
        </el-alert>
        <el-empty v-else description="暂无库存预警" />
      </div>
    </div>
    
    <!-- 修改库存对话框 -->
    <el-dialog
      v-model="modifyDialogVisible"
      title="修改库存"
      width="500px"
    >
      <el-form :model="modifyForm" label-width="100px">
        <el-form-item label="SKU ID">
          <el-input v-model="modifyForm.skuId" :disabled="!!modifyForm.skuId" />
        </el-form-item>
        <el-form-item label="变动数量">
          <el-input-number v-model="modifyForm.quantityChange" :step="1" />
          <div class="form-tip">正数为增加，负数为减少</div>
        </el-form-item>
        <el-form-item label="变动原因">
          <el-input v-model="modifyForm.reason" type="textarea" :rows="3" placeholder="请输入变动原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitModify">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 库存历史对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="库存变动历史"
      width="800px"
    >
      <el-table :data="historyList" stripe style="width: 100%">
        <el-table-column prop="changeTime" label="时间" width="180" />
        <el-table-column prop="changeType" label="类型" width="100" />
        <el-table-column prop="quantityChange" label="变动数量" width="120">
          <template #default="{ row }">
            <span :class="row.quantityChange > 0 ? 'text-success' : 'text-danger'">
              {{ row.quantityChange > 0 ? '+' : '' }}{{ row.quantityChange }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="inventoryAfter" label="变动后库存" width="120" />
        <el-table-column prop="reason" label="原因" min-width="200" />
      </el-table>
      
      <div v-if="historyList.length === 0" class="empty-state">
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
const inventoryList = ref([])
const alertSkus = ref([])
const modifyDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const historyList = ref([])

const modifyForm = ref({
  skuId: null,
  quantityChange: 0,
  reason: ''
})

onMounted(() => {
  loadInventory()
  checkAlert()
})

const loadInventory = async () => {
  loading.value = true
  try {
    // 获取所有商品
    const response = await request.post('/products/search', {
      pageNum: 1,
      pageSize: 100
    })
    
    const products = response.data.records || []
    
    // 展开所有SKU
    inventoryList.value = []
    for (const product of products) {
      if (product.skus && product.skus.length > 0) {
        for (const sku of product.skus) {
          inventoryList.value.push({
            productId: product.id,
            productName: product.name,
            skuId: sku.id,
            skuName: sku.name || `${sku.size || ''} ${sku.color || ''}`.trim(),
            inventory: sku.inventory || 0
          })
        }
      }
    }
  } catch (error) {
    console.error('加载库存失败:', error)
    ElMessage.error('加载库存失败')
  } finally {
    loading.value = false
  }
}

const checkAlert = async () => {
  try {
    const response = await request.get('/inventory/alert', {
      params: { threshold: 10 }
    })
    
    const alertSkuIds = response.data || []
    
    // 从库存列表中找出预警的SKU
    alertSkus.value = inventoryList.value.filter(item => 
      alertSkuIds.includes(item.skuId)
    )
  } catch (error) {
    console.error('检查库存预警失败:', error)
  }
}

const getInventoryType = (inventory) => {
  if (inventory === 0) return 'danger'
  if (inventory < 10) return 'warning'
  return 'success'
}

const showModifyDialog = () => {
  modifyForm.value = {
    skuId: null,
    quantityChange: 0,
    reason: ''
  }
  modifyDialogVisible.value = true
}

const modifySingleInventory = (row) => {
  modifyForm.value = {
    skuId: row.skuId,
    quantityChange: 0,
    reason: ''
  }
  modifyDialogVisible.value = true
}

const submitModify = async () => {
  if (!modifyForm.value.skuId) {
    ElMessage.warning('请输入SKU ID')
    return
  }
  
  if (modifyForm.value.quantityChange === 0) {
    ElMessage.warning('变动数量不能为0')
    return
  }
  
  if (!modifyForm.value.reason) {
    ElMessage.warning('请输入变动原因')
    return
  }
  
  try {
    await request.post('/inventory/modify', modifyForm.value)
    ElMessage.success('修改成功')
    modifyDialogVisible.value = false
    await loadInventory()
    await checkAlert()
  } catch (error) {
    console.error('修改库存失败:', error)
    ElMessage.error('修改库存失败')
  }
}

const viewHistory = async (row) => {
  try {
    const response = await request.get(`/inventory/history/${row.skuId}`)
    historyList.value = response.data || []
    historyDialogVisible.value = true
  } catch (error) {
    console.error('加载历史失败:', error)
    ElMessage.error('加载历史失败')
  }
}
</script>

<style scoped>
.admin-inventory-page {
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

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.inventory-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.inventory-table-container,
.alert-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.inventory-table-container h2,
.alert-section h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.empty-state {
  padding: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.alert-item {
  padding: 4px 0;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}
</style>
