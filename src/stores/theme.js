import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'theme-mode'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  const applyTheme = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // 初始化主题（读取本地缓存，避免刷新闪烁应在 mount 前调用）
  const initTheme = () => {
    isDark.value = localStorage.getItem(STORAGE_KEY) === 'dark'
    applyTheme()
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  return { isDark, initTheme, toggleTheme }
})
