<template>
  <el-card class="user-card" shadow="always">
    <template #header>
      <div class="header-title">
        <img src="/favicon.ico" alt="logo" class="header-logo" />
        <span>INS DESIGN</span>
      </div>
    </template>
    <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
      <el-form-item prop="userName">
        <el-input v-model="form.userName" clearable placeholder="请输入用户名" size="large" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          size="large"
          show-password
          clearable
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
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['switch'])
const router = useRouter()
const userStore = useUserStore()
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
  userStore
    .login(form.value)
    .then(() => {
      router.push('/')
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}
</script>
