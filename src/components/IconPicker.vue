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
      <div class="icon-picker-trigger" @click="visible = true">
        <i v-if="modelValue" class="iconfont preview" :class="modelValue"></i>
        <span v-else class="placeholder">请选择图标</span>
        <el-icon v-if="modelValue" class="clear" @click.stop="clear"><Close /></el-icon>
        <el-icon class="arrow" @click.stop="visible = !visible"><ArrowDown /></el-icon>
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
import { ArrowDown, Close, Search } from '@element-plus/icons-vue'
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

// 从 iconfont.css 中解析出所有图标 class 名
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
  padding: 0 11px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: var(--el-border-radius-base, 4px);
  cursor: pointer;
  background: var(--el-fill-color-blank, #fff);
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:hover {
    border-color: var(--el-border-color-hover, #c0c4cc);
  }

  .preview {
    font-size: 18px;
    color: var(--el-text-color-primary);
  }

  .placeholder {
    color: var(--el-text-color-placeholder, #a8abb2);
    font-size: 14px;
  }

  .clear {
    color: var(--el-text-color-placeholder, #a8abb2);
    cursor: pointer;

    &:hover {
      color: var(--el-text-color-regular, #606266);
    }
  }

  .arrow {
    margin-left: auto;
    color: var(--el-text-color-placeholder, #a8abb2);
  }
}

.icon-picker {
  .icon-grid {
    margin-top: 10px;
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
      border: 1px solid var(--el-border-color-light, #e4e7ed);
      border-radius: 4px;
      cursor: pointer;
      font-size: 20px;
      color: var(--el-text-color-regular);
      transition: all 0.15s;

      &:hover {
        border-color: var(--el-color-primary, #409eff);
        color: var(--el-color-primary, #409eff);
        background: var(--el-color-primary-light-9, #ecf5ff);
      }

      &.active {
        border-color: var(--el-color-primary, #409eff);
        color: var(--el-color-primary, #409eff);
        background: var(--el-color-primary-light-9, #ecf5ff);
      }
    }

    .empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 24px 0;
      color: var(--el-text-color-placeholder, #a8abb2);
      font-size: 13px;
    }
  }
}
</style>
