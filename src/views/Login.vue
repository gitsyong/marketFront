<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>YUJU 员工福利商城</h2>
      <p class="subtitle">登录系统</p>
    </el-card>
  </div>
</template>

<script setup>
// Login page component
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 20px;
}

h2 {
  text-align: center;
  color: #409eff;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #909399;
  margin-bottom: 30px;
}
</style>
