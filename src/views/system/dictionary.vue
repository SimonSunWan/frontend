<template>
  <div class="dict-container">
    <div class="dict-content">
      <!-- 左侧字典分类 -->
      <el-card class="left-panel" shadow="never">
        <template #header>
          <div class="card-header">
            <span>字典分类</span>
            <el-button type="primary" @click="showTypeDialog('add')">新增分类</el-button>
          </div>
        </template>

        <el-input
          v-model="typeSearch"
          placeholder="请输入字典名称"
          clearable
          style="margin-bottom: 12px"
          @input="handleTypeSearch"
        />

        <el-table
          v-loading="typeLoading"
          :data="typeData"
          border
          highlight-current-row
          @row-click="selectType"
        >
          <el-table-column prop="name" label="字典名称" show-overflow-tooltip />
          <el-table-column prop="code" label="字典编码" width="120" show-overflow-tooltip />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click.stop="showTypeDialog('edit', row)">编辑</el-button>
              <el-button type="danger" link @click.stop="handleDeleteType(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="typePagination.current"
            v-model:page-size="typePagination.size"
            :total="typePagination.total"
            layout="prev, pager, next"
            small
            @current-change="loadTypeData"
          />
        </div>
      </el-card>

      <!-- 右侧字典枚举 -->
      <el-card class="right-panel" shadow="never">
        <template #header>
          <div class="card-header">
            <span>字典枚举</span>
            <div v-if="selectedType" class="header-actions">
              <el-button @click="toggleExpand">{{ isExpanded ? '收起' : '展开' }}</el-button>
              <el-button type="primary" @click="showEnumDialog('add', null)">新增枚举</el-button>
            </div>
          </div>
        </template>

        <template v-if="selectedType">
          <el-table
            v-if="refreshTable"
            v-loading="enumLoading"
            :data="enumData"
            row-key="id"
            border
            :tree-props="{ children: 'children' }"
            :default-expand-all="isExpanded"
          >
            <el-table-column prop="dictValue" label="枚举名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="keyValue" label="枚举编码" min-width="140" show-overflow-tooltip />
            <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click="showEnumDialog('add', row)">新增子级</el-button>
                <el-button type="primary" link @click="showEnumDialog('edit', row)">编辑</el-button>
                <el-button type="danger" link @click="handleDeleteEnum(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
        <el-empty v-else description="请选择左侧字典分类" />
      </el-card>
    </div>

    <!-- 字典分类弹窗 -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="typeDialogType === 'add' ? '新增字典分类' : '编辑字典分类'"
      width="500px"
      align-center
    >
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="typeForm.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典编码" prop="code">
          <el-input v-model="typeForm.code" placeholder="请输入字典编码" />
        </el-form-item>
        <el-form-item label="字典描述" prop="description">
          <el-input
            v-model="typeForm.description"
            type="textarea"
            placeholder="请输入字典描述"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="typeSubmitLoading" @click="handleTypeSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 字典枚举弹窗 -->
    <el-dialog
      v-model="enumDialogVisible"
      :title="enumDialogType === 'add' ? '新增字典枚举' : '编辑字典枚举'"
      width="500px"
      align-center
    >
      <el-form ref="enumFormRef" :model="enumForm" :rules="enumRules" label-width="100px">
        <el-form-item v-if="enumParentName" label="父级枚举">
          <el-input :model-value="enumParentName" disabled />
        </el-form-item>
        <el-form-item label="枚举名称" prop="dictValue">
          <el-input v-model="enumForm.dictValue" placeholder="请输入枚举名称" />
        </el-form-item>
        <el-form-item label="枚举编码" prop="keyValue">
          <el-input v-model="enumForm.keyValue" placeholder="请输入枚举编码" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="enumForm.sortOrder"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="enumDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="enumSubmitLoading" @click="handleEnumSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
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
import { computed, nextTick, onMounted, reactive, ref } from 'vue'

// 左侧字典分类
const typeLoading = ref(false)
const typeData = ref([])
const typeSearch = ref('')
const selectedType = ref(null)

const typePagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

