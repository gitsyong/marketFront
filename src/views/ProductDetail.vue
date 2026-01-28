<template>
  <div class="product-detail-page">
    <Loading v-if="loading" />
    
    <div v-else-if="product" class="product-detail">
      <!-- 返回按钮 -->
      <el-button @click="goBack" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        返回商品列表
      </el-button>
      
      <div class="product-content">
        <!-- 左侧：商品图片 -->
        <div class="product-images">
          <div class="main-image-wrapper">
            <img :src="currentImage" :alt="product.name" class="main-image" />
            <div v-if="!product.inStock" class="out-of-stock-overlay">
              <div class="out-of-stock-text">缺货</div>
            </div>
          </div>
          
          <div v-if="product.images && product.images.length > 1" class="image-thumbnails">
            <img 
              v-for="(image, index) in product.images" 
              :key="index"
              :src="image"
              :alt="`${product.name} - ${index + 1}`"
              class="thumbnail"
              :class="{ active: currentImage === image }"
              @click="currentImage = image"
            />
          </div>
        </div>
        
        <!-- 右侧：商品信息 -->
        <div class="product-info-section">
          <div class="product-header">
            <h1 class="product-title">{{ product.name }}</h1>
            <div class="product-badges">
              <el-tag v-if="product.isHot" type="danger" size="small">热门</el-tag>
              <el-tag v-if="product.isNew" type="success" size="small">新品</el-tag>
              <el-tag v-if="product.isRecommended" type="warning" size="small">推荐</el-tag>
            </div>
          </div>
          
          <div class="product-tags" v-if="product.tags && product.tags.length > 0">
            <el-tag 
              v-for="tag in product.tags" 
              :key="tag" 
              size="small"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </div>
          
          <div class="product-description">
            <p>{{ product.description }}</p>
          </div>
          
          <div class="product-price-section">
            <div class="price-item">
              <span class="price-label">所需积分：</span>
              <span class="price-value points">{{ product.basePoints }} 积分</span>
            </div>
            <div v-if="product.cashPrice && product.cashPrice > 0" class="price-item">
              <span class="price-label">现金价格：</span>
              <span class="price-value cash">¥{{ product.cashPrice }}</span>
            </div>
          </div>
          
          <!-- SKU选择 -->
          <div v-if="product.skus && product.skus.length > 0" class="sku-section">
            <h3 class="section-title">选择规格</h3>
            <div class="sku-list">
              <div 
                v-for="sku in product.skus" 
                :key="sku.id"
                class="sku-item"
                :class="{ 
                  active: selectedSku?.id === sku.id,
                  disabled: sku.stock === 0
                }"
                @click="selectSku(sku)"
              >
                <div class="sku-name">{{ sku.skuName }}</div>
                <div class="sku-stock">库存: {{ sku.stock }}</div>
                <div v-if="sku.stock === 0" class="sku-out-of-stock">缺货</div>
              </div>
            </div>
          </div>
          
          <!-- 库存信息 -->
          <div class="stock-section">
            <span class="stock-label">库存：</span>
            <span class="stock-value" :class="{ 'out-of-stock': !product.inStock }">
              {{ selectedSku ? selectedSku.stock : product.totalStock }}
            </span>
          </div>
          
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button 
              type="primary" 
              size="large"
              :disabled="!canAddToCart"
              @click="addToCart"
              class="add-to-cart-btn"
            >
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            
            <el-button 
              v-if="!product.inStock"
              size="large"
              @click="subscribeOutOfStock"
              class="subscribe-btn"
            >
              <el-icon><Bell /></el-icon>
              缺货通知
            </el-button>
          </div>
          
          <!-- 商品统计信息 -->
          <div class="product-stats">
            <div class="stat-item">
              <span class="stat-label">销量：</span>
              <span class="stat-value">{{ product.salesCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">浏览：</span>
              <span class="stat-value">{{ product.viewCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="error-message">
      <el-empty description="商品不存在" />
      <el-button @click="goBack">返回商品列表</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ShoppingCart, Bell } from '@element-plus/icons-vue'
import request from '@/api/request'
import Loading from '@/components/Common/Loading.vue'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const currentImage = ref('')
const selectedSku = ref(null)

const canAddToCart = computed(() => {
  if (!product.value) return false
  if (!product.value.inStock) return false
  if (product.value.skus && product.value.skus.length > 0) {
    return selectedSku.value && selectedSku.value.stock > 0
  }
  return product.value.totalStock > 0
})

onMounted(async () => {
  await loadProductDetail()
})

async function loadProductDetail() {
  try {
    loading.value = true
    const productId = route.params.id
    
    const response = await request.get(`/products/${productId}`)
    
    if (response && response.success && response.data) {
      product.value = response.data
      currentImage.value = getMainImage(product.value)
      
      // 如果只有一个SKU，自动选中
      if (product.value.skus && product.value.skus.length === 1) {
        selectedSku.value = product.value.skus[0]
      }
    }
  } catch (error) {
    console.error('加载商品详情失败:', error)
    ElMessage.error('加载商品详情失败')
  } finally {
    loading.value = false
  }
}

function selectSku(sku) {
  if (sku.stock === 0) {
    ElMessage.warning('该规格已缺货')
    return
  }
  selectedSku.value = sku
}

async function addToCart() {
  if (!canAddToCart.value) {
    ElMessage.warning('该商品暂时无法加入购物车')
    return
  }
  
  try {
    const cartItem = {
      productId: product.value.id,
      productName: product.value.name,
      productImage: currentImage.value,
      skuId: selectedSku.value?.id,
      skuName: selectedSku.value?.skuName,
      points: product.value.basePoints,
      cashPrice: product.value.cashPrice,
      quantity: 1
    }
    
    await cartStore.addToCart(cartItem)
    ElMessage.success('已加入购物车')
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败')
  }
}

async function subscribeOutOfStock() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (!userInfo.id) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }
    
    const requestData = {
      userId: userInfo.id,
      productId: product.value.id,
      skuId: selectedSku.value?.id
    }
    
    // 调用后端API订阅缺货通知
    // 注意：这个API可能需要在后端实现
    ElMessage.success('订阅成功，补货后将通知您')
  } catch (error) {
    console.error('订阅失败:', error)
    ElMessage.error('订阅失败')
  }
}

