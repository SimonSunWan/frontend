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
      <el-form-item label="菜单名称">
        <el-input v-model="form.name" placeholder="请输入菜单名称" clearable />
      </el-form-item>
      <el-form-item label="路由地址">
        <el-input v-model="form.path" placeholder="请输入路由地址" clearable />
      </el-form-item>
    </template>

    <template #search-extra>
      <el-button type="primary" @click="showDialog('add', null)">添加菜单</el-button>
    </template>

    <template #menuType="{ row }">
      <el-tag :type="getMenuTypeTag(row)" size="small">
        {{ getMenuTypeText(row) }}
      </el-tag>
    </template>
    <template #path="{ row }">
      {{ row.isLink ? row.link || '-' : row.path || '-' }}
    </template>
    <template #authMark="{ row }">{{ row.authMark || '-' }}</template>
    <template #icon="{ row }">
      <i v-if="row.icon" class="iconfont menu-icon" :class="row.icon"></i>
      <span v-else>-</span>
    </template>
    <template #status="{ row }">
      <el-tag :type="row.isEnable ? 'primary' : 'info'">
        {{ row.isEnable ? '启用' : '禁用' }}
      </el-tag>
    </template>
    <template #action="{ row }">
      <el-button
        v-if="row.menuType !== 'button'"
        type="primary"
        link
        @click="showDialog('add', row)"
      >
        新增子级
      </el-button>
      <el-divider v-if="row.menuType !== 'button'" direction="vertical" />
      <el-button type="primary" link @click="showDialog('edit', row)">编辑</el-button>
      <el-divider direction="vertical" />
      <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
    </template>
  </InsTablePage>

  <!-- 新增/编辑抽屉 -->
  <InsDrawer
    v-model="dialogVisible"
    :title="dialogTitle"
    :loading="submitLoading"
    @submit="handleSubmit"
  >
    <el-form ref="formRef" :model="dialogForm" :rules="dialogRules" label-width="85px">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="菜单类型">
            <el-radio-group v-model="dialogForm.menuType" :disabled="dialogType === 'edit'">
              <el-radio-button value="menu">菜单</el-radio-button>
              <el-radio-button value="button">权限</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <template v-if="dialogForm.menuType === 'menu'">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="dialogForm.name" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="!dialogForm.isLink" label="路由地址" prop="path">
              <el-input v-model="dialogForm.path" placeholder="请输入路由地址" />
            </el-form-item>
            <el-form-item v-else label="外链地址" prop="link">
              <el-input v-model="dialogForm.link" placeholder="请输入外链地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图标" prop="icon">
              <InsIconPicker v-model="dialogForm.icon" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="dialogForm.sort"
                :min="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用">
              <el-switch v-model="dialogForm.isEnable" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否外链">
              <el-switch v-model="dialogForm.isLink" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="页面缓存">
              <el-switch v-model="dialogForm.isKeepAlive" />
            </el-form-item>
          </el-col>
        </template>

        <template v-if="dialogForm.menuType === 'button'">
          <el-col :span="12">
            <el-form-item label="权限名称" prop="name">
              <el-input v-model="dialogForm.name" placeholder="请输入权限名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限标识" prop="authMark">
              <el-input v-model="dialogForm.authMark" placeholder="请输入权限标识" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="dialogForm.sort"
                :min="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用">
              <el-switch v-model="dialogForm.isEnable" />
            </el-form-item>
          </el-col>
        </template>
      </el-row>
    </el-form>
  </InsDrawer>
</template>

<script setup>
import InsTablePage from '@/components/InsCrud/index.vue'
import InsDrawer from '@/components/InsCrud/InsDrawer.vue'
import InsIconPicker from '@/components/InsIconPicker.vue'
import { createMenuApi, deleteMenuApi, getMenuListApi, updateMenuApi } from '@/api/menu'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const tableData = ref([])

const columns = [
  { prop: 'name', label: '菜单名称', minWidth: 160, showOverflowTooltip: true },
  { label: '菜单类型', width: 90, align: 'center', slotName: 'menuType' },
  { label: '路由地址', minWidth: 140, showOverflowTooltip: true, slotName: 'path' },
  { label: '权限标识', minWidth: 120, showOverflowTooltip: true, slotName: 'authMark' },
  { label: '图标', width: 70, align: 'center', slotName: 'icon' },
  { label: '状态', width: 80, align: 'center', slotName: 'status' },
  { prop: 'sort', label: '排序', width: 70, align: 'center' },
  { label: '操作', width: 200, fixed: 'right', align: 'center', slotName: 'action' },
]