const loadTypeData = async () => {
  typeLoading.value = true
  try {
    const params = {
      current: typePagination.current,
      size: typePagination.size,
    }
    if (typeSearch.value) params.name = typeSearch.value
    const res = await getDictionaryTypesApi(params)
    const data = res?.data || {}
    typeData.value = data.records || []
    typePagination.total = data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    typeLoading.value = false
  }
}

const handleTypeSearch = () => {
  typePagination.current = 1
  loadTypeData()
}

const selectType = (type) => {
  selectedType.value = type
  loadEnumData()
}

// 右侧字典枚举
const enumLoading = ref(false)
const enumData = ref([])
const isExpanded = ref(false)
const refreshTable = ref(true)

const loadEnumData = async () => {
  if (!selectedType.value) return
  enumLoading.value = true
  try {
    const res = await getDictionaryEnumsApi(selectedType.value.id)
    enumData.value = res?.data?.records || []
  } catch (error) {
    console.error(error)
  } finally {
    enumLoading.value = false
  }
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  refreshTable.value = false
  nextTick(() => {
    refreshTable.value = true
  })
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
  Object.assign(typeForm, {
    name: '',
    code: '',
    description: '',
  })
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
  try {
    if (typeDialogType.value === 'add') {
      await createDictionaryTypeApi(typeForm)
      ElMessage.success('新增成功')
    } else {
      await updateDictionaryTypeApi(currentTypeId.value, typeForm)
      ElMessage.success('编辑成功')
    }
    typeDialogVisible.value = false
    loadTypeData()
  } catch (error) {
    console.error(error)
  } finally {
    typeSubmitLoading.value = false
  }
}

const handleDeleteType = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除字典分类 "${row.name}" 吗？`, '删除字典分类', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteDictionaryTypeApi(row.id)
    ElMessage.success('删除成功')
    if (selectedType.value?.id === row.id) {
      selectedType.value = null
      enumData.value = []
    }
    loadTypeData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

// 字典枚举弹窗
const enumDialogVisible = ref(false)
const enumDialogType = ref('add')
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
  Object.assign(enumForm, {
    dictValue: '',
    keyValue: '',
    sortOrder: 0,
  })
  currentEnumId.value = null
  currentEnumParentId.value = null
}

const showEnumDialog = (type, row) => {
  if (!selectedType.value) {
    ElMessage.warning('请先选择字典分类')
    return
  }
  enumDialogType.value = type
  resetEnumForm()
  if (type === 'add' && row) {
    // 新增子级
    currentEnumParentId.value = row.id
  } else if (type === 'edit' && row) {
    currentEnumId.value = row.id
    Object.assign(enumForm, {
      dictValue: row.dictValue || '',
      keyValue: row.keyValue || '',
      sortOrder: row.sortOrder ?? 0,
    })
  }
  enumDialogVisible.value = true
}

const handleEnumSubmit = async () => {
  const valid = await enumFormRef.value.validate().catch(() => false)
  if (!valid) return
  enumSubmitLoading.value = true
  try {
    if (enumDialogType.value === 'add') {
      const data = {
        typeId: selectedType.value.id,
        ...enumForm,
      }
      if (currentEnumParentId.value) data.parentId = currentEnumParentId.value
      await createDictionaryEnumApi(data)
      ElMessage.success('新增成功')
    } else {
      await updateDictionaryEnumApi(currentEnumId.value, enumForm)
      ElMessage.success('编辑成功')
    }
    enumDialogVisible.value = false
    loadEnumData()
  } catch (error) {
    console.error(error)
  } finally {
    enumSubmitLoading.value = false
  }
}

const handleDeleteEnum = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除字典枚举 "${row.dictValue}" 吗？`, '删除字典枚举', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteDictionaryEnumApi(row.id)
    ElMessage.success('删除成功')
    loadEnumData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

onMounted(() => {
  loadTypeData()
})
</script>

<style lang="scss" scoped>
.dict-container {
  .dict-content {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .left-panel {
    width: 420px;
    flex-shrink: 0;

    .pagination {
      display: flex;
      justify-content: center;
      margin-top: 12px;
    }
  }

  .right-panel {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
}

@media (max-width: 992px) {
  .dict-container {
    .dict-content {
      flex-direction: column;

      .left-panel {
        width: 100%;
      }
    }
  }
}
</style>
