<template>
  <el-card v-if="$slots.search" class="search-card" shadow="never">
    <el-form :model="searchForm" inline class="search-form">
      <slot name="search" :form="searchForm" />
      <el-form-item class="search-actions">
        <el-button type="primary" @click="$emit('search')">搜索</el-button>
        <el-button @click="$emit('reset')">重置</el-button>
        <slot name="search-extra" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
defineOptions({ name: 'InsTableSearch' })

defineProps({
  searchForm: { type: Object, default: () => ({}) },
})

defineEmits(['search', 'reset'])
</script>

<style lang="scss" scoped>
.search-card {
  flex-shrink: 0;
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

.search-form {
  :deep(.el-form-item) {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: var(--ins-search-item-width, 240px);
    height: 32px;
    padding: 0 12px;
    margin: 0 16px 16px 0;
    background-color: var(--ins-bg-container);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    transition: border-color 0.15s ease;

    .el-form-item__label {
      flex-shrink: 0;
      padding: 0 12px 0 0;
      line-height: 32px;
      color: var(--el-text-color-regular);
    }

    .el-form-item__content {
      flex: 1;
      min-width: 0;
      line-height: 32px;
    }

    .el-input__wrapper,
    .el-select__wrapper,
    .el-date-editor.el-input__wrapper {
      background: transparent !important;
      box-shadow: none !important;
      border-radius: 0;
      padding: 0;
    }

    .el-input__inner,
    .el-select__placeholder,
    .el-select__selected-item,
    .el-range-input,
    .el-input__prefix,
    .el-input__suffix {
      color: var(--el-text-color-regular);
    }

    &:hover,
    &:focus-within {
      border-color: var(--ins-color-primary);
    }
  }

  :deep(.el-form-item.span-2) {
    width: calc(2 * var(--ins-search-item-width, 240px) + 16px);
  }

  :deep(.el-form-item.span-3) {
    width: calc(3 * var(--ins-search-item-width, 240px) + 2 * 16px);
  }

  :deep(.search-actions) {
    width: auto !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
  }

  :deep(.el-form-item .el-input),
  :deep(.el-form-item .el-select),
  :deep(.el-form-item .el-date-editor) {
    width: 100% !important;
  }
}
</style>
