<template>
  <el-card class="auth-card" shadow="always">
    <template #header>
      <div class="header-title">
        <img src="/favicon.ico" alt="logo" class="header-logo" />
        <span>注册</span>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      autocomplete="off"
      @keyup.enter="handleRegister"
    >
      <el-form-item prop="userName">
        <el-input
          v-model="form.userName"
          placeholder="请输入用户名"
          size="large"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item prop="nickName">
        <el-input
          v-model="form.nickName"
          placeholder="请输入姓名"
          size="large"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" size="large" autocomplete="off" />
      </el-form-item>
      <!-- 诱饵：吸收 Chrome 密码管理器的用户名自动填充，避免账号被填入手机号 -->
      <input
        type="text"
        autocomplete="username"
        style="position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none"
        tabindex="-1"
        aria-hidden="true"
      />
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          size="large"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          size="large"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item prop="systemCode">
        <el-input
          v-model="form.systemCode"
          placeholder="请输入系统码"
          size="large"
          autocomplete="off"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button
        type="primary"
        size="large"
        style="width: 100%"
        :loading="loading"
        @click="handleRegister"
      >
        注册
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
import { registerApi } from '@/api/users'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

const emit = defineEmits(['switch'])
const formRef = ref()
const loading = ref(false)

const form = reactive({
  userName: '',
  nickName: '',
  phone: '',
  password: '',
  confirmPassword: '',
  systemCode: '',
})

const validateUserName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!/^[a-zA-Z][a-zA-Z0-9_]{3,19}$/.test(value)) {
    callback(new Error('字母开头, 4-20位, 支持字母、数字、下划线'))
  } else {
    callback()
  }
}

const validateNickName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入姓名'))
  } else if (!/^[\u4e00-\u9fa5a-zA-Z\s]{2,20}$/.test(value)) {
    callback(new Error('2-20位, 支持中文、英文字母、空格'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
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
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  userName: [{ required: true, validator: validateUserName, trigger: 'blur' }],
  nickName: [{ required: true, validator: validateNickName, trigger: 'blur' }],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
  systemCode: [{ required: true, message: '请输入系统码', trigger: 'blur' }],
}

const handleRegister = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await registerApi({
      userName: form.userName,
      nickName: form.nickName,
      phone: form.phone,
      password: form.password,
      systemCode: form.systemCode,
    })
    ElMessage.success('注册成功，请等待管理员审核')
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
