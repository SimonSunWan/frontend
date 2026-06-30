<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <template #header>登录</template>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
        <el-form-item prop="userName">
          <el-input
            v-model="form.userName"
            placeholder="请输入账号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          type="primary"
          size="large"
          style="width: 100%"
          :loading="loading"
          @click="handleLogin"
        >
          登 录
        </el-button>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { Lock, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const form = ref({ userName: '', password: '' })
const loading = ref(false)

const rules = {
  userName: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  authStore
    .login(form.value)
    .then(() => {
      ElMessage.success('登录成功')
      router.push('/system/mine')
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  .login-card {
    width: 400px;
  }
}
</style>
