<template>
  <div class="role-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable />
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
        <el-button type="primary" @click="showDialog('add')">新增角色</el-button>
        <el-button :icon="Refresh" circle @click="loadData" />
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="roleName" label="角色名称" show-overflow-tooltip>
          <template #default="{ row }">{{ row.roleName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="roleCode" label="角色编码" show-overflow-tooltip>
          <template #default="{ row }">{{ row.roleCode || '-' }}</template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip>
          <template #default="{ row }">{{ row.description || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'primary' : 'info'">
              {{ row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="showPermissionDialog(row)">菜单权限</el-button>
            <el-button type="primary" link @click="showDialog('edit', row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
      align-center
    >
      <el-form ref="formRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="dialogForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="dialogForm.roleCode" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="dialogForm.description"
            type="textarea"
            placeholder="请输入角色描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialogForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 菜单权限弹窗 -->
    <el-dialog
      v-model="permissionVisible"
      title="菜单权限"
      width="500px"
      align-center
    >
      <el-scrollbar height="60vh">
        <el-tree
          ref="treeRef"
          :key="`tree-${currentRole?.id || 'new'}`"
          :data="menuTreeData"
          show-checkbox
          node-key="id"
          check-strictly
          default-expand-all
          :props="defaultProps"
          @check="handleTreeCheck"
        >
          <template #default="{ data }">
            <div class="tree-node">
              <span>{{ data.name }}</span>
              <el-tag :type="getMenuTypeTag(data)" size="small" class="node-tag">
                {{ getMenuTypeText(data) }}
              </el-tag>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
      <template #footer>
        <el-button @click="toggleExpandAll">
          {{ isExpandAll ? '全部收起' : '全部展开' }}
        </el-button>
        <el-button @click="toggleSelectAll">
          {{ isSelectAll ? '取消全选' : '全部选择' }}
        </el-button>
        <el-button type="primary" :loading="permLoading" @click="savePermission">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  createRoleApi,
  deleteRoleApi,
  getRoleListApi,
  getRoleMenusApi,
  updateRoleApi,
  updateRoleMenusApi,
} from '@/api/roles'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  roleName: '',
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

// 新增/编辑弹窗
const dialogVisible = ref(false)
const dialogType = ref('add')
const submitLoading = ref(false)
const formRef = ref()
const currentRoleId = ref(null)

const dialogForm = reactive({
  roleName: '',
  roleCode: '',
  description: '',
  status: true,
})

const dialogRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
}

// 权限弹窗
const permissionVisible = ref(false)
const permLoading = ref(false)
const treeRef = ref()
const currentRole = ref(null)
const menuTreeData = ref([])
const isExpandAll = ref(true)
const isSelectAll = ref(false)

const defaultProps = {
  children: 'children',
  label: (data) => data.name || '',
}

const getMenuTypeTag = (data) => {
  if (data.menuType === 'button') return 'danger'
  if (data.children?.length) {
    const hasRealMenu = data.children.some((child) => child.menuType !== 'button')
    return hasRealMenu ? 'info' : 'primary'
  }
  return data.isLink ? 'warning' : 'primary'
}

const getMenuTypeText = (data) => {
  if (data.menuType === 'button') return '权限'
  if (data.children?.length) {
    const hasRealMenu = data.children.some((child) => child.menuType !== 'button')
    return hasRealMenu ? '目录' : '菜单'
  }
  return data.isLink ? '外链' : '菜单'
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
    const res = await getRoleListApi(params)
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
  searchForm.roleName = ''
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
    roleName: '',
    roleCode: '',
    description: '',
    status: true,
  })
  currentRoleId.value = null
}

const showDialog = (type, row) => {
  dialogType.value = type
  resetDialogForm()
  if (type === 'edit' && row) {
    currentRoleId.value = row.id
    Object.assign(dialogForm, {
      roleName: row.roleName || '',
      roleCode: row.roleCode || '',
      description: row.description || '',
      status: row.status ?? true,
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await createRoleApi(dialogForm)
      ElMessage.success('新增成功')
    } else {
      await updateRoleApi(currentRoleId.value, dialogForm)
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
    await ElMessageBox.confirm('确定删除该角色吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteRoleApi(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

// 权限弹窗逻辑
const showPermissionDialog = async (role) => {
  currentRole.value = role
  permissionVisible.value = true
  await loadRoleMenus(role)
}

const loadRoleMenus = async (role) => {
  try {
    const res = await getRoleMenusApi(role.id)
    const data = res?.data || {}
    menuTreeData.value = data.menuTree || []
    const selectedIds = data.selectedIds || []
    nextTick(() => {
      treeRef.value?.setCheckedKeys(selectedIds)
    })
  } catch (error) {
    console.error(error)
    menuTreeData.value = []
  }
}

const handleTreeCheck = () => {
  // check-strictly 模式下由用户手动勾选
}

const getAllNodeKeys = (nodes) => {
  const keys = []
  const traverse = (list) => {
    list.forEach((node) => {
      if (node.id) keys.push(node.id)
      if (node.children?.length) traverse(node.children)
    })
  }
  traverse(nodes)
  return keys
}

const toggleExpandAll = () => {
  const tree = treeRef.value
  if (!tree) return
  const nodes = tree.store.nodesMap
  for (const node in nodes) {
    nodes[node].expanded = !isExpandAll.value
  }
  isExpandAll.value = !isExpandAll.value
}

const toggleSelectAll = () => {
  const tree = treeRef.value
  if (!tree) return
  if (!isSelectAll.value) {
    const allKeys = getAllNodeKeys(menuTreeData.value)
    if (allKeys.length > 0) {
      tree.setCheckedKeys(allKeys)
      isSelectAll.value = true
    }
  } else {
    tree.setCheckedKeys([])
    isSelectAll.value = false
  }
}

const savePermission = async () => {
  if (!currentRole.value) {
    ElMessage.error('请先选择角色')
    return
  }
  const tree = treeRef.value
  if (!tree) return

  const checkedKeys = tree.getCheckedKeys()
  const halfCheckedKeys = tree.getHalfCheckedKeys()
  const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

  if (allCheckedKeys.length === 0) {
    try {
      await ElMessageBox.confirm(
        '当前没有选中任何菜单权限，这将清空该角色的所有权限。确定要继续吗？',
        '确认清空权限',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      )
    } catch (error) {
      if (error === 'cancel') return
    }
  }

  permLoading.value = true
  try {
    await updateRoleMenusApi(currentRole.value.id, allCheckedKeys)
    ElMessage.success('保存成功')
    permissionVisible.value = false
  } catch (error) {
    console.error(error)
  } finally {
    permLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.role-container {
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

    .pagination {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
  }

  .tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .node-tag {
      margin-right: 10px;
    }
  }
}
</style>
