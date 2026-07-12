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
      <el-form-item label="字典名称">
        <el-input v-model="form.name" placeholder="请输入字典名称" clearable />
      </el-form-item>
    </template>

    <template #search-extra>
      <el-button type="primary" @click="showTypeDialog('add')">新增</el-button>
    </template>

    <template #action="{ row }">
      <el-button type="primary" link @click="showEnumDialog(row)">编辑</el-button>
      <el-button type="danger" link @click="handleDeleteType(row)">删除</el-button>
    </template>
  </InsTablePage>

  <!-- 字典分类抽屉 -->
  <InsDrawer
    v-model="typeDialogVisible"
    :type="typeDialogType"
    :loading="typeSubmitLoading"
    @submit="handleTypeSubmit"
  >
    <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="字典名称" prop="name">
            <el-input v-model="typeForm.name" clearable placeholder="请输入字典名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="字典编码" prop="code">
            <el-input v-model="typeForm.code" clearable placeholder="请输入字典编码" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="字典描述" prop="description">
            <el-input
              v-model="typeForm.description"
              type="textarea"
              clearable
              placeholder="请输入字典描述"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </InsDrawer>

  <!-- 枚举抽屉 -->
  <InsDrawer v-model="enumDialogVisible" :title="`${currentType?.name || ''}`" :show-footer="false">
    <div class="enum-header">
      <el-button type="primary" @click="addEnumRoot">新增</el-button>
    </div>
    <el-table
      ref="enumTableRef"
      v-loading="enumLoading"
      :data="enumData"
      row-key="id"
      border
      class="enum-table"
      :row-class-name="enumRowClassName"
      :tree-props="{ children: 'children' }"
      default-expand-all
    >
      <el-table-column prop="dictValue" label="枚举名称" min-width="180">
        <template #default="{ row }">
          <el-input v-if="row.isEditing" v-model="row.dictValue" placeholder="请输入枚举名称" />
          <span v-else>{{ row.dictValue || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="keyValue" label="枚举编码" min-width="160">
        <template #default="{ row }">
          <el-input v-if="row.isEditing" v-model="row.keyValue" placeholder="请输入枚举编码" />
          <span v-else>{{ row.keyValue || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="100" align="center">
        <template #default="{ row }">
          <el-input-number
            v-if="row.isEditing"
            v-model="row.sortOrder"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
          <span v-else>{{ row.sortOrder }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <template v-if="row.isEditing">
            <el-button type="primary" link :loading="row.saving" @click="saveEnumRow(row)"
              >保存</el-button
            >
            <el-button type="info" link @click="cancelEnumRow(row)">取消</el-button>
          </template>
          <template v-else>
            <el-button type="primary" link @click="addEnumChild(row)">新增</el-button>
            <el-button type="primary" link @click="editEnumRow(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeleteEnum(row)">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </InsDrawer>
</template>

<script setup>
import InsTablePage from '@/components/InsCrud/index.vue'
import InsDrawer from '@/components/InsCrud/InsDrawer.vue'
import {
  createDictionaryEnumApi,
  createDictionaryTypeApi,
  deleteDictionaryEnumApi,
  deleteDictionaryTypeApi,
  getDictionaryEnumsApi,
  getDictionaryTypesApi,
  updateDictionaryEnumApi,
  updateDictionaryTypeApi,
} from '@/api/dictionary'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, onMounted, reactive, ref } from 'vue'

// 字典分类列表
const loading = ref(false)
const tableData = ref([])

const columns = [
  { type: 'index', label: '序号', width: 60, align: 'center' },
  {
    prop: 'name',
    label: '字典名称',
    showOverflowTooltip: true,
    formatter: (row) => row.name || '-',
  },
  {
    prop: 'code',
    label: '字典编码',
    showOverflowTooltip: true,
    formatter: (row) => row.code || '-',
  },
  {
    prop: 'description',
    label: '描述',
    showOverflowTooltip: true,
    formatter: (row) => row.description || '-',
  },
  { label: '操作', width: 220, fixed: 'right', align: 'center', slotName: 'action' },
]

const searchForm = reactive({
  name: '',
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const loadData = () => {
  loading.value = true
  const params = {
    current: pagination.current,
    size: pagination.size,
  }
  if (searchForm.name) params.name = searchForm.name
  getDictionaryTypesApi(params)
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
  searchForm.name = ''
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

// 字典分类弹窗
const typeDialogVisible = ref(false)
const typeDialogType = ref('add')
const typeSubmitLoading = ref(false)
const typeFormRef = ref()
const currentTypeId = ref(null)

const typeForm = reactive({
  name: '',
  code: '',
  description: '',
})

const typeRules = {
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
}

const resetTypeForm = () => {
  Object.assign(typeForm, { name: '', code: '', description: '' })
  currentTypeId.value = null
}

const showTypeDialog = (type, row) => {
  typeDialogType.value = type
  resetTypeForm()
  if (type === 'edit' && row) {
    currentTypeId.value = row.id
    Object.assign(typeForm, {
      name: row.name || '',
      code: row.code || '',
      description: row.description || '',
    })
  }
  typeDialogVisible.value = true
}

const handleTypeSubmit = async () => {
  const valid = await typeFormRef.value.validate().catch(() => false)
  if (!valid) return
  typeSubmitLoading.value = true
  const apiCall =
    typeDialogType.value === 'add'
      ? createDictionaryTypeApi(typeForm)
      : updateDictionaryTypeApi(currentTypeId.value, typeForm)
  apiCall
    .then(() => {
      ElMessage.success('保存成功')
      typeDialogVisible.value = false
      loadData()
    })
    .catch(() => {})
    .finally(() => {
      typeSubmitLoading.value = false
    })
}

const handleDeleteType = (row) => {
  ElMessageBox.confirm(`确定删除${row.name}吗？`, '删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => deleteDictionaryTypeApi(row.id))
    .then(() => {
      ElMessage.success('删除成功')
      loadData()
    })
    .catch(() => {})
}

const enumDialogVisible = ref(false)
const enumLoading = ref(false)
const enumData = ref([])
const currentType = ref(null)

const showEnumDialog = async (row) => {
  currentType.value = row
  enumDialogVisible.value = true
  await loadEnumData()
}

const loadEnumData = () => {
  if (!currentType.value) return
  enumLoading.value = true
  getDictionaryEnumsApi(currentType.value.id)
    .then((res) => {
      enumData.value = res?.data?.records || []
    })
    .catch(() => {})
    .finally(() => {
      enumLoading.value = false
    })
}

const enumTableRef = ref()

const enumRowClassName = ({ row }) => (row.isEditing ? 'is-editing-row' : '')

const addEnumRow = (parentRow) => {
  cancelEnumEdit()
  const newRow = {
    id: null,
    dictValue: '',
    keyValue: '',
    sortOrder: 0,
    parentId: parentRow ? parentRow.id : null,
    children: [],
    isEditing: true,
    isNew: true,
  }
  if (parentRow) {
    if (!parentRow.children) parentRow.children = []
    parentRow.children.push(newRow)
    nextTick(() => {
      enumTableRef.value?.toggleRowExpansion(parentRow, true)
    })
  } else {
    enumData.value.push(newRow)
  }
}

const addEnumRoot = () => addEnumRow(null)

const addEnumChild = (parentRow) => addEnumRow(parentRow)

const editEnumRow = (row) => {
  cancelEnumEdit()
  row._backup = { dictValue: row.dictValue, keyValue: row.keyValue, sortOrder: row.sortOrder }
  row.isEditing = true
  row.isNew = false
}

const removeRowFromData = (row) => {
  const removeFromList = (list) => {
    const idx = list.findIndex((item) => item === row)
    if (idx > -1) {
      list.splice(idx, 1)
      return true
    }
    return list.some((item) => item.children?.length && removeFromList(item.children))
  }
  removeFromList(enumData.value)
}

const cancelEnumRow = (row) => {
  if (row.isNew) {
    removeRowFromData(row)
    return
  }
  if (row._backup) {
    row.dictValue = row._backup.dictValue
    row.keyValue = row._backup.keyValue
    row.sortOrder = row._backup.sortOrder
    delete row._backup
  }
  row.isEditing = false
}

const cancelEnumEdit = () => {
  const cancelInList = (list) => {
    list.forEach((item) => {
      if (item.isEditing) cancelEnumRow(item)
      if (item.children?.length) cancelInList(item.children)
    })
  }
  cancelInList(enumData.value)
}

const saveEnumRow = (row) => {
  if (!row.dictValue?.trim()) {
    ElMessage.warning('请输入枚举名称')
    return
  }
  if (!row.keyValue?.trim()) {
    ElMessage.warning('请输入枚举编码')
    return
  }
  row.saving = true
  const sortOrder = row.sortOrder ?? 0
  const data = {
    typeId: currentType.value.id,
    dictValue: row.dictValue,
    keyValue: row.keyValue,
    sortOrder,
  }
  if (row.parentId) data.parentId = row.parentId
  const apiCall = row.isNew
    ? createDictionaryEnumApi(data)
    : updateDictionaryEnumApi(row.id, {
        dictValue: row.dictValue,
        keyValue: row.keyValue,
        sortOrder,
      })
  apiCall
    .then(() => {
      ElMessage.success('保存成功')
      loadEnumData()
    })
    .catch(() => {})
    .finally(() => {
      row.saving = false
    })
}

const handleDeleteEnum = (row) => {
  ElMessageBox.confirm(`确定删除${row.dictValue}吗？`, '删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => deleteDictionaryEnumApi(row.id))
    .then(() => {
      ElMessage.success('删除成功')
      loadEnumData()
    })
    .catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.enum-header {
  margin-bottom: var(--ins-spacing-md);
}
.enum-table {
  :deep(.is-editing-row) {
    .el-table__cell {
      padding: var(--ins-spacing-2xs) 0;
      .cell {
        padding: 0 var(--ins-spacing-2xs);
        .el-table__indent {
          display: none;
        }
        .el-table__placeholder {
          display: none;
        }
      }
    }
  }
}
</style>
