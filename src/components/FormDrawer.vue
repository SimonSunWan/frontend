<template>
  <el-drawer
    v-model="visible"
    class="form-drawer"
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
  size: { type: [String, Number], default: '700px' },
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
</style>

<style lang="scss">
.form-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding-bottom: var(--ins-spacing-md);
    border-bottom: 1px solid var(--ins-border-light);
  }

  .el-drawer__body {
    padding: var(--ins-spacing-md) var(--ins-spacing-lg);
  }

  .el-drawer__footer {
    border-top: 1px solid var(--ins-border-light);
  }
}
</style>
