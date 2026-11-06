<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number
  total: number
  note?: string
}>()

const radius = 42
const circumference = 2 * Math.PI * radius
const progress = computed(() => props.total > 0
  ? Math.min(1, Math.max(0, props.value / props.total))
  : 0)
const dashArray = computed(() => `${progress.value * circumference} ${circumference}`)
</script>

<template>
  <div class="flex min-h-44 flex-col items-center justify-center rounded-panel bg-white p-4 text-center shadow-sm">
    <div class="relative size-28" role="img" :aria-label="`${label}: ${value.toLocaleString('fa-IR')}`">
      <svg viewBox="0 0 100 100" class="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" :r="radius" fill="none" stroke="#d9e5f5" stroke-width="7" />
        <circle cx="50" cy="50" :r="radius" fill="none" stroke="#104da7" stroke-width="7" stroke-linecap="round" :stroke-dasharray="dashArray" />
      </svg>
      <span class="absolute inset-0 grid place-items-center text-2xl font-extrabold text-ink">{{ value.toLocaleString('fa-IR') }}</span>
    </div>
    <p class="mt-2 text-sm font-bold text-ink">{{ label }}</p>
    <p v-if="note" class="mt-1 text-xs text-ink-muted">{{ note }}</p>
  </div>
</template>
