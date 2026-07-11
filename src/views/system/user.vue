<template>
  <InsTablePage
    :loading="loading"
    :data="tableData"
    :search-form="searchForm"
    :columns="columns"
    :pagination="pagination"
    @search="handleSearch"
    @reset="handleReset"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  >
    <template #search="{ form }">
      <el-form-item label="用户名">
        <el-input v-model="form.userName" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="form.nickName" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" clearable />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="form.roleCode" placeholder="请选择角色" clearable>
          <el-option
            v-for="role in roleList"
            :key="role.value"
            :label="role.label"
            :value="role.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="请选择状态" clearable>
          <el-option label="启用" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>
      </el-form-item>
    </template>

    <template #search-extra>
      <el-button type="primary" @click="showDialog('add')">新增用户</el-button>
    </template>

    <template #roleNames="{ row }">
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
    <template #departments="{ row }">
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
    <template #status="{ row }">
      <el-tag :type="row.status ? 'primary' : 'info'">
        {{ row.status ? '启用' : '禁用' }}
      </el-tag>
    </template>
    <template #action="{ row }">
      <el-button type="primary" link @click="showDialog('edit', row)">编辑</el-button>
      <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
    </template>
  </InsTablePage>

  <!-- 新增/编辑抽屉 -->
  <InsDrawer
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    :loading="submitLoading"
    @submit="handleSubmit"
  >
    <el-form ref="formRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户名" prop="userName">
            <el-input v-model="dialogForm.userName" placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" prop="nickName">
            <el-input v-model="dialogForm.nickName" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="dialogForm.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="角色" prop="roles">
            <el-select
              v-model="dialogForm.roles"
              multiple
              placeholder="请选择角色"
              style="width: 100%"
            >
              <el-option
                v-for="role in roleList"
                :key="role.value"
                :label="role.label"
                :value="role.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-switch v-model="dialogForm.status" />
          </el-form-item>
        </el-col>
        <el-col v-if="dialogType === 'add'" :span="24">
          <el-form-item label="密码" prop="password">
            <el-input v-model="dialogForm.password" readonly placeholder="自动生成" />
            <div class="password-tip">密码规则：用户名 + 手机号后4位</div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </InsDrawer>
</template>

<script setup>
import InsTablePage from '@/components/InsCrud/index.vue'
import InsDrawer from '@/components/InsCrud/InsDrawer.vue'
import { createUserApi, deleteUserApi, getUserListApi, updateUserApi } from '@/api/auth'
import { getAllRolesApi } from '@/api/role'
import { nickNameRule, phoneRule, userNameRule } from '@/utils/validators'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'

const loading = ref(false)
const tableData = ref([])
const roleList = ref([])

const columns = [
  { type: 'index', label: '序号', width: 60, align: 'center' },
  {
    prop: 'userName',
    label: '用户名',
    showOverflowTooltip: true,
    formatter: (row) => row.userName || '-',
  },
  {
    prop: 'nickName',
    label: '姓名',
    showOverflowTooltip: true,
    formatter: (row) => row.nickName || '-',
  },
  {
    prop: 'phone',
    label: '手机号',
    showOverflowTooltip: true,
    formatter: (row) => row.phone || '-',
  },
  { label: '角色名称', minWidth: 120, slotName: 'roleNames' },
  { label: '所属部门', minWidth: 120, slotName: 'departments' },
  { label: '状态', width: 80, align: 'center', slotName: 'status' },
  { label: '操作', width: 120, fixed: 'right', align: 'center', slotName: 'action' },
]

const searchForm = reactive({
  userName: '',
  nickName: '',
  phone: '',
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
  password: '',
  roles: [],
  status: true,
})

const dialogRules = {
  userName: userNameRule,
  nickName: nickNameRule,
  phone: phoneRule,
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const generatePassword = () => {
  const userName = dialogForm.userName || ''
  const phone = dialogForm.phone || ''
  dialogForm.password = userName + phone.slice(-4)
}

const loadRoleList = () => {
  getAllRolesApi()
    .then((res) => {
      if (res?.data?.records) {
        roleList.value = res.data.records.map((role) => ({
          label: role.roleName,
          value: role.roleCode,
        }))
      }
    })
    .catch(() => {})
}

const loadData = () => {
  loading.value = true
  const params = {
    current: pagination.current,
    size: pagination.size,
    ...searchForm,
  }
  Object.keys(params).forEach((key) => {
    if (params[key] === '' || params[key] === null) delete params[key]
  })
  getUserListApi(params)
    .then((res) => {
      const data = res?.data || {}
      tableData.value = data.records || []
      pagination.total = data.total || 0
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
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
  const apiCall =
    dialogType.value === 'add'
      ? createUserApi(dialogForm)
      : updateUserApi(currentUserId.value, dialogForm)
  apiCall
    .then(() => {
      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '编辑成功')
      dialogVisible.value = false
      loadData()
    })
    .catch(() => {})
    .finally(() => {
      submitLoading.value = false
    })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.userName}" 吗？`, '删除用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => deleteUserApi(row.id))
    .then(() => {
      ElMessage.success('删除成功')
      loadData()
    })
    .catch(() => {})
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
