<script setup lang="ts">
import { priorityLabels, statusLabels } from '~/utils/taskPresentation'
import type { TaskPriority, TaskStatus } from '~/types/task'

const props = defineProps<{
  status?: TaskStatus
  priority?: TaskPriority
}>()

const label = computed(() => props.status
  ? statusLabels[props.status]
  : props.priority ? priorityLabels[props.priority] : '')
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
    :class="{
      'bg-slate-100 text-slate-700': status === 'TODO' || priority === 'Low',
      'bg-blue-100 text-brand': status === 'In Progress',
      'bg-violet-100 text-violet-800': status === 'Review',
      'bg-emerald-100 text-emerald-800': status === 'Done',
      'bg-amber-100 text-amber-800': priority === 'Medium',
      'bg-red-100 text-red-700': priority === 'High',
    }"
  >{{ label }}</span>
</template>
