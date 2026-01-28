<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>YUJU 员工福利商城</h2>
      <p class="subtitle">登录系统</p>
      
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="tips">
        <p>测试账号：</p>
        <p>员工: employee / password</p>
        <p>管理员: admin / password</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import request from '@/api/request'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    
    try {
      console.log('开始登录请求...')
      // 调用后端登录 API
      const response = await request.post('/auth/login', {
        username: loginForm.username,
        password: loginForm.password
      })
      
      console.log('登录响应:', response)
      
      if (response.success) {
        console.log('登录成功,保存token和用户信息')
        // 保存用户信息
        userStore.setToken(response.data.accessToken)
        userStore.setUserInfo(response.data.user)
        
        ElMessage.success('登录成功')
        
        console.log('准备跳转到/home')
        // 跳转到首页
        router.push('/home')
      } else {
        console.error('登录失败:', response.message)
        ElMessage.error(response.message || '登录失败')
      }
      
    } catch (error) {
      console.error('Login error:', error)
      ElMessage.error(error.response?.data?.message || '登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}
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
  width: 420px;
  padding: 40px 30px;
}

h2 {
  text-align: center;
  color: #409eff;
  margin-bottom: 10px;
  font-size: 28px;
}

.subtitle {
  text-align: center;
  color: #909399;
  margin-bottom: 40px;
  font-size: 14px;
}

.tips {
  margin-top: 20px;
  padding: 15px;
  background-color: #f4f4f5;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.tips p {
  margin: 5px 0;
}

.tips p:first-child {
  font-weight: bold;
  margin-bottom: 8px;
}
</style>
