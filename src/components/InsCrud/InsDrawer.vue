<template>
  <el-drawer
    v-model="visible"
    :title="resolvedTitle"
    :size="size"
    :direction="direction"
    :append-to-body="appendToBody"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="drawer-body">
      <slot />
    </div>
    <template #footer v-if="showFooter">
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
  type: { type: String, default: 'add' },
  size: { type: [String, Number], default: '620px' },
  direction: { type: String, default: 'rtl' },
  loading: { type: Boolean, default: false },
  confirmText: { type: String, default: '保存' },
  showFooter: { type: Boolean, default: true },
  appendToBody: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const resolvedTitle = computed(() => props.title || (props.type === 'edit' ? '编辑' : '新增'))

const handleClose = (done) => {
  emit('close')
  done()
}
</script>
