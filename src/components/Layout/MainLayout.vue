<template>
  <el-container class="main-layout">
    <AppHeader />
    <el-main class="main-content">
      <router-view />
    </el-main>
    <AppFooter />
  </el-container>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}
</style>
