<template>
  <div class="tab-view">
    <div class="tab-scroll" ref="scrollRef">
      <ul class="tab-list" ref="tabsRef" :style="{ transform: `translateX(${translateX}px)` }">
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
import { useTabs } from '@/composables/useTabs'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowDown, Close } from '@element-plus/icons-vue'

const route = useRoute()
const { tabs, addTab, removeTab, switchTab, closeOthers, closeAll } = useTabs()

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
  padding: 0 var(--ins-spacing-sm) 0 var(--ins-spacing-md);
  background-color: var(--ins-bg-container);
  border-bottom: 1px solid var(--ins-border-light);
  border-radius: var(--ins-radius-md) var(--ins-radius-md) 0 0;

  .tab-scroll {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    padding-top: var(--ins-spacing-2xs);
  }

  .tab-list {
    display: inline-flex;
    align-items: flex-end;
    height: 32px;
    padding-left: var(--ins-spacing-2xs);
    white-space: nowrap;
    will-change: transform;
  }

  .tab-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 var(--ins-spacing-xs) 0 var(--ins-spacing-sm);
    margin-right: var(--ins-spacing-2xs);
    font-size: var(--ins-font-size-xs);
    color: var(--ins-text-regular);
    cursor: pointer;
    border-radius: var(--ins-radius-lg) var(--ins-radius-lg) 0 0;
    transition: all var(--ins-transition-fast);

    &:hover {
      color: var(--ins-text-primary);
      background-color: var(--ins-bg-muted);
    }

    &.active {
      color: var(--ins-color-primary);
      font-weight: var(--ins-font-weight-medium);
      background-color: var(--ins-brand-hover);
      border-bottom: 0;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;

      &::before,
      &::after {
        box-shadow: 0 0 0 30px var(--ins-brand-hover);
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
      margin-left: var(--ins-spacing-2xs);
      border-radius: 50%;
      color: var(--ins-text-secondary);
      transition: all var(--ins-transition-fast);

      .el-icon {
        font-size: var(--ins-font-size-xs);
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
      transition: opacity var(--ins-transition-fast);
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

  .more-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-left: var(--ins-spacing-2xs);
    color: var(--ins-text-secondary);
    cursor: pointer;
    border-radius: var(--ins-radius-md);
    flex-shrink: 0;
    outline: none;
    transition: all var(--ins-transition-fast);

    &:hover {
      color: var(--ins-text-primary);
      background-color: var(--ins-bg-muted);
    }
  }
}

.dropdown-item {
  font-size: var(--ins-font-size-xs);
}
</style>
