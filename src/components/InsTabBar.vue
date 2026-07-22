<template>
  <div class="tab-view">
    <div class="tab-scroll" ref="scrollRef">
      <ul class="tab-list" ref="tabsRef" :class="{ single: tabs.length === 1 }" :style="{ transform: `translateX(${translateX}px)` }">
        <li
          v-for="(tab, index) in tabs"
          :key="tab.path"
          class="tab-item"
          :class="{ active: tab.path === activePath }"
          @click="handleClick(tab.path)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <span v-if="tabs.length > 1" class="tab-close" @click.stop="removeTab(tab.path)">
            <el-icon><Close /></el-icon>
          </span>
          <span v-if="index !== 0" class="line"></span>
        </li>
      </ul>
    </div>

    <el-dropdown trigger="hover" @command="handleCommand">
      <span class="more-btn">
        <el-icon><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="closeOthers" class="dropdown-item">关闭其他</el-dropdown-item>
          <el-dropdown-item command="closeAll" class="dropdown-item">关闭全部</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { ArrowDown, Close } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

const tabs = ref([])
let initialized = false

const addTab = (path) => {
  const matched = router.resolve(path)
  const title = matched?.meta?.title || path
  if (!tabs.value.find((t) => t.path === path)) {
    tabs.value.push({ path, title })
  }
}

const removeTab = (path) => {
  const idx = tabs.value.findIndex((t) => t.path === path)
  if (idx === -1) return
  tabs.value.splice(idx, 1)
  if (route.path === path) {
    const next = tabs.value[tabs.value.length - 1]
    router.push(next ? next.path : menuStore.homePath || '/')
  }
}

const closeOthers = (keepPath) => {
  const keep = keepPath || route.path
  tabs.value = tabs.value.filter((t) => t.path === keep)
}

const closeAll = () => {
  const home = menuStore.homePath || '/'
  tabs.value = []
  router.push(home).catch(() => {})
  addTab(home)
}

const switchTab = (path) => {
  router.push(path)
}

if (!initialized) {
  addTab(route.path)
  initialized = true
}

const scrollRef = ref(null)
const tabsRef = ref(null)
const translateX = ref(0)

const activePath = computed(() => route.path)

const handleClick = (path) => {
  switchTab(path)
}

const handleCommand = (command) => {
  if (command === 'closeOthers') closeOthers()
  else if (command === 'closeAll') closeAll()
}

// 滚轮横向滚动
const handleWheel = (e) => {
  if (!scrollRef.value || !tabsRef.value) return
  if (tabsRef.value.offsetWidth <= scrollRef.value.offsetWidth) return
  e.preventDefault()
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  const xMin = scrollRef.value.offsetWidth - tabsRef.value.offsetWidth
  translateX.value = Math.min(Math.max(translateX.value - delta, xMin), 0)
}

// 激活标签自动滚入视野
const autoPosition = () => {
  if (!scrollRef.value || !tabsRef.value) return
  const activeEl = tabsRef.value.querySelector('.tab-item.active')
  if (!activeEl) return
  const containerWidth = scrollRef.value.offsetWidth
  const ulWidth = tabsRef.value.offsetWidth
  const offsetLeft = activeEl.offsetLeft
  const curRight = offsetLeft + activeEl.clientWidth
  if (curRight > containerWidth - translateX.value) {
    translateX.value = Math.max(containerWidth - curRight - 6, containerWidth - ulWidth)
  } else if (offsetLeft < -translateX.value) {
    translateX.value = -offsetLeft
  }
}

watch(
  () => route.path,
  (path) => {
    addTab(path)
    nextTick(autoPosition)
  },
)

onMounted(() => {
  scrollRef.value?.addEventListener('wheel', handleWheel, { passive: false })
  nextTick(autoPosition)
})

onUnmounted(() => {
  scrollRef.value?.removeEventListener('wheel', handleWheel)
})
</script>

<style lang="scss" scoped>
.tab-view {
  display: flex;
  align-items: flex-end;
  padding: 0 12px 0 16px;
  background-color: var(--ins-bg-container);
  border-bottom: 1px solid var(--ins-border-light);
  border-radius: 4px 4px 0 0;

  .tab-scroll {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    padding-top: 4px;
  }

  .tab-list {
    display: inline-flex;
    align-items: flex-end;
    height: 32px;
    padding-left: 4px;
    white-space: nowrap;
    will-change: transform;
  }

  .tab-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 8px 0 12px;
    margin-right: 4px;
    font-size: 12px;
    color: var(--ins-text-regular);
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    transition: all 0.15s ease;

    &:hover {
      color: var(--ins-text-primary);
      background-color: var(--ins-color-primary-bg);
    }

    &.active {
      color: var(--ins-color-primary);
      font-weight: 500;
      background-color: var(--ins-color-primary-bg);
      border-bottom: 0;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;

      &::before,
      &::after {
        box-shadow: 0 0 0 30px var(--ins-color-primary-bg);
      }

      .tab-close {
        color: var(--ins-color-primary);

        &:hover {
          color: var(--ins-text-inverse);
          background-color: var(--ins-color-primary);
        }
      }
    }

    &::before,
    &::after {
      position: absolute;
      bottom: 0;
      width: 16px;
      height: 16px;
      content: '';
      border-radius: 50%;
      box-shadow: 0 0 0 30px transparent;
    }

    &::before {
      left: -16px;
      clip-path: inset(50% -8px 0 50%);
    }

    &::after {
      right: -16px;
      clip-path: inset(50% 50% 0 -8px);
    }

    .tab-title {
      line-height: 1;
    }

    .tab-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      margin-left: 4px;
      border-radius: 50%;
      color: var(--ins-text-secondary);
      transition: all 0.15s ease;

      .el-icon {
        font-size: 12px;
      }

      &:hover {
        color: var(--ins-text-inverse);
        background-color: var(--ins-text-regular);
      }
    }

    .line {
      position: absolute;
      left: -4px;
      top: 50%;
      width: 1px;
      height: 16px;
      background-color: var(--ins-border-light);
      transform: translateY(-50%);
      transition: opacity 0.15s ease;
      pointer-events: none;
    }

    &:hover .line,
    &.active .line,
    &:first-child .line,
    &:hover + .tab-item .line,
    &.active + .tab-item .line {
      opacity: 0;
    }
  }

  .tab-list.single .tab-item {
    padding: 0 12px;
  }

  .more-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-left: 4px;
    color: var(--ins-text-secondary);
    cursor: pointer;
    border-radius: 4px;
    flex-shrink: 0;
    outline: none;
    transition: all 0.15s ease;

    &:hover {
      color: var(--ins-text-primary);
      background-color: var(--ins-color-primary-bg);
    }
  }
}
</style>

<style lang="scss">
.el-dropdown-menu .dropdown-item {
  font-size: 12px;
}
</style>
