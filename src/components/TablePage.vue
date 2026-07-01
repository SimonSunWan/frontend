<template>
  <div class="table-page">
    <!-- 搜索区域 -->
    <el-card v-if="$slots.search" class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <slot name="search" :form="searchForm" />
        <el-form-item>
          <el-button type="primary" @click="$emit('search')">搜索</el-button>
          <el-button @click="$emit('reset')">重置</el-button>
          <slot name="search-extra" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <div v-if="$slots['table-header']" class="table-header">
        <slot name="table-header" />
      </div>
      <el-table
        v-loading="loading"
        :data="data"
        :row-key="rowKey"
        :tree-props="treeProps"
        :stripe="stripe"
        :border="border"
        :default-expand-all="defaultExpandAll"
      >
        <slot />
      </el-table>

      <div v-if="showPagination" class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="pageSizes"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  data: { type: Array, default: () => [] },
  // 搜索表单数据
  searchForm: { type: Object, default: () => ({}) },
  // 分页
  pagination: { type: Object, default: null },
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] },
  // 表格
  rowKey: { type: String, default: 'id' },
  treeProps: { type: Object, default: () => ({ children: 'children' }) },
  stripe: { type: Boolean, default: true },
  border: { type: Boolean, default: true },
  defaultExpandAll: { type: Boolean, default: false },
})

const emit = defineEmits(['search', 'reset', 'page-change', 'size-change', 'current-change'])

const showPagination = !!props.pagination

// 本地分页代理
const pagination = reactive({
  current: props.pagination?.current || 1,
  size: props.pagination?.size || 10,
  total: props.pagination?.total || 0,
})

watch(
  () => props.pagination,
  (val) => {
    if (val) {
      pagination.current = val.current
      pagination.size = val.size
      pagination.total = val.total
    }
  },
  { deep: true },
)

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  emit('size-change', size)
  emit('page-change', { current: pagination.current, size })
}

const handleCurrentChange = (current) => {
  pagination.current = current
  emit('current-change', current)
  emit('page-change', { current, size: pagination.size })
}
</script>

<style lang="scss" scoped>
.table-page {
  .search-card {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding-bottom: 0;
    }
  }

  .table-card {
    .table-header {
      margin-bottom: 16px;
    }

    .pagination {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
  }
}
</style>
