<template>
  <div class="forget-container">
    <el-card class="forget-card" shadow="always">
      <template #header>忘记密码</template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleReset"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="系统码" prop="systemCode">
          <el-input v-model="form.systemCode" placeholder="请输入系统码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          type="primary"
          size="large"
          style="width: 100%"
          :loading="loading"
          @click="handleReset"
        >
          重置密码
        </el-button>
        <el-button size="large" style="width: 100%; margin-top: 8px" @click="toLogin">
          返回登录
        </el-button>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { forgetPasswordApi } from '@/api/users'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  newPassword: '',
  confirmPassword: '',
  systemCode: '',
})

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/.test(value)) {
    callback(new Error('6-20位, 必须包含字母和数字'))
  } else {
    if (form.confirmPassword) {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  newPassword: [{ required: true, validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
  systemCode: [{ required: true, message: '请输入系统码', trigger: 'blur' }],
}

const handleReset = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await forgetPasswordApi({
      username: form.username,
      newPassword: form.newPassword,
      systemCode: form.systemCode,
    })
    ElMessage.success('密码重置成功')
    setTimeout(() => {
      router.push('/auth/login')
    }, 1000)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const toLogin = () => {
  router.push('/auth/login')
}
</script>

<style lang="scss" scoped>
.forget-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  .forget-card {
    width: 400px;
  }
}
</style>
