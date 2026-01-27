import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const points = ref(0)

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
  }

  const setPoints = (newPoints) => {
    points.value = newPoints
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    points.value = 0
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    points,
    setToken,
    setUserInfo,
    setPoints,
    logout
  }
})
