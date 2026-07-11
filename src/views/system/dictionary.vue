<template>
  <TablePage
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
      <el-button type="primary" @click="showTypeDialog('add')">新增字典</el-button>
    </template>

    <template #status="{ row }">
      <el-tag :type="row.status ? 'primary' : 'info'">
        {{ row.status ? '启用' : '禁用' }}
      </el-tag>
    </template>
    <template #action="{ row }">
      <el-button type="primary" link @click="showEnumDialog(row)">枚举管理</el-button>
      <el-divider direction="vertical" />
      <el-button type="primary" link @click="showTypeDialog('edit', row)">编辑</el-button>
      <el-divider direction="vertical" />
      <el-button type="danger" link @click="handleDeleteType(row)">删除</el-button>
    </template>
  </TablePage>

  <!-- 字典分类抽屉 -->
  <FormDrawer
    v-model="typeDialogVisible"
    :title="typeDialogType === 'add' ? '新增字典分类' : '编辑字典分类'"
    :loading="typeSubmitLoading"
    @submit="handleTypeSubmit"
  >
    <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="字典名称" prop="name">
            <el-input v-model="typeForm.name" placeholder="请输入字典名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="字典编码" prop="code">
            <el-input v-model="typeForm.code" placeholder="请输入字典编码" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="字典描述" prop="description">
            <el-input
              v-model="typeForm.description"
              type="textarea"
              placeholder="请输入字典描述"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </FormDrawer>

  <!-- 字典枚举抽屉 -->
  <FormDrawer
    v-model="enumDialogVisible"
    :title="`${currentType?.name || ''} - 枚举管理`"
    size="700px"
  >
    <div class="enum-header">
      <el-button type="primary" @click="showEnumFormDialog('add', null)">新增枚举</el-button>
    </div>
    <el-table
      v-loading="enumLoading"
      :data="enumData"
      row-key="id"
      border
      :tree-props="{ children: 'children' }"
      default-expand-all
    >
      <el-table-column prop="dictValue" label="枚举名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="keyValue" label="枚举编码" min-width="140" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="showEnumFormDialog('add', row)"
            >新增子级</el-button
          >
          <el-divider direction="vertical" />
          <el-button type="primary" link @click="showEnumFormDialog('edit', row)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button type="danger" link @click="handleDeleteEnum(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 枚举新增/编辑表单抽屉 -->
    <FormDrawer
      v-model="enumFormDialogVisible"
      :title="enumFormDialogType === 'add' ? '新增字典枚举' : '编辑字典枚举'"
      :loading="enumSubmitLoading"
      append-to-body
      @submit="handleEnumSubmit"
    >
      <el-form ref="enumFormRef" :model="enumForm" :rules="enumRules" label-width="100px">
        <el-row :gutter="16">
          <el-col v-if="enumParentName" :span="24">
            <el-form-item label="父级枚举">
              <el-input :model-value="enumParentName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="枚举名称" prop="dictValue">
              <el-input v-model="enumForm.dictValue" placeholder="请输入枚举名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="枚举编码" prop="keyValue">
              <el-input v-model="enumForm.keyValue" placeholder="请输入枚举编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number
                v-model="enumForm.sortOrder"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </FormDrawer>
  </FormDrawer>
</template>

<script setup>
import TablePage from '@/components/TablePage.vue'
import FormDrawer from '@/components/FormDrawer.vue'
import {
  createDictionaryEnumApi,
  createDictionaryTypeApi,
  deleteDictionaryEnumApi,
  deleteDictionaryTypeApi,
  getDictionaryEnumsApi,
  getDictionaryTypesApi,
  updateDictionaryEnumApi,
  updateDictionaryTypeApi,
} from '@/api/dictionaries'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

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
  { label: '状态', width: 80, align: 'center', slotName: 'status' },
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
      ElMessage.success(typeDialogType.value === 'add' ? '新增成功' : '编辑成功')
      typeDialogVisible.value = false
      loadData()
    })
    .catch(() => {})
    .finally(() => {
      typeSubmitLoading.value = false
    })
}

const handleDeleteType = (row) => {
  ElMessageBox.confirm(`确定要删除字典分类 "${row.name}" 吗？`, '删除字典分类', {
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

// 字典枚举弹窗（列表）
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

// 枚举新增/编辑表单弹窗
const enumFormDialogVisible = ref(false)
const enumFormDialogType = ref('add')
const enumSubmitLoading = ref(false)
const enumFormRef = ref()
const currentEnumId = ref(null)
const currentEnumParentId = ref(null)

const enumForm = reactive({
  dictValue: '',
  keyValue: '',
  sortOrder: 0,
})

const enumRules = {
  dictValue: [{ required: true, message: '请输入枚举名称', trigger: 'blur' }],
  keyValue: [{ required: true, message: '请输入枚举编码', trigger: 'blur' }],
}

const enumParentName = computed(() => {
  if (!currentEnumParentId.value) return ''
  const find = (list) => {
    for (const item of list) {
      if (item.id === currentEnumParentId.value) return item.dictValue
      if (item.children?.length) {
        const found = find(item.children)
        if (found) return found
      }
    }
    return ''
  }
  return find(enumData.value)
})

const resetEnumForm = () => {
  Object.assign(enumForm, { dictValue: '', keyValue: '', sortOrder: 0 })
  currentEnumId.value = null
  currentEnumParentId.value = null
}

const showEnumFormDialog = (type, row) => {
  enumFormDialogType.value = type
  resetEnumForm()
  if (type === 'add' && row) {
    currentEnumParentId.value = row.id
  } else if (type === 'edit' && row) {
    currentEnumId.value = row.id
    Object.assign(enumForm, {
      dictValue: row.dictValue || '',
      keyValue: row.keyValue || '',
      sortOrder: row.sortOrder ?? 0,
    })
  }
  enumFormDialogVisible.value = true
}

const handleEnumSubmit = async () => {
  const valid = await enumFormRef.value.validate().catch(() => false)
  if (!valid) return
  enumSubmitLoading.value = true
  const data = { typeId: currentType.value.id, ...enumForm }
  if (enumFormDialogType.value === 'add' && currentEnumParentId.value) {
    data.parentId = currentEnumParentId.value
  }
  const apiCall =
    enumFormDialogType.value === 'add'
      ? createDictionaryEnumApi(data)
      : updateDictionaryEnumApi(currentEnumId.value, enumForm)
  apiCall
    .then(() => {
      ElMessage.success(enumFormDialogType.value === 'add' ? '新增成功' : '编辑成功')
      enumFormDialogVisible.value = false
      loadEnumData()
    })
    .catch(() => {})
    .finally(() => {
      enumSubmitLoading.value = false
    })
}

const handleDeleteEnum = (row) => {
  ElMessageBox.confirm(`确定要删除字典枚举 "${row.dictValue}" 吗？`, '删除字典枚举', {
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
  margin-bottom: 16px;
}
</style>
