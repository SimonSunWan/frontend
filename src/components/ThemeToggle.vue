<template>
  <el-icon class="theme-toggle" @click="themeStore.toggleTheme">
    <Sunny v-if="themeStore.isDark" />
    <Moon v-else />
  </el-icon>
</template>

<script setup>
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<style lang="scss" scoped>
.theme-toggle {
  font-size: 20px;
  cursor: pointer;
  color: #fff;

  &:hover {
    color: #e6f0ff;
  }
}
</style>
