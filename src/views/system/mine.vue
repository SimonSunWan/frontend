<template>
  <div class="mine-container">
    <el-card shadow="never">
      <el-row>
        <el-col :span="12">
          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="姓名" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="原密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                show-password
                autocomplete="new-password"
                placeholder="请输入密码 (不修改密码请留空)"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="form.newPassword"
                type="password"
                show-password
                autocomplete="new-password"
                placeholder="请输入新密码 (不修改密码请留空)"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                show-password
                autocomplete="new-password"
                placeholder="请输入新密码 (不修改密码请留空)"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <template #footer>
        <div style="text-align: right">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { changePasswordApi, updateUserInfoApi } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const authStore = useAuthStore()

const loading = ref(false)

const formRef = ref()

const form = reactive({
  userName: '',
  nickName: '',
  phone: '',
  password: '',
  newPassword: '',
  confirmPassword: '',
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

const hasPwdInput = () => form.password || form.newPassword || form.confirmPassword

const validatePassword = (rule, value, callback) => {
  if (!value && (form.newPassword || form.confirmPassword)) {
    callback(new Error('请输入当前密码'))
  } else {
    callback()
  }
}

const validateNewPassword = (rule, value, callback) => {
  if (!value && (form.password || form.confirmPassword)) {
    callback(new Error('请输入新密码'))
  } else if (value && !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/.test(value)) {
    callback(new Error('6-20位, 必须包含字母和数字'))
  } else {
    if (form.confirmPassword) {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value && (form.password || form.newPassword)) {
    callback(new Error('请再次输入新密码'))
  } else if (value && value !== form.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  userName: [{ required: true, validator: validateUserName, trigger: 'blur' }],
  nickName: [{ required: true, validator: validateNickName, trigger: 'blur' }],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  newPassword: [{ validator: validateNewPassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
}

const loadUserInfo = () => {
  authStore
    .getUserInfo()
    .then((data) => {
      if (data) {
        form.userName = data.userName || ''
        form.nickName = data.nickName || ''
        form.phone = data.phone || ''
      }
    })
    .catch(() => {})
}

const handleSave = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  updateUserInfoApi({
    userName: form.userName,
    nickName: form.nickName,
    phone: form.phone,
  })
    .then(() => {
      if (hasPwdInput()) {
        return changePasswordApi({
          currentPassword: form.password,
          newPassword: form.newPassword,
        })
      }
    })
    .then(() => loadUserInfo())
    .then(() => {
      ElMessage.success('保存成功')
      form.password = ''
      form.newPassword = ''
      form.confirmPassword = ''
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}

const handleCancel = () => {
  formRef.value?.clearValidate()
  form.password = ''
  form.newPassword = ''
  form.confirmPassword = ''
  loadUserInfo()
}

onMounted(() => {
  loadUserInfo()
})
</script>
