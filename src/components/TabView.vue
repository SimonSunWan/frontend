<template>
  <div class="tab-view">
    <div class="tab-scroll" ref="scrollRef">
      <ul
        class="tab-list"
        ref="tabsRef"
        :style="{ transform: `translateX(${translateX}px)` }"
      >
        <li
          v-for="(tab, index) in tabs"
          :key="tab.path"
          class="tab-item"
          :class="{ active: tab.path === activePath }"
          @click="handleClick(tab.path)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <span
            v-if="tabs.length > 1"
            class="tab-close"
            @click.stop="removeTab(tab.path)"
          >
            <el-icon><Close /></el-icon>
          </span>
          <span v-if="index !== 0" class="line"></span>
        </li>
      </ul>
    </div>

    <el-dropdown trigger="click" @command="handleCommand">
      <span class="more-btn">
        <el-icon><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
          <el-dropdown-item command="closeAll">关闭全部</el-dropdown-item>
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
  // 右侧被遮：往左推
  if (curRight > containerWidth - translateX.value) {
    translateX.value = Math.max(containerWidth - curRight - 6, containerWidth - ulWidth)
  } else if (offsetLeft < -translateX.value) {
    // 左侧被遮：往右推
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
  padding: 0 4px;
  background-color: var(--var-bg-container);
  border-bottom: 1px solid var(--var-border-light);
  border-radius: var(--var-radius-md) var(--var-radius-md) 0 0;

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
    font-size: var(--var-font-size-xs);
    color: var(--var-text-regular);
    cursor: pointer;
    border-radius: var(--var-radius-lg) var(--var-radius-lg) 0 0;
    transition: all var(--var-transition-fast);

    &:hover {
      color: var(--var-text-primary);
      background-color: var(--var-bg-muted);
    }

    /* 谷歌风格：激活态用品牌浅色背景 + 底部连通 */
    &.active {
      color: #4b5eff;
      font-weight: var(--var-font-weight-medium);
      background-color: #eef3ff;
      border-bottom: 0;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;

      &::before,
      &::after {
        box-shadow: 0 0 0 30px #eef3ff;
      }

      .tab-close {
        color: #4b5eff;

        &:hover {
          color: var(--var-text-inverse);
          background-color: #4b5eff;
        }
      }
    }

    /* 左右 Chrome 圆弧曲线（默认透明，激活时填背景色） */
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
      color: var(--var-text-secondary);
      transition: all var(--var-transition-fast);

      .el-icon {
        font-size: 12px;
      }

      &:hover {
        color: var(--var-text-inverse);
        background-color: var(--var-text-regular);
      }
    }

    /* 标签间竖向分隔线 */
    .line {
      position: absolute;
      left: -4px;
      top: 50%;
      width: 1px;
      height: 16px;
      background-color: var(--var-border-light);
      transform: translateY(-50%);
      transition: opacity var(--var-transition-fast);
      pointer-events: none;
    }

    /* hover / active 时隐藏自身及相邻标签的分隔线，保证曲线无缝 */
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
    margin-left: 4px;
    color: var(--var-text-secondary);
    cursor: pointer;
    border-radius: var(--var-radius-md);
    flex-shrink: 0;
    outline: none;
    transition: all var(--var-transition-fast);

    &:hover {
      color: var(--var-text-primary);
      background-color: var(--var-bg-muted);
    }
  }
}
</style>
