<template>
  <template v-for="item in menus" :key="item.path">
    <el-sub-menu v-if="item.children?.length" :index="item.path">
      <template #title>
        <i
          v-if="item.meta?.icon || item.icon"
          class="iconfont menu-icon"
          :class="item.meta?.icon || item.icon"
        ></i>
        <span>{{ item.meta?.title || item.name }}</span>
      </template>
      <InsMenuTree :menus="item.children" />
    </el-sub-menu>
    <el-menu-item v-else-if="!item.meta?.isLink && !item.isLink" :index="item.path">
      <i
        v-if="item.meta?.icon || item.icon"
        class="iconfont menu-icon"
        :class="item.meta?.icon || item.icon"
      ></i>
      <span>{{ item.meta?.title || item.name }}</span>
    </el-menu-item>
  </template>
</template>

<script setup>
import InsMenuTree from './InsMenuTree.vue'

defineProps({
  menus: {
    type: Array,
    default: () => [],
  },
})
</script>
