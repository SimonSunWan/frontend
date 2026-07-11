<template>
  <el-card class="table-card" shadow="never">
    <div v-if="$slots['table-header']" class="table-header">
      <slot name="table-header" />
    </div>
    <div class="table-body">
      <div class="table-body-inner">
        <el-table
          v-loading="loading"
          :data="data"
          :row-key="rowKey"
          :tree-props="treeProps"
          :stripe="stripe"
          :border="border"
          :default-expand-all="defaultExpandAll"
          height="100%"
        >
          <!-- 基于 columns 配置自动渲染列 -->
          <template v-if="columns?.length">
            <table-column
              v-for="(col, idx) in columns"
              :key="col.key || col.prop || col.type || col.label || idx"
              :col="col"
            >
              <template v-for="name in slotNames" :key="name" #[name]="slotProps">
                <slot :name="name" v-bind="slotProps" />
              </template>
            </table-column>
          </template>
          <!-- 允许直接传入 el-table-column -->
          <slot v-else />
        </el-table>
      </div>
    </div>

    <div v-if="showPagination" class="pagination">
      <el-pagination
        v-model:current-page="pager.current"
        v-model:page-size="pager.size"
        :page-sizes="pageSizes"
        :total="pager.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-card>
</template>

<script setup>
import { computed, defineComponent, h, reactive, resolveComponent, useSlots, watch } from 'vue'

defineOptions({ name: 'InsTable' })

const ElTableColumn = resolveComponent('ElTableColumn')

/**
 * 递归列渲染组件
 * - col.children    多级表头
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
        // 自定义插槽
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

const emit = defineEmits(['page-change', 'size-change', 'current-change'])
const slots = useSlots()
const slotNames = computed(() => Object.keys(slots))
const showPagination = computed(() => !!props.pagination)
const pager = reactive({
  current: props.pagination?.current || 1,
  size: props.pagination?.size || 10,
  total: props.pagination?.total || 0,
})

watch(
  () => props.pagination,
  (val) => {
    if (val) {
      pager.current = val.current
      pager.size = val.size
      pager.total = val.total
    }
  },
  { deep: true },
)

const handleSizeChange = (size) => {
  pager.size = size
  pager.current = 1
  emit('size-change', size)
  emit('page-change', { current: pager.current, size })
}

const handleCurrentChange = (current) => {
  pager.current = current
  emit('current-change', current)
  emit('page-change', { current, size: pager.size })
}
</script>

<style lang="scss" scoped>
.table-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .table-header {
    flex-shrink: 0;
    margin-bottom: var(--ins-spacing-lg);
  }

  .table-body {
    position: relative;
    flex: 1;
    min-height: 0;
  }

  .table-body-inner {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  :deep(.el-table__header-wrapper) {
    .el-table__cell {
      background-color: var(--ins-brand-hover);
    }
  }

  :deep(.el-table__body-wrapper) {
    tr.el-table__row--striped {
      td.el-table__cell {
        background-color: var(--ins-bg-muted);
      }
    }
  }

  .pagination {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    margin-top: var(--ins-spacing-md);
  }
}
</style>
