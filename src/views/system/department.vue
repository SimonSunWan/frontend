<template>
  <div class="dept-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="部门名称">
          <el-input v-model="searchForm.deptName" placeholder="请输入部门名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <div>
          <el-button type="primary" @click="showDialog('add', null)">添加部门</el-button>
          <el-button @click="toggleExpand">{{ isExpanded ? '收起' : '展开' }}</el-button>
        </div>
        <el-button :icon="Refresh" circle @click="loadData" />
      </div>

      <el-table
        v-if="refreshTable"
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        border
        :tree-props="{ children: 'children' }"
        :default-expand-all="isExpanded"
      >
        <el-table-column prop="deptName" label="部门名称" show-overflow-tooltip />
        <el-table-column label="负责人" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.leaderNames?.length ? row.leaderNames.join('、') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="部门成员" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.memberNames?.length ? row.memberNames.join('、') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'primary' : 'info'">
              {{ row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDialog('add', row)">新增子级</el-button>
            <el-button type="primary" link @click="showDialog('edit', row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      align-center
    >
      <el-form ref="formRef" :model="dialogForm" :rules="dialogRules" label-width="100px">
        <el-form-item v-if="parentDeptName" label="父部门">
          <el-input :model-value="parentDeptName" disabled />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="dialogForm.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="负责人" prop="leaderIds">
          <el-select
            v-model="dialogForm.leaderIds"
            multiple
            filterable
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
        <el-form-item label="部门成员" prop="memberIds">
          <el-select
            v-model="dialogForm.memberIds"
            multiple
            filterable
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
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="dialogForm.sortOrder"
            :min="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="dialogForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  createDepartmentApi,
  deleteDepartmentApi,
  getDepartmentListApi,
  updateDepartmentApi,
} from '@/api/departments'
import { getUserListApi } from '@/api/users'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref([])
const tableRef = ref()
const isExpanded = ref(false)
const refreshTable = ref(true)

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

const dialogTitle = computed(() => {
  if (currentParentId.value) return '添加子部门'
  return dialogType.value === 'add' ? '添加部门' : '编辑部门'
})

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

const loadData = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchForm.deptName) params.deptName = searchForm.deptName
    const res = await getDepartmentListApi(params)
    tableData.value = res?.data?.records || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadUserOptions = async () => {
  try {
    const res = await getUserListApi({ current: 1, size: 1000 })
    userOptions.value = res?.data?.records || []
  } catch (error) {
    console.error(error)
  }
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.deptName = ''
  loadData()
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  // 通过重建表格来切换展开状态
  refreshTable.value = false
  nextTick(() => {
    refreshTable.value = true
  })
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
    // 新增子部门
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
  try {
    if (dialogType.value === 'add') {
      const data = { ...dialogForm }
      if (currentParentId.value) data.parentId = currentParentId.value
      await createDepartmentApi(data)
      ElMessage.success('新增成功')
    } else {
      await updateDepartmentApi(currentDeptId.value, dialogForm)
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
    await ElMessageBox.confirm(`确定要删除部门 "${row.deptName}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteDepartmentApi(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.dept-container {
  .search-card {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding-bottom: 2px;
    }
  }

  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
  }
}
</style>
