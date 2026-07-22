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
  font-size: 16px;
  font-weight: 700;
  color: var(--ins-text-primary);
  margin-bottom: 16px;
  padding: 12px 16px 12px 24px;
  background: var(--ins-color-primary-bg);
  border-radius: 4px;
  line-height: 1;

  &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 1em;
    background: var(--ins-color-primary);
    border-radius: 2px;
  }
}
</style>
