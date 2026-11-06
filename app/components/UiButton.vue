<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
}>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'bg-brand text-white hover:bg-brand-hover': variant === 'primary',
      'border border-border bg-white text-ink hover:bg-brand-soft/30': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
      'text-brand hover:bg-brand-soft/30': variant === 'ghost',
    }"
  >
    <slot />
  </button>
</template>
