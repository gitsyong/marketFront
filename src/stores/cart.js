import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])

  const cartCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPoints = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + (item.pointsRequired * item.quantity)
    }, 0)
  })

  const addToCart = (item) => {
    const existingItem = cartItems.value.find(i => i.id === item.id)
    if (existingItem) {
      existingItem.quantity += item.quantity
    } else {
      cartItems.value.push(item)
    }
  }

  const removeFromCart = (itemId) => {
    const index = cartItems.value.findIndex(i => i.id === itemId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  }

  const updateQuantity = (itemId, quantity) => {
    const item = cartItems.value.find(i => i.id === itemId)
    if (item) {
      item.quantity = quantity
    }
  }

  const clearCart = () => {
    cartItems.value = []
  }

  return {
    cartItems,
    cartCount,
    totalPoints,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})
