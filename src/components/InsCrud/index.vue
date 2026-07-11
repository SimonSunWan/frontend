<template>
  <div class="table-page">
    <InsTableSearch :search-form="searchForm" @search="$emit('search')" @reset="$emit('reset')">
      <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
        <slot :name="name" v-bind="scope" />
      </template>
    </InsTableSearch>

    <InsTable
      :loading="loading"
      :data="data"
      :columns="columns"
      :pagination="pagination"
      :page-sizes="pageSizes"
      :row-key="rowKey"
      :tree-props="treeProps"
      :stripe="stripe"
      :border="border"
      :default-expand-all="defaultExpandAll"
      @page-change="$emit('page-change', $event)"
      @size-change="$emit('size-change', $event)"
      @current-change="$emit('current-change', $event)"
    >
      <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
        <slot :name="name" v-bind="scope" />
      </template>
    </InsTable>
  </div>
</template>

<script setup>
import InsTableSearch from './InsTableSearch.vue'
import InsTable from './InsTable.vue'

defineOptions({ name: 'InsTablePage' })

const props = defineProps({
  loading: { type: Boolean, default: false },
  data: { type: Array, default: () => [] },
  // 搜索
  searchForm: { type: Object, default: () => ({}) },
  // 分页
  pagination: { type: Object, default: null },
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] },
  // 表格
  rowKey: { type: String, default: 'id' },
  treeProps: { type: Object, default: () => ({ children: 'children' }) },
  stripe: { type: Boolean, default: true },
  border: { type: Boolean, default: false },
  defaultExpandAll: { type: Boolean, default: false },
  // 列配置
  columns: { type: Array, default: () => [] },
})

defineEmits(['search', 'reset', 'page-change', 'size-change', 'current-change'])
</script>

<style lang="scss" scoped>
.table-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
