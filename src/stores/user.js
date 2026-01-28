import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const points = ref(parseInt(localStorage.getItem('points') || '0'))

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const setPoints = (newPoints) => {
    points.value = newPoints
    localStorage.setItem('points', newPoints.toString())
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    points.value = 0
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('points')
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