function goBack() {
  router.push('/products')
}

function getMainImage(product) {
  if (product.mainImage) return product.mainImage
  if (product.images && product.images.length > 0) return product.images[0]
  return 'https://via.placeholder.com/600x600?text=No+Image'
}
</script>

<style scoped>
.product-detail-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 20px;
}

.product-detail {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

/* 左侧图片区域 */
.product-images {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.out-of-stock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.out-of-stock-text {
  font-size: 48px;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.image-thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 2px solid #e8e8e8;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.thumbnail:hover {
  border-color: #409eff;
}

.thumbnail.active {
  border-color: #409eff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
}

/* 右侧信息区域 */
.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.product-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.product-badges {
  display: flex;
  gap: 8px;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  font-size: 13px;
}

.product-description {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  line-height: 1.6;
  color: #666;
}

.product-price-section {
  padding: 20px;
  background: #fff7e6;
  border-radius: 8px;
  border: 1px solid #ffd591;
}

.price-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.price-item:last-child {
  margin-bottom: 0;
}

.price-label {
  font-size: 16px;
  color: #666;
  margin-right: 10px;
}

.price-value {
  font-size: 24px;
  font-weight: bold;
}

.price-value.points {
  color: #409eff;
}

.price-value.cash {
  color: #f56c6c;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.sku-section {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.sku-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.sku-item {
  padding: 15px;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
  text-align: center;
}

.sku-item:hover:not(.disabled) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.sku-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.sku-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.sku-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.sku-stock {
  font-size: 13px;
  color: #999;
}

.sku-out-of-stock {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 5px;
  font-weight: bold;
}

.stock-section {
  padding: 15px;
  background: #f0f9ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
}

.stock-label {
  font-size: 16px;
  color: #666;
  margin-right: 10px;
}

.stock-value {
  font-size: 20px;
  font-weight: bold;
  color: #52c41a;
}

.stock-value.out-of-stock {
  color: #f56c6c;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.add-to-cart-btn,
.subscribe-btn {
  flex: 1;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
}

.product-stats {
  display: flex;
  gap: 30px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-right: 8px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.error-message {
  text-align: center;
  padding: 60px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-content {
    grid-template-columns: 1fr;
  }
  
  .main-image-wrapper {
    height: 350px;
  }
  
  .product-title {
    font-size: 22px;
  }
}
</style>
