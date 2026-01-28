<template>
  <div class="admin-products-page">
    <div class="page-header">
      <h1>商品管理</h1>
      <el-button type="primary" @click="showCreateDialog">创建商品</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <Loading />
    </div>
    
    <div v-else class="product-table-container">
      <el-table :data="products" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="basePoints" label="积分" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ONLINE' ? 'success' : 'info'">
              {{ row.status === 'ONLINE' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="100">
          <template #default="{ row }">
            {{ getTotalStock(row) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editProduct(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 'ONLINE' ? 'warning' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 'ONLINE' ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteProduct(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="products.length === 0" class="empty-state">
        <el-empty description="暂无商品" />
      </div>
    </div>
    
    <!-- 创建/编辑商品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '创建商品'"
      width="600px"
    >
      <el-form :model="productForm" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="productForm.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="基础积分">
          <el-input-number v-model="productForm.basePoints" :min="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="productForm.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="productForm.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="productForm.imageUrl" placeholder="请输入图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProduct">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'

const loading = ref(false)
const products = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const productForm = ref({
  id: null,
  name: '',
  category: '',
  basePoints: 0,
  description: '',
  tags: '',
  imageUrl: '',
  skus: []
})

onMounted(() => {
  loadProducts()
})

const loadProducts = async () => {
  loading.value = true
  try {
    const response = await request.post('/products/search', {
      pageNum: 1,
      pageSize: 100
    })
    products.value = response.data.records || []
  } catch (error) {
    console.error('加载商品失败:', error)
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

const getTotalStock = (product) => {
  if (!product.skus || product.skus.length === 0) return 0
  return product.skus.reduce((sum, sku) => sum + (sku.inventory || 0), 0)
}

const showCreateDialog = () => {
  isEdit.value = false
  productForm.value = {
    id: null,
    name: '',
    category: '',
    basePoints: 0,
    description: '',
    tags: '',
    imageUrl: '',
    skus: []
  }
  dialogVisible.value = true
}

const editProduct = (product) => {
  isEdit.value = true
  productForm.value = {
    id: product.id,
    name: product.name,
    category: product.category,
    basePoints: product.basePoints,
    description: product.description || '',
    tags: product.tags ? product.tags.join(',') : '',
    imageUrl: product.imageUrl || '',
    skus: product.skus || []
  }
  dialogVisible.value = true
}

const saveProduct = async () => {
  try {
    const data = {
      ...productForm.value,
      tags: productForm.value.tags ? productForm.value.tags.split(',').map(t => t.trim()) : []
    }
    
    if (isEdit.value) {
      await request.put(`/products/${productForm.value.id}`, data)
      ElMessage.success('更新成功')
    } else {
      await request.post('/products', data)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    await loadProducts()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

const toggleStatus = async (product) => {
  try {
    if (product.status === 'ONLINE') {
      await request.put(`/products/${product.id}/offline`)
      ElMessage.success('下架成功')
    } else {
      await request.put(`/products/${product.id}/online`)
      ElMessage.success('上架成功')
    }
    await loadProducts()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}

const deleteProduct = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${product.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await request.delete(`/products/${product.id}`)
    ElMessage.success('删除成功')
    await loadProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.admin-products-page {
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

.product-table-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.empty-state {
  padding: 40px;
}
</style>
