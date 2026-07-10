<template>
  <div class="auth-container">
    <transition name="card-switch" mode="out-in">
      <component :is="currentComponent" @switch="handleSwitch" />
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ForgetForm from './components/ForgetForm.vue'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'

const route = useRoute()
const router = useRouter()

const pathToMode = {
  '/auth/login': 'login',
  '/auth/register': 'register',
  '/auth/forget': 'forget',
}
const modeToPath = {
  login: '/auth/login',
  register: '/auth/register',
  forget: '/auth/forget',
}
const componentMap = {
  login: LoginForm,
  register: RegisterForm,
  forget: ForgetForm,
}

const mode = ref(pathToMode[route.path] || 'login')
const currentComponent = computed(() => componentMap[mode.value])

watch(
  () => route.path,
  (path) => {
    if (pathToMode[path]) mode.value = pathToMode[path]
  },
)

const handleSwitch = (target) => {
  if (!componentMap[target]) return
  mode.value = target
  const path = modeToPath[target]
  if (path && route.path !== path) router.replace(path)
}
</script>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url('@/assets/images/login-bg.png') no-repeat center center / cover;

  :deep(.auth-card) {
    width: 450px;
    border-radius: 8px;
    overflow: hidden;

    .el-card__body {
      padding-bottom: 0;
    }

    .header-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 500;

      .header-logo {
        width: 24px;
        height: 24px;
      }
    }

    /* 去除浏览器自动填充的淡蓝色背景 */
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
      box-shadow: 0 0 0 1000px #fff inset !important;
      -webkit-text-fill-color: var(--el-text-color-regular) !important;
      caret-color: var(--el-text-color-regular);
      transition: background-color 5000s ease-in-out 0s;
    }

    .footer {
      text-align: center;
      margin-top: 12px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

/* 卡片切换动画 */
.card-switch-enter-active,
.card-switch-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.card-switch-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.card-switch-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
