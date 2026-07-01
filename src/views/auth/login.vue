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
        <div class="form-extra">
          <el-checkbox v-model="form.rememberPassword">记住密码</el-checkbox>
          <router-link to="/auth/forget-password" class="forget-link">忘记密码？</router-link>
        </div>
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
        <div class="footer">
          <p>
            还没有账号？
            <router-link to="/auth/register">立即注册</router-link>
          </p>
        </div>
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
const form = ref({ userName: '', password: '', rememberPassword: true })
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
      router.push('/')
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

    .form-extra {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .forget-link {
        color: var(--el-color-primary);
        text-decoration: none;
        font-size: 14px;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .footer {
      text-align: center;
      margin-top: 12px;
      font-size: 14px;
      color: var(--el-text-color-secondary);

      a {
        color: var(--el-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
