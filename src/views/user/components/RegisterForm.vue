<template>
  <el-card class="user-card" shadow="always">
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
          clearable
        />
      </el-form-item>
      <el-form-item prop="nickName">
        <el-input
          v-model="form.nickName"
          placeholder="请输入姓名"
          size="large"
          autocomplete="off"
          clearable
        />
      </el-form-item>
      <el-form-item prop="phone">
        <el-input
          v-model="form.phone"
          clearable
          placeholder="请输入手机号"
          size="large"
          autocomplete="off"
        />
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
          clearable
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
          clearable
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item prop="systemCode">
        <el-input
          v-model="form.systemCode"
          placeholder="请输入系统码"
          size="large"
          autocomplete="off"
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
import { registerApi } from '@/api/user'
import {
  createConfirmPasswordRule,
  nickNameRule,
  passwordRule,
  phoneRule,
  userNameRule,
} from '@/utils/validators'
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

const rules = {
  userName: userNameRule,
  nickName: nickNameRule,
  phone: phoneRule,
  password: passwordRule,
  confirmPassword: createConfirmPasswordRule(() => form.password),
  systemCode: [{ required: true, message: '请输入系统码', trigger: 'blur' }],
}

const handleRegister = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  registerApi({
    userName: form.userName,
    nickName: form.nickName,
    phone: form.phone,
    password: form.password,
    systemCode: form.systemCode,
  })
    .then(() => {
      ElMessage.success('保存成功, 请等待超级管理员审核')
      setTimeout(() => {
        emit('switch', 'login')
      }, 1000)
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}
</script>
