<template>
  <el-card class="auth-card" shadow="always">
    <template #header>
      <div class="header-title">
        <img src="/favicon.ico" alt="logo" class="header-logo" />
        <span>忘记密码</span>
      </div>
    </template>
    <el-form ref="formRef" :model="form" :rules="rules" autocomplete="off" @keyup.enter="handleReset">
      <el-form-item prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" size="large" autocomplete="off" />
      </el-form-item>
      <!-- 诱饵：吸收 Chrome 密码管理器的用户名自动填充 -->
      <input type="text" autocomplete="username" style="position:absolute;width:0;height:0;opacity:0;pointer-events:none" tabindex="-1" aria-hidden="true" />
      <el-form-item prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码"
          size="large"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          size="large"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item prop="systemCode">
        <el-input v-model="form.systemCode" placeholder="请输入系统码" size="large" autocomplete="off" />
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
      <div class="footer">
        <p>
          <el-button link type="primary" @click="emit('switch', 'login')">返回登录</el-button>
        </p>
      </div>
    </template>
  </el-card>
</template>

<script setup>
import { forgetPasswordApi } from '@/api/users'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

const emit = defineEmits(['switch'])
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
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
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
      emit('switch', 'login')
    }, 1000)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
