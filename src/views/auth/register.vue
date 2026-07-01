<template>
  <div class="register-container">
    <el-card class="register-card" shadow="always">
      <template #header>注册账号</template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleRegister"
      >
        <el-form-item label="账号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="姓名" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
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
          @click="handleRegister"
        >
          注 册
        </el-button>
        <div class="footer">
          <p>
            已有账号？
            <router-link to="/auth/login">返回登录</router-link>
          </p>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { registerApi } from '@/api/users'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  userName: '',
  nickName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  systemCode: '',
})

const validateUserName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入账号'))
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

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback()
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
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
  email: [{ validator: validateEmail, trigger: 'blur' }],
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
      email: form.email || undefined,
      password: form.password,
      systemCode: form.systemCode,
    })
    ElMessage.success('注册成功，请等待管理员审核')
    setTimeout(() => {
      router.push('/auth/login')
    }, 1000)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  .register-card {
    width: 400px;

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
