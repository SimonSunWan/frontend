<template>
  <el-card class="auth-card" shadow="always">
    <template #header>
      <div class="header-title">
        <img src="/favicon.ico" alt="logo" class="header-logo" />
        <span>极简设计运营平台</span>
      </div>
    </template>
    <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
      <el-form-item prop="userName">
        <el-input v-model="form.userName" placeholder="请输入用户名" size="large" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
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
        登录
      </el-button>
      <div class="footer">
        <p>
          <el-button link type="primary" @click="emit('switch', 'forget')">忘记密码</el-button>
          <el-divider direction="vertical" />
          <el-button link type="primary" @click="emit('switch', 'register')">立即注册</el-button>
        </p>
      </div>
    </template>
  </el-card>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['switch'])
const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const form = ref({ userName: '', password: '' })
const loading = ref(false)

const rules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  authStore
    .login(form.value)
    .then(() => {
      ElMessage.success({ message: '登录成功', customClass: 'login-success-message' })
      router.push('/')
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}
</script>
