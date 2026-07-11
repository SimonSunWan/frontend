<template>
  <InsTablePage
    :loading="loading"
    :data="tableData"
    :search-form="searchForm"
    :columns="columns"
    row-key="id"
    :tree-props="{ children: 'children' }"
    @search="handleSearch"
    @reset="handleReset"
  >
    <template #search="{ form }">
      <el-form-item label="部门名称">
        <el-input v-model="form.deptName" placeholder="请输入部门名称" clearable />
      </el-form-item>
    </template>

    <template #search-extra>
      <el-button type="primary" @click="showDialog('add', null)">新增</el-button>
    </template>

    <template #leaders="{ row }">
      {{ row.leaderNames?.length ? row.leaderNames.join('、') : '-' }}
    </template>
    <template #members="{ row }">
      {{ row.memberNames?.length ? row.memberNames.join('、') : '-' }}
    </template>
    <template #status="{ row }">
      <el-tag :type="row.status ? 'primary' : 'info'">
        {{ row.status ? '启用' : '禁用' }}
      </el-tag>
    </template>
    <template #action="{ row }">
      <el-button type="primary" link @click="showDialog('add', row)">新增子级</el-button>
      <el-button type="primary" link @click="showDialog('edit', row)">编辑</el-button>
      <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
    </template>
  </InsTablePage>

  <!-- 新增/编辑抽屉 -->
  <InsDrawer
    v-model="dialogVisible"
    :type="dialogType"
    :loading="submitLoading"
    @submit="handleSubmit"
  >
    <el-form ref="formRef" :model="dialogForm" :rules="dialogRules" label-width="100px">
      <el-row :gutter="16">
        <el-col v-if="parentDeptName" :span="12">
          <el-form-item label="父部门">
            <el-input :model-value="parentDeptName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model="dialogForm.deptName" clearable placeholder="请输入部门名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number
              v-model="dialogForm.sortOrder"
              :min="1"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人" prop="leaderIds">
            <el-select
              v-model="dialogForm.leaderIds"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              clearable
              placeholder="请选择负责人"
              style="width: 100%"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.nickName || user.userName"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门成员" prop="memberIds">
            <el-select
              v-model="dialogForm.memberIds"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              clearable
              placeholder="请选择部门成员"
              style="width: 100%"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.nickName || user.userName"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="启用状态">
            <el-switch v-model="dialogForm.status" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </InsDrawer>
</template>

<script setup>
import InsTablePage from '@/components/InsCrud/index.vue'
import InsDrawer from '@/components/InsCrud/InsDrawer.vue'
import {
  createDepartmentApi,
  deleteDepartmentApi,
  getDepartmentListApi,
  updateDepartmentApi,
} from '@/api/department'
import { getUserListApi } from '@/api/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const tableData = ref([])

const columns = [
  { prop: 'deptName', label: '部门名称', showOverflowTooltip: true },
  { label: '负责人', minWidth: 120, showOverflowTooltip: true, slotName: 'leaders' },
  { label: '部门成员', minWidth: 120, showOverflowTooltip: true, slotName: 'members' },
  { label: '状态', width: 80, align: 'center', slotName: 'status' },
  { prop: 'sortOrder', label: '排序', width: 80, align: 'center' },
  { label: '操作', width: 200, fixed: 'right', align: 'center', slotName: 'action' },
]

const searchForm = reactive({
  deptName: '',
})

// 弹窗
const dialogVisible = ref(false)
const dialogType = ref('add')
const submitLoading = ref(false)
const formRef = ref()
const currentDeptId = ref(null)
const currentParentId = ref(null)
const userOptions = ref([])

const dialogForm = reactive({
  deptName: '',
  parentId: null,
  sortOrder: 1,
  leaderIds: [],
  memberIds: [],
  status: true,
})

const dialogRules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
}

const parentDeptName = computed(() => {
  if (!currentParentId.value) return ''
  const find = (list) => {
    for (const item of list) {
      if (item.id === currentParentId.value) return item.deptName
      if (item.children?.length) {
        const found = find(item.children)
        if (found) return found
      }
    }
    return ''
  }
  return find(tableData.value)
})

const loadData = () => {
  loading.value = true
  const params = {}
  if (searchForm.deptName) params.deptName = searchForm.deptName
  getDepartmentListApi(params)
    .then((res) => {
      tableData.value = res?.data?.records || []
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}

const loadUserOptions = () => {
  getUserListApi({ current: 1, size: 1000 })
    .then((res) => {
      userOptions.value = res?.data?.records || []
    })
    .catch(() => {})
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.deptName = ''
  loadData()
}

const resetDialogForm = () => {
  Object.assign(dialogForm, {
    deptName: '',
    parentId: null,
    sortOrder: 1,
    leaderIds: [],
    memberIds: [],
    status: true,
  })
  currentDeptId.value = null
  currentParentId.value = null
}

const showDialog = (type, row) => {
  dialogType.value = type
  resetDialogForm()
  if (type === 'add' && row) {
    currentParentId.value = row.id
  } else if (type === 'edit' && row) {
    currentDeptId.value = row.id
    Object.assign(dialogForm, {
      deptName: row.deptName || '',
      parentId: row.parentId || null,
      sortOrder: row.sortOrder ?? 1,
      leaderIds: row.leaderIds || [],
      memberIds: row.memberIds || [],
      status: row.status ?? true,
    })
  }
  loadUserOptions()
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  const data = { ...dialogForm }
  if (dialogType.value === 'add' && currentParentId.value) data.parentId = currentParentId.value
  const apiCall =
    dialogType.value === 'add'
      ? createDepartmentApi(data)
      : updateDepartmentApi(currentDeptId.value, dialogForm)
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
  ElMessageBox.confirm(`确定删除部门${row.deptName}吗？`, '删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => deleteDepartmentApi(row.id))
    .then(() => {
      ElMessage.success('删除成功')
      loadData()
    })
    .catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
