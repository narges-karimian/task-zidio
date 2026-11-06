<script setup lang="ts">
withDefaults(defineProps<{
  kind?: 'empty' | 'loading' | 'error'
  title: string
  message?: string
}>(), {
  kind: 'empty',
  message: '',
})
</script>

<template>
  <div class="rounded-panel border border-brand-soft bg-white p-8 text-center" :role="kind === 'error' ? 'alert' : 'status'">
    <div class="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-canvas text-xl text-brand" aria-hidden="true">
      {{ kind === 'error' ? '!' : kind === 'loading' ? '…' : '○' }}
    </div>
    <h2 class="text-lg font-bold text-ink">{{ title }}</h2>
    <p v-if="message" class="mt-2 text-sm text-ink-muted">{{ message }}</p>
    <div v-if="$slots.default" class="mt-5"><slot /></div>
  </div>
</template>
