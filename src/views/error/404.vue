<template>
  <div class="not-found">
    <div class="not-found__content">
      <img class="not-found__img" :src="img404" alt="404" />
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import img404 from '@/assets/images/404.png'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--ins-bg-container);
}

.not-found__content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.not-found__img {
  width: 420px;
  max-width: 80%;
}
</style>
