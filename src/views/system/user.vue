<template>
  <TablePage
    :loading="loading"
    :data="tableData"
    :search-form="searchForm"
    :pagination="pagination"
    @search="handleSearch"
    @reset="handleReset"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  >
    <template #search="{ form }">
      <el-form-item label="账号">
        <el-input v-model="form.userName" placeholder="请输入账号" clearable />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="form.nickName" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" clearable />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="form.roleCode" placeholder="请选择角色" clearable style="width: 160px">
          <el-option
            v-for="role in roleList"
            :key="role.value"
            :label="role.label"
            :value="role.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="请选择状态" clearable style="width: 120px">
          <el-option label="启用" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>
      </el-form-item>
    </template>

    <template #search-extra>
      <el-button type="primary" @click="showDialog('add')">新增用户</el-button>
    </template>

    <el-table-column type="index" label="序号" width="60" align="center" />
    <el-table-column prop="userName" label="账号" show-overflow-tooltip>
      <template #default="{ row }">{{ row.userName || '-' }}</template>
    </el-table-column>
    <el-table-column prop="nickName" label="姓名" show-overflow-tooltip>
      <template #default="{ row }">{{ row.nickName || '-' }}</template>
    </el-table-column>
    <el-table-column prop="phone" label="手机号" show-overflow-tooltip>
      <template #default="{ row }">{{ row.phone || '-' }}</template>
    </el-table-column>
    <el-table-column prop="email" label="邮箱" show-overflow-tooltip>
      <template #default="{ row }">{{ row.email || '-' }}</template>
    </el-table-column>
    <el-table-column label="角色名称" min-width="120">
      <template #default="{ row }">
        <template v-if="row.roleNames?.length">
          <el-tag
            v-for="name in row.roleNames"
            :key="name"
            type="info"
            size="small"
            style="margin-right: 4px"
          >
            {{ name }}
          </el-tag>
        </template>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column label="所属部门" min-width="120">
      <template #default="{ row }">
        <template v-if="row.departments?.length">
          <el-tag
            v-for="name in row.departments"
            :key="name"
            type="success"
            size="small"
            style="margin-right: 4px"
          >
            {{ name }}
          </el-tag>
        </template>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column label="状态" width="80" align="center">
      <template #default="{ row }">
        <el-tag :type="row.status ? 'primary' : 'info'">
          {{ row.status ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="120" fixed="right" align="center">
      <template #default="{ row }">
        <el-button type="primary" link @click="showDialog('edit', row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>
    </el-table-column>
  </TablePage>

  <!-- 新增/编辑弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="500px"
    align-center
  >
    <el-form ref="formRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
      <el-form-item label="账号" prop="userName">
        <el-input v-model="dialogForm.userName" placeholder="请输入账号" />
      </el-form-item>
      <el-form-item label="姓名" prop="nickName">
        <el-input v-model="dialogForm.nickName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="dialogForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dialogForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="角色" prop="roles">
        <el-select v-model="dialogForm.roles" multiple placeholder="请选择角色" style="width: 100%">
          <el-option
            v-for="role in roleList"
            :key="role.value"
            :label="role.label"
            :value="role.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch v-model="dialogForm.status" />
      </el-form-item>
      <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
        <el-input v-model="dialogForm.password" readonly placeholder="自动生成" />
        <div class="password-tip">密码规则：账号 + 手机号后4位</div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import TablePage from '@/components/TablePage.vue'
import {
  createUserApi,
  deleteUserApi,
  getUserListApi,
  updateUserApi,
} from '@/api/users'
import { getAllRolesApi } from '@/api/roles'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'

const loading = ref(false)
const tableData = ref([])
const roleList = ref([])

const searchForm = reactive({
  userName: '',
  nickName: '',
  phone: '',
  email: '',
  roleCode: '',
  status: '',
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const dialogVisible = ref(false)
const dialogType = ref('add')
const submitLoading = ref(false)
const formRef = ref()
const currentUserId = ref(null)

const dialogForm = reactive({
  userName: '',
  nickName: '',
  phone: '',
  email: '',
  password: '',
  roles: [],
  status: true,
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

const dialogRules = {
  userName: [{ required: true, validator: validateUserName, trigger: 'blur' }],
  nickName: [{ required: true, validator: validateNickName, trigger: 'blur' }],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const generatePassword = () => {
  const userName = dialogForm.userName || ''
  const phone = dialogForm.phone || ''
  dialogForm.password = userName + phone.slice(-4)
}

const loadRoleList = async () => {
  try {
    const res = await getAllRolesApi()
    if (res?.data?.records) {
      roleList.value = res.data.records.map((role) => ({
        label: role.roleName,
        value: role.roleCode,
      }))
    }
  } catch (error) {
    console.error(error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size,
      ...searchForm,
    }
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === null) delete params[key]
    })
    const res = await getUserListApi(params)
    const data = res?.data || {}
    tableData.value = data.records || []
    pagination.total = data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    userName: '',
    nickName: '',
    phone: '',
    email: '',
    roleCode: '',
    status: '',
  })
  pagination.current = 1
  loadData()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  loadData()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  loadData()
}

const resetDialogForm = () => {
  Object.assign(dialogForm, {
    userName: '',
    nickName: '',
    phone: '',
    email: '',
    password: '',
    roles: [],
    status: true,
  })
  currentUserId.value = null
}

const showDialog = (type, row) => {
  dialogType.value = type
  resetDialogForm()
  if (type === 'edit' && row) {
    currentUserId.value = row.id
    Object.assign(dialogForm, {
      userName: row.userName || '',
      nickName: row.nickName || '',
      phone: row.phone || '',
      email: row.email || '',
      roles: Array.isArray(row.roles) ? row.roles : [],
      status: row.status,
    })
  }
  dialogVisible.value = true
  loadRoleList()
}

watch(
  () => [dialogForm.userName, dialogForm.phone],
  () => {
    if (dialogType.value === 'add') {
      generatePassword()
    }
  },
)

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await createUserApi(dialogForm)
      ElMessage.success('新增成功')
    } else {
      await updateUserApi(currentUserId.value, dialogForm)
      ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.userName}" 吗？`, '删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteUserApi(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

onMounted(() => {
  loadRoleList()
  loadData()
})
</script>

<style lang="scss" scoped>
.password-tip {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
}
</style>
