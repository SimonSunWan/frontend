<template>
  <div class="ins-section-title">
    <slot>{{ title }}</slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
.ins-section-title {
  position: relative;
  font-size: var(--ins-font-size-lg);
  font-weight: var(--ins-font-weight-bold);
  color: var(--ins-text-primary);
  margin-bottom: var(--ins-spacing-md);
  padding: var(--ins-spacing-sm) var(--ins-spacing-md) var(--ins-spacing-sm) var(--ins-spacing-xl);
  background: var(--ins-bg-muted);
  border-radius: var(--ins-radius-md);
  line-height: 1;

  &::before {
    content: '';
    position: absolute;
    left: var(--ins-spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 1em;
    background: var(--ins-color-primary);
    border-radius: var(--ins-radius-sm);
  }
}
</style>
