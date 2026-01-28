<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :before-close="handleClose"
  >
    <div class="dialog-content">
      <el-icon class="warning-icon" v-if="type === 'warning'"><WarningFilled /></el-icon>
      <el-icon class="info-icon" v-if="type === 'info'"><InfoFilled /></el-icon>
      <el-icon class="success-icon" v-if="type === 'success'"><SuccessFilled /></el-icon>
      <el-icon class="error-icon" v-if="type === 'error'"><CircleCloseFilled /></el-icon>
      <p class="message">{{ message }}</p>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">{{ cancelText }}</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          {{ confirmText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { WarningFilled, InfoFilled, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'warning',
    validator: (value) => ['warning', 'info', 'success', 'error'].includes(value)
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  width: {
    type: String,
    default: '30%'
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const dialogVisible = ref(props.visible)
const loading = ref(false)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleClose = () => {
  dialogVisible.value = false
  emit('cancel')
}

const handleCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}

const handleConfirm = async () => {
  loading.value = true
  try {
    await emit('confirm')
    dialogVisible.value = false
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 0;
}

.warning-icon {
  font-size: 24px;
  color: #e6a23c;
}

.info-icon {
  font-size: 24px;
  color: #909399;
}

.success-icon {
  font-size: 24px;
  color: #67c23a;
}

.error-icon {
  font-size: 24px;
  color: #f56c6c;
}

.message {
  flex: 1;
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
