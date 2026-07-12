<template>
  <div class="mine-container">
    <div class="mine-layout">
      <div class="mine-left">
        <el-card shadow="never" class="profile-card">
          <el-image :src="mineBg" fit="cover" class="profile-header" />
          <div class="profile-meta">
            <div class="meta-item">
              <span class="meta-label">
                <el-icon><User /></el-icon>
              </span>
              <span class="meta-value">{{ baseForm.userName || '-' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">
                <el-icon><Postcard /></el-icon>
              </span>
              <span class="meta-value">{{ baseForm.nickName || '-' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">
                <el-icon><Iphone /></el-icon>
              </span>
              <span class="meta-value">{{ baseForm.phone || '-' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">
                <el-icon><OfficeBuilding /></el-icon>
              </span>
              <span class="meta-value">
                <template v-if="departments.length">
                  <el-tag
                    v-for="d in departments"
                    :key="d"
                    size="small"
                    effect="plain"
                    class="meta-tag"
                  >
                    {{ d }}
                  </el-tag>
                </template>
                <span v-else>-</span>
              </span>
            </div>
            <div class="meta-item meta-item--full">
              <span class="meta-label">
                <el-icon><Service /></el-icon>
              </span>
              <span class="meta-value">
                <template v-if="roleNames.length">
                  <el-tag
                    v-for="r in roleNames"
                    :key="r"
                    size="small"
                    type="primary"
                    effect="plain"
                    class="meta-tag"
                  >
                    {{ r }}
                  </el-tag>
                </template>
                <span v-else>-</span>
              </span>
            </div>
          </div>
        </el-card>
      </div>

      <div class="mine-right">
        <el-card shadow="never" class="info-card">
          <el-form ref="baseFormRef" :model="baseForm" :rules="baseRules" label-width="100px">
            <InsSectionTitle title="基本信息" />
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="baseForm.userName" clearable placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="姓名" prop="nickName">
              <el-input v-model="baseForm.nickName" clearable placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="baseForm.phone" clearable placeholder="请输入手机号" />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="info-footer">
              <el-button type="primary" :loading="baseLoading" @click="handleBaseSave">
                保存
              </el-button>
            </div>
          </template>
        </el-card>

        <el-card shadow="never" class="info-card pwd-card">
          <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px">
            <InsSectionTitle title="修改密码" />
            <el-form-item label="原密码" prop="password">
              <el-input
                v-model="pwdForm.password"
                type="password"
                show-password
                clearable
                autocomplete="new-password"
                placeholder="请输入原密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="pwdForm.newPassword"
                type="password"
                show-password
                clearable
                autocomplete="new-password"
                placeholder="请输入新密码"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="pwdForm.confirmPassword"
                type="password"
                show-password
                clearable
                autocomplete="new-password"
                placeholder="请再次输入新密码"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="info-footer">
              <el-button type="primary" :loading="pwdLoading" @click="handlePwdSave">
                保存
              </el-button>
            </div>
          </template>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import mineBg from '@/assets/images/mine-bg.png'
import { Iphone, OfficeBuilding, Postcard, Service, User } from '@element-plus/icons-vue'
import { changePasswordApi, updateUserInfoApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import InsSectionTitle from '@/components/InsSectionTitle.vue'
import {
  createConfirmPasswordRule,
  nickNameRule,
  passwordRule,
  phoneRule,
  userNameRule,
} from '@/utils/validators'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const roleNames = ref([])

const departments = ref([])

const baseLoading = ref(false)
const baseFormRef = ref()
const baseForm = reactive({
  userName: '',
  nickName: '',
  phone: '',
})

const pwdLoading = ref(false)
const pwdFormRef = ref()
const pwdForm = reactive({
  password: '',
  newPassword: '',
  confirmPassword: '',
})

const baseRules = {
  userName: userNameRule,
  nickName: nickNameRule,
  phone: phoneRule,
}

const pwdRules = {
  password: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: passwordRule,
  confirmPassword: createConfirmPasswordRule(() => pwdForm.newPassword),
}

const loadUserInfo = () => {
  authStore
    .getUserInfo()
    .then((data) => {
      if (data) {
        baseForm.userName = data.userName || ''
        baseForm.nickName = data.nickName || ''
        baseForm.phone = data.phone || ''
        roleNames.value = Array.isArray(data.roleNames) ? data.roleNames : []
        const dept = data.departments
        departments.value = Array.isArray(dept) ? dept : dept ? [dept] : []
      }
    })
    .catch(() => {})
}

const handleBaseSave = async () => {
  const valid = await baseFormRef.value.validate().catch(() => false)
  if (!valid) return
  baseLoading.value = true
  updateUserInfoApi({
    userName: baseForm.userName,
    nickName: baseForm.nickName,
    phone: baseForm.phone,
  })
    .then(() => loadUserInfo())
    .then(() => {
      ElMessage.success('保存成功')
    })
    .catch(() => {})
    .finally(() => {
      baseLoading.value = false
    })
}

const handlePwdSave = async () => {
  const valid = await pwdFormRef.value.validate().catch(() => false)
  if (!valid) return
  pwdLoading.value = true
  changePasswordApi({
    currentPassword: pwdForm.password,
    newPassword: pwdForm.newPassword,
  })
    .then(() => {
      ElMessage.success('保存成功, 请重新登录')
      authStore.logout()
      router.push('/auth/login')
    })
    .catch(() => {})
    .finally(() => {
      pwdLoading.value = false
    })
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.mine-container {
  height: 100%;
  overflow-y: auto;
  padding-right: var(--ins-spacing-lg);
  margin-right: calc(-1 * var(--ins-spacing-lg));

  .mine-layout {
    display: flex;
    align-items: stretch;
    gap: var(--ins-spacing-lg);

    .mine-left {
      width: 424px;
      flex-shrink: 0;
    }

    .mine-right {
      flex: 1;
      min-width: 0;
    }
  }

  .profile-card {
    height: 100%;

    :deep(.el-card__body) {
      padding: 0;
      overflow: hidden;
    }

    .profile-header {
      display: block;
      width: 424px;
      margin: 0;
      border-radius: var(--ins-radius-lg) var(--ins-radius-lg) 0 0;

      :deep(.el-image__inner) {
        width: 100%;
        height: auto;
        display: block;
      }
    }

    .profile-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      padding: var(--ins-spacing-lg) 0;

      .meta-item {
        display: flex;
        align-items: flex-start;
        gap: var(--ins-spacing-xs);
        padding: 0 var(--ins-spacing-lg) var(--ins-spacing-lg) var(--ins-spacing-lg);
      }

      .meta-label {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--ins-font-size-xl);
        font-size: var(--ins-font-size-xl);
        color: var(--ins-color-primary);
      }

      .meta-value {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ins-spacing-xs);
        font-size: var(--ins-font-size-sm);
        color: var(--ins-text-regular);
        font-weight: var(--ins-font-weight-regular);
      }

      .meta-tag {
        margin: 0;
      }

      .meta-item--full {
        grid-column: 1 / -1;
      }
    }
  }

  .pwd-card {
    margin-top: var(--ins-spacing-lg);
  }

  .info-card {
    :deep(.el-card__body) {
      padding-bottom: 0;
    }

    .info-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--ins-spacing-sm);
    }
  }
}
</style>
