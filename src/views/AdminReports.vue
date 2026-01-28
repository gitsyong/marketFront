<template>
  <div class="admin-reports-page">
    <div class="page-header">
      <h1>数据统计</h1>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="loadData"
        />
        <el-button type="primary" @click="exportReport">导出报表</el-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <Loading />
    </div>
    
    <div v-else class="reports-content">
      <!-- 兑换量统计 -->
      <div class="statistics-card">
        <h2>兑换量统计</h2>
        <div class="statistics-grid">
          <div class="stat-item">
            <div class="stat-label">总订单数</div>
            <div class="stat-value">{{ exchangeStats.totalOrders || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">总兑换金额</div>
            <div class="stat-value">{{ exchangeStats.totalAmount || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">总积分消耗</div>
            <div class="stat-value">{{ exchangeStats.totalPoints || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">平均订单金额</div>
            <div class="stat-value">{{ exchangeStats.averageAmount || 0 }}</div>
          </div>
        </div>
      </div>
      
      <!-- 热门商品排行 -->
      <div class="popular-products-card">
        <h2>热门商品排行</h2>
        <el-table :data="popularProducts" stripe style="width: 100%">
          <el-table-column type="index" label="排名" width="80" />
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column prop="salesCount" label="销量" width="120" />
          <el-table-column prop="salesAmount" label="销售额" width="150" />
          <el-table-column prop="pointsConsumed" label="积分消耗" width="150" />
        </el-table>
        
        <div v-if="popularProducts.length === 0" class="empty-state">
          <el-empty description="暂无数据" />
        </div>
      </div>
      
      <!-- 积分消耗趋势 -->
      <div class="trend-card">
        <h2>积分消耗趋势</h2>
        <div class="trend-controls">
          <el-radio-group v-model="granularity" @change="loadTrend">
            <el-radio-button label="DAY">按日</el-radio-button>
            <el-radio-button label="WEEK">按周</el-radio-button>
            <el-radio-button label="MONTH">按月</el-radio-button>
          </el-radio-group>
        </div>
        <div class="trend-chart">
          <div v-if="trendData.length === 0" class="empty-state">
            <el-empty description="暂无趋势数据" />
          </div>
          <div v-else class="trend-list">
            <div v-for="item in trendData" :key="item.period" class="trend-item">
              <div class="trend-period">{{ item.period }}</div>
              <div class="trend-bar">
                <div class="trend-bar-fill" :style="{ width: getTrendWidth(item.points) + '%' }"></div>
              </div>
              <div class="trend-value">{{ item.points }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 导出对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出报表"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportFormat">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="pdf">PDF</el-radio>
            <el-radio label="csv">CSV</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">确定导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'

const loading = ref(false)
const dateRange = ref([
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
  new Date() // 现在
])
const granularity = ref('DAY')
const exportDialogVisible = ref(false)
const exportFormat = ref('excel')

const exchangeStats = ref({
  totalOrders: 0,
  totalAmount: 0,
  totalPoints: 0,
  averageAmount: 0
})

const popularProducts = ref([])
const trendData = ref([])

onMounted(() => {
  loadData()
})

const loadData = async () => {
  await Promise.all([
    loadExchangeStatistics(),
    loadPopularProducts(),
    loadTrend()
  ])
}

const loadExchangeStatistics = async () => {
  loading.value = true
  try {
    const [startTime, endTime] = dateRange.value
    const response = await request.get('/reports/exchange-statistics', {
      params: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      }
    })
    exchangeStats.value = response.data || {}
  } catch (error) {
    console.error('加载兑换统计失败:', error)
    ElMessage.error('加载兑换统计失败')
  } finally {
    loading.value = false
  }
}

const loadPopularProducts = async () => {
  try {
    const [startTime, endTime] = dateRange.value
    const response = await request.get('/reports/popular-products', {
      params: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        limit: 10
      }
    })
    popularProducts.value = response.data || []
  } catch (error) {
    console.error('加载热门商品失败:', error)
    ElMessage.error('加载热门商品失败')
  }
}

const loadTrend = async () => {
  try {
    const [startTime, endTime] = dateRange.value
    const response = await request.get('/reports/points-consumption-trend', {
      params: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        granularity: granularity.value
      }
    })
    trendData.value = response.data || []
  } catch (error) {
    console.error('加载趋势数据失败:', error)
    ElMessage.error('加载趋势数据失败')
  }
}

const getTrendWidth = (points) => {
  if (trendData.value.length === 0) return 0
  const maxPoints = Math.max(...trendData.value.map(item => item.points))
  return maxPoints > 0 ? (points / maxPoints) * 100 : 0
}

const exportReport = () => {
  exportDialogVisible.value = true
}

const confirmExport = async () => {
  try {
    const [startTime, endTime] = dateRange.value
    const url = `/reports/export/${exportFormat.value}`
    
    const response = await request.get(url, {
      params: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      },
      responseType: 'blob'
    })
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    
    const extensions = {
      excel: 'xlsx',
      pdf: 'pdf',
      csv: 'csv'
    }
    link.download = `report.${extensions[exportFormat.value]}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    ElMessage.success('导出成功')
    exportDialogVisible.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.admin-reports-page {
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
  align-items: center;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.reports-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.statistics-card,
.popular-products-card,
.trend-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.statistics-card h2,
.popular-products-card h2,
.trend-card h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #409eff;
}

.empty-state {
  padding: 20px;
}

.trend-controls {
  margin-bottom: 20px;
}

.trend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trend-period {
  width: 120px;
  font-size: 14px;
  color: #606266;
}

.trend-bar {
  flex: 1;
  height: 24px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.trend-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #66b1ff);
  transition: width 0.3s;
}

.trend-value {
  width: 80px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

@media (max-width: 768px) {
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
