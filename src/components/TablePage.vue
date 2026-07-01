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
        <!-- 基于 columns 配置自动渲染列 -->
        <template v-if="columns?.length">
          <table-column
            v-for="(col, idx) in columns"
            :key="col.key || col.prop || col.type || col.label || idx"
            :col="col"
          >
            <template
              v-for="name in slotNames"
              :key="name"
              #[name]="slotProps"
            >
              <slot :name="name" v-bind="slotProps" />
            </template>
          </table-column>
        </template>
        <!-- 兜底: 允许直接传入 el-table-column -->
        <slot v-else />
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
import {
  computed,
  defineComponent,
  h,
  reactive,
  resolveComponent,
  useSlots,
  watch,
} from 'vue'

const ElTableColumn = resolveComponent('ElTableColumn')

/**
 * 递归列渲染组件
 * - col.children   多级表头
 * - col.slotName    自定义单元格内容 (使用对应具名插槽)
 * - col.options     字典映射 [{ label, value }]
 * - col.formatter   el-table-column 原生 formatter
 * - col.attrs       透传其他原生属性 (filters / filter-method 等)
 */
const TableColumn = defineComponent({
  name: 'TableColumn',
  props: {
    col: { type: Object, required: true },
  },
  setup(props, { slots }) {
    return () => {
      const col = props.col
      const scopedSlots = {}

      if (col.children && col.children.length) {
        // 多级表头: 子列通过 default 插槽挂载
        scopedSlots.default = () =>
          col.children.map((child, i) =>
            h(
              TableColumn,
              {
                key: child.key || child.prop || child.label || i,
                col: child,
              },
              slots,
            ),
          )
      } else if (col.slotName && slots[col.slotName]) {
        // 自定义插槽渲染
        scopedSlots.default = (scope) => slots[col.slotName](scope)
      } else if (col.options) {
        // 字典映射
        scopedSlots.default = ({ row }) => {
          const val = row[col.prop]
          const matched = col.options.find((o) => o.value === val)
          return matched ? matched.label : val
        }
      }

      return h(
        ElTableColumn,
        {
          prop: col.prop,
          label: col.label,
          width: col.width,
          minWidth: col.minWidth,
          fixed: col.fixed,
          align: col.align,
          headerAlign: col.headerAlign,
          sortable: col.sortable,
          type: col.type,
          showOverflowTooltip: col.showOverflowTooltip,
          formatter: col.formatter,
          ...(col.attrs || {}),
        },
        scopedSlots,
      )
    }
  },
})

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
  border: { type: Boolean, default: false },
  defaultExpandAll: { type: Boolean, default: false },
  // 列配置 (JSON 数组驱动渲染)
  columns: { type: Array, default: () => [] },
})

const emit = defineEmits(['search', 'reset', 'page-change', 'size-change', 'current-change'])

const slots = useSlots()
const slotNames = computed(() => Object.keys(slots))

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
