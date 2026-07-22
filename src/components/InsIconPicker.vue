<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-start"
    :width="360"
    trigger="click"
    popper-class="icon-picker-popper"
    @show="onShow"
  >
    <template #reference>
      <div class="icon-picker-trigger" :class="{ 'is-focus': visible }">
        <i v-if="modelValue" class="iconfont preview" :class="modelValue"></i>
        <span v-else class="placeholder">请选择图标</span>
        <el-icon v-if="modelValue" class="clear" @click.stop="clear"><CircleClose /></el-icon>
        <el-icon v-else class="arrow" :class="{ 'is-open': visible }"><ArrowDown /></el-icon>
      </div>
    </template>

    <div class="icon-picker">
      <el-input v-model="query" placeholder="搜索图标名称" clearable :prefix-icon="Search" />
      <div class="icon-grid">
        <div
          v-for="name in filteredIcons"
          :key="name"
          class="icon-cell"
          :class="{ active: name === modelValue }"
          :title="name"
          @click="pick(name)"
        >
          <i class="iconfont" :class="name"></i>
        </div>
        <div v-if="!filteredIcons.length" class="empty">无匹配图标</div>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import iconfontCss from '@/assets/iconfont/iconfont.css?raw'
import { ArrowDown, CircleClose, Search } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])
const visible = ref(false)
const query = ref('')

const iconNames = [
  ...new Set(
    [...iconfontCss.matchAll(/\.icon-([a-zA-Z0-9_-]+)\s*:before/g)].map((m) => `icon-${m[1]}`),
  ),
]

const filteredIcons = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return iconNames
  return iconNames.filter((name) => name.toLowerCase().includes(q))
})

const onShow = () => {
  query.value = ''
}

const pick = (name) => {
  emit('update:modelValue', name)
  visible.value = false
}

const clear = () => {
  emit('update:modelValue', '')
}
</script>

<style lang="scss" scoped>
.icon-picker-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
  background: var(--ins-bg-container);
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:hover {
    border-color: var(--el-border-color-hover);
  }

  &.is-focus {
    border-color: var(--ins-color-primary);
  }

  .preview {
    font-size: 16px;
    color: var(--ins-text-primary);
    margin-right: auto;
  }

  .placeholder {
    color: var(--ins-text-secondary);
    font-size: 14px;
    margin-right: auto;
  }

  .clear {
    color: var(--ins-text-secondary);
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--ins-color-primary);
    }
  }

  .arrow {
    color: var(--ins-text-secondary);
    transition: transform 0.2s;

    &.is-open {
      transform: rotate(180deg);
    }
  }
}

.icon-picker {
  .icon-grid {
    margin-top: 8px;
    margin-right: -12px;
    padding-right: 12px;
    max-height: 280px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;

    .icon-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 4px;
      cursor: pointer;
      font-size: 20px;
      color: var(--ins-text-regular);
      transition: all 0.15s;

      &:hover,
      &.active {
        border-color: var(--ins-color-primary);
        color: var(--ins-color-primary);
        background: var(--ins-color-primary-bg);
      }
    }

    .empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 24px 0;
      color: var(--ins-text-secondary);
      font-size: 12px;
    }
  }
}
</style>