const searchForm = reactive({
  name: '',
  path: '',
})

// 弹窗
const dialogVisible = ref(false)
const dialogType = ref('add')
const submitLoading = ref(false)
const formRef = ref()
const currentMenuId = ref(null)
const currentParentId = ref(null)

const dialogForm = reactive({
  name: '',
  path: '',
  link: '',
  icon: '',
  sort: 1,
  isEnable: true,
  isKeepAlive: true,
  isLink: false,
  menuType: 'menu',
  parentId: null,
  authMark: '',
})

const dialogRules = computed(() => {
  const rules = {}
  if (dialogForm.menuType === 'menu') {
    rules.name = [{ required: true, message: '请输入菜单名称', trigger: 'blur' }]
    if (dialogForm.isLink) {
      rules.link = [{ required: true, message: '请输入外链地址', trigger: 'blur' }]
    } else {
      rules.path = [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
    }
  } else {
    rules.name = [{ required: true, message: '请输入权限名称', trigger: 'blur' }]
    rules.authMark = [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
  }
  return rules
})

const dialogTitle = computed(() => {
  if (currentParentId.value) return '新建子菜单'
  if (dialogType.value === 'edit') {
    return `编辑${dialogForm.menuType === 'menu' ? '菜单' : '权限'}`
  }
  return '新建菜单'
})

const getMenuTypeTag = (row) => {
  if (row.menuType === 'button') return 'danger'
  if (row.children?.length) {
    const hasRealMenu = row.children.some((child) => child.menuType !== 'button')
    return hasRealMenu ? 'info' : 'primary'
  }
  return row.isLink ? 'warning' : 'primary'
}

const getMenuTypeText = (row) => {
  if (row.menuType === 'button') return '权限'
  if (row.children?.length) {
    const hasRealMenu = row.children.some((child) => child.menuType !== 'button')
    return hasRealMenu ? '目录' : '菜单'
  }
  return row.isLink ? '外链' : '菜单'
}

const loadData = () => {
  loading.value = true
  const params = {}
  if (searchForm.name) params.name = searchForm.name
  if (searchForm.path) params.path = searchForm.path
  getMenuListApi(params)
    .then((res) => {
      tableData.value = res?.data?.records || []
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}

const handleSearch = () => {
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.path = ''
  loadData()
}

const resetDialogForm = () => {
  Object.assign(dialogForm, {
    name: '',
    path: '',
    link: '',
    icon: '',
    sort: 1,
    isEnable: true,
    isKeepAlive: true,
    isLink: false,
    menuType: 'menu',
    parentId: null,
    authMark: '',
  })
  currentMenuId.value = null
  currentParentId.value = null
}

const showDialog = (type, row) => {
  dialogType.value = type
  resetDialogForm()
  if (type === 'add' && row) {
    currentParentId.value = row.id
  } else if (type === 'edit' && row) {
    currentMenuId.value = row.id
    Object.assign(dialogForm, {
      name: row.name || '',
      path: row.path || '',
      link: row.link || '',
      icon: row.icon || '',
      sort: row.sort ?? 1,
      isEnable: row.isEnable ?? true,
      isKeepAlive: row.isKeepAlive ?? true,
      isLink: row.isLink ?? false,
      menuType: row.menuType || 'menu',
      parentId: row.parentId || null,
      authMark: row.authMark || '',
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  const isButton = dialogForm.menuType === 'button'
  const data = {
    name: dialogForm.name,
    path: isButton ? null : dialogForm.isLink ? null : dialogForm.path,
    icon: isButton ? null : dialogForm.icon,
    sort: dialogForm.sort,
    isKeepAlive: isButton ? true : dialogForm.isKeepAlive,
    link: isButton ? null : dialogForm.isLink ? dialogForm.link : null,
    isLink: isButton ? false : dialogForm.isLink,
    isEnable: dialogForm.isEnable,
    menuType: dialogForm.menuType,
    authMark: isButton ? dialogForm.authMark : null,
  }
  if (dialogType.value === 'add' && currentParentId.value) data.parentId = currentParentId.value
  const apiCall =
    dialogType.value === 'add' ? createMenuApi(data) : updateMenuApi(currentMenuId.value, data)
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
  ElMessageBox.confirm(`确定要删除"${row.name}"吗？删除后无法恢复`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => deleteMenuApi(row.id))
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

<style lang="scss" scoped>
.menu-icon {
  font-size: 18px;
  color: var(--el-text-color-regular);
}
</style>
