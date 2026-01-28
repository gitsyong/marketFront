<template>
  <div class="error-container" v-if="visible">
    <el-alert
      :title="title"
      :type="type"
      :description="description"
      :closable="closable"
      :center="center"
      show-icon
      @close="handleClose"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '错误'
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['success', 'warning', 'info', 'error'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  center: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const visible = ref(true)

const handleClose = () => {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.error-container {
  margin: 20px 0;
}
</style>
