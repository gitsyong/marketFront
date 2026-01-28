<template>
  <el-footer class="app-footer">
    <div class="footer-content">
      <p>&copy; 2026 YUJU 员工福利商城. All rights reserved.</p>
      <div class="footer-links">
        <a href="#">关于我们</a>
        <span class="divider">|</span>
        <a href="#">联系我们</a>
        <span class="divider">|</span>
        <a href="#">隐私政策</a>
        <span class="divider">|</span>
        <a href="#">使用条款</a>
      </div>
    </div>
  </el-footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  padding: 20px;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content p {
  margin: 0 0 10px 0;
  color: #909399;
  font-size: 14px;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.footer-links a {
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #409eff;
}

.divider {
  color: #dcdfe6;
}
</style>
