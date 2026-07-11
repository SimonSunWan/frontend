<template>
  <div class="mine-container">
    <el-card class="info-card" shadow="never">
      <template #header>基本设置</template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="86px">
        <el-row>
          <el-form-item label="用户名" prop="userName">
            <el-input v-model="form.userName" :disabled="!isEdit" />
          </el-form-item>
          <el-form-item label="姓名" prop="nickName" class="right-input">
            <el-input v-model="form.nickName" :disabled="!isEdit" />
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" :disabled="!isEdit" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email" class="right-input">
            <el-input v-model="form.email" :disabled="!isEdit" />
          </el-form-item>
        </el-row>
        <div class="form-actions">
          <el-button type="primary" :loading="loading" @click="handleEdit">
            {{ isEdit ? '保存' : '编辑' }}
          </el-button>
        </div>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>更改密码</template>
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px">
        <el-form-item label="当前密码" prop="password">
          <el-input
            v-model="pwdForm.password"
            type="password"
            :disabled="!isEditPwd"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="pwdForm.newPassword"
            type="password"
            :disabled="!isEditPwd"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="pwdForm.confirmPassword"
            type="password"
            :disabled="!isEditPwd"
            show-password
          />
        </el-form-item>
        <div class="form-actions">
          <el-button type="primary" :loading="pwdLoading" @click="handleEditPwd">
            {{ isEditPwd ? '保存' : '编辑' }}
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { changePasswordApi, updateUserInfoApi } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const authStore = useAuthStore()

const isEdit = ref(false)
const isEditPwd = ref(false)
const loading = ref(false)
const pwdLoading = ref(false)

const formRef = ref()
const pwdFormRef = ref()

const form = reactive({
  userName: '',
  nickName: '',
  email: '',
  phone: '',
})

const pwdForm = reactive({
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

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback()
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const validateNewPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/.test(value)) {
    callback(new Error('6-20位, 必须包含字母和数字'))
  } else {
    if (pwdForm.confirmPassword) {
      pwdFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== pwdForm.newPassword) {
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
}

const pwdRules = {
  password: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [{ required: true, validator: validateNewPassword, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
}

const loadUserInfo = () => {
  authStore
    .getUserInfo()
    .then((data) => {
      if (data) {
        form.userName = data.userName || ''
        form.nickName = data.nickName || ''
        form.email = data.email || ''
        form.phone = data.phone || ''
      }
    })
    .catch(() => {})
}

const handleEdit = async () => {
  if (isEdit.value) {
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    loading.value = true
    updateUserInfoApi({
      userName: form.userName,
      nickName: form.nickName,
      email: form.email,
      phone: form.phone,
    })
      .then(() => loadUserInfo())
      .then(() => {
        ElMessage.success('编辑成功')
        isEdit.value = false
      })
      .catch(() => {})
      .finally(() => {
        loading.value = false
      })
  } else {
    isEdit.value = true
  }
}

const handleEditPwd = async () => {
  if (isEditPwd.value) {
    const valid = await pwdFormRef.value.validate().catch(() => false)
    if (!valid) return
    pwdLoading.value = true
    changePasswordApi({
      currentPassword: pwdForm.password,
      newPassword: pwdForm.newPassword,
    })
      .then(() => {
        ElMessage.success('密码修改成功')
        isEditPwd.value = false
        pwdForm.password = ''
        pwdForm.newPassword = ''
        pwdForm.confirmPassword = ''
      })
      .catch(() => {})
      .finally(() => {
        pwdLoading.value = false
      })
  } else {
    isEditPwd.value = true
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.mine-container {
  .info-card {
    margin-bottom: 16px;
  }
}
</style>
