<template>
  <div class="products-page">
    <h1>商品列表</h1>
    
    <!-- 搜索和过滤表单 -->
    <div class="search-filter-section">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="请输入商品名称"
            clearable
            class="search-input"
          />
        </el-form-item>
        
        <el-form-item label="分类">
          <el-select 
            v-model="searchForm.category" 
            placeholder="请选择分类"
            clearable
            class="filter-select"
          >
            <el-option label="全部" value="" />
            <el-option label="电子产品" value="电子产品" />
            <el-option label="生活用品" value="生活用品" />
            <el-option label="食品饮料" value="食品饮料" />
            <el-option label="图书文具" value="图书文具" />
            <el-option label="运动户外" value="运动户外" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select 
            v-model="searchForm.tags" 
            placeholder="请选择标签"
            multiple
            clearable
            class="filter-select"
          >
            <el-option label="热门" value="热门" />
            <el-option label="新品" value="新品" />
            <el-option label="推荐" value="推荐" />
            <el-option label="限时" value="限时" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 商品列表 -->
    <div class="product-list">
      <Loading v-if="loading" />
      
      <div v-else-if="products.length === 0" class="empty">
        <el-empty description="暂无商品" />
      </div>
      
      <div v-else>
        <div class="product-grid">
          <div 
            v-for="product in products" 
            :key="product.id" 
            class="product-item product-card"
            :data-product-id="product.id"
            @click="viewProduct(product.id)"
          >
            <div class="product-image-wrapper">
              <img :src="getMainImage(product)" :alt="product.name" class="product-image" />
              <div v-if="!product.inStock" class="out-of-stock-badge">缺货</div>
              <div v-if="product.isHot" class="hot-badge">热门</div>
              <div v-if="product.isNew" class="new-badge">新品</div>
            </div>
            
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              
              <div v-if="product.tags && product.tags.length > 0" class="product-tags">
                <el-tag 
                  v-for="tag in product.tags" 
                  :key="tag" 
                  size="small"
                  class="product-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
              
              <div class="product-footer">
                <div class="product-points">{{ product.basePoints }} 积分</div>
                <div v-if="product.totalStock !== undefined" class="product-stock">
                  库存: {{ product.totalStock }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页组件 -->
        <div class="pagination-wrapper">
          <Pagination
            :current-page="pagination.pageNum"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'
import Pagination from '@/components/Common/Pagination.vue'

const router = useRouter()
const products = ref([])
const loading = ref(true)

const searchForm = ref({
  keyword: '',
  category: '',
  tags: []
})

const pagination = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

onMounted(async () => {
  await loadProducts()
})

async function loadProducts() {
  try {
    loading.value = true
    
    const requestData = {
      keyword: searchForm.value.keyword || undefined,
      category: searchForm.value.category || undefined,
      tags: searchForm.value.tags.length > 0 ? searchForm.value.tags : undefined,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    }
    
    const response = await request.post('/products/search', requestData)
    
    if (response && response.success && response.data) {
      products.value = response.data.records || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.value.pageNum = 1
  loadProducts()
}

function handleReset() {
  searchForm.value = {
    keyword: '',
    category: '',
    tags: []
  }
  pagination.value.pageNum = 1
  loadProducts()
}

function handlePageChange(page) {
  pagination.value.pageNum = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function viewProduct(productId) {
  if (!productId) {
    console.error('Product ID is missing!')
    return
  }
  router.push(`/product/${productId}`)
}

function getMainImage(product) {
  if (product.mainImage) return product.mainImage
  if (product.images && product.images.length > 0) return product.images[0]
  return 'https://via.placeholder.com/300x300?text=No+Image'
}
</script>

<style scoped>
.products-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.search-filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-input {
  width: 250px;
}

.filter-select {
  width: 200px;
}

.product-list {
  min-height: 400px;
}

.empty {
  text-align: center;
  padding: 60px 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-item {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.product-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-4px);
  border-color: #409eff;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.out-of-stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(245, 108, 108, 0.9);
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.hot-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 87, 34, 0.9);
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.new-badge {
  position: absolute;
  top: 45px;
  right: 10px;
  background: rgba(76, 175, 80, 0.9);
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  min-height: 39px;
}

.product-tags {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.product-tag {
  font-size: 12px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.product-points {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.product-stock {
  font-size: 13px;
  color: #999;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
