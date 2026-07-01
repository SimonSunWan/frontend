<template>
  <el-drawer
    v-model="visible"
    :title="title"
    :size="size"
    :direction="direction"
    :append-to-body="appendToBody"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="drawer-body">
      <slot />
    </div>
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="$emit('submit')">
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: [String, Number], default: '500px' },
  direction: { type: String, default: 'rtl' },
  loading: { type: Boolean, default: false },
  confirmText: { type: String, default: '确定' },
  appendToBody: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const handleClose = (done) => {
  emit('close')
  done()
}
</script>

<style lang="scss" scoped>
.drawer-body {
  padding: 0 4px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-drawer__body) {
  padding: 16px 20px;
}
</style>
