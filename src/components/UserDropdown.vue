<template>
  <el-popover placement="bottom-end" trigger="hover" popper-class="user-dropdown-popper">
    <template #reference>
      <div class="user-info">
        <el-text>{{ authStore.userInfo?.nickName }}</el-text>
        <el-icon><ArrowDown /></el-icon>
      </div>
    </template>
    <div class="user-menu">
      <div class="user-menu-item" @click="router.push('/system/mine')">
        <el-icon><User /></el-icon>
        <span>个人中心</span>
      </div>
      <div class="user-menu-item" @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        <span>退出系统</span>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { ArrowDown, SwitchButton, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/auth/login')
}
</script>

<style lang="scss" scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #fff;

  :deep(.el-text) {
    color: #fff;
  }
}

.user-menu {
  .user-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 4px;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background: #f5f7fa;
      color: var(--el-color-primary);
    }
  }
}
</style>

<style>
.user-dropdown-popper {
  min-width: 115px !important;
  width: 115px !important;
}
</style>
