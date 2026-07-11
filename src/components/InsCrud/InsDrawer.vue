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
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('submit')">
        {{ confirmText }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'InsDrawer' })

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: [String, Number], default: '700px' },
  direction: { type: String, default: 'rtl' },
  loading: { type: Boolean, default: false },
  confirmText: { type: String, default: '保存' },
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
