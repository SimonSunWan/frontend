<template>
  <div ref="tabViewRef" class="tab-view">
    <div
      v-for="tab in tabs"
      :key="tab.path"
      :ref="(el) => setTabRef(tab.path, el)"
      class="tab-wrapper"
    >
      <el-tag
        size="large"
        :type="tab.path === route.path ? 'primary' : 'info'"
        closable
        class="tab-item"
        @click="handleClick(tab.path)"
        @close="removeTab(tab.path)"
      >
        {{ tab.title }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { useTabs } from '@/composables/useTabs'
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { tabs, addTab, removeTab, switchTab } = useTabs()
const tabViewRef = ref(null)
const tabRefMap = {}

const setTabRef = (path, el) => {
  if (el) tabRefMap[path] = el
}

const scrollToTab = (path) => {
  nextTick(() => {
    const container = tabViewRef.value
    const tabEl = tabRefMap[path]
    if (!container || !tabEl) return
    const containerRect = container.getBoundingClientRect()
    const tabRect = tabEl.getBoundingClientRect()
    // 标签左侧被截断，滚动到让标签左对齐
    if (tabRect.left < containerRect.left) {
      container.scrollLeft += tabRect.left - containerRect.left
    }
    // 标签右侧被截断，滚动到让标签右对齐
    if (tabRect.right > containerRect.right) {
      container.scrollLeft += tabRect.right - containerRect.right
    }
  })
}

const handleClick = (path) => {
  switchTab(path)
  scrollToTab(path)
}

watch(
  () => route.path,
  (path) => {
    addTab(path)
    scrollToTab(path)
  },
)
</script>

<style lang="scss" scoped>
.tab-view {
  display: flex;
  gap: 6px;
  margin: 8px 16px;
  flex-wrap: nowrap;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;

  .tab-wrapper {
    flex-shrink: 0;
  }

  .tab-item {
    cursor: pointer;
  }
}
</style>
