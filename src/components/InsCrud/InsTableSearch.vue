<template>
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
  margin-bottom: var(--ins-spacing-lg);

  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}
</style>
