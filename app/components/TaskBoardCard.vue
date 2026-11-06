<script setup lang="ts">
import type { Task, TaskStatus } from '~/types/task'
import { formatDueDate, isOverdue, statusOptions } from '~/utils/taskPresentation'

const props = withDefaults(defineProps<{ task: Task, busy?: boolean }>(), {
  busy: false,
})
const isMounted = ref(false)
onMounted(() => { isMounted.value = true })
const emit = defineEmits<{
  dragStart: [event: DragEvent, id: string]
  dragEnd: []
  move: [id: string, status: TaskStatus]
}>()

function changeStatus(event: Event) {
  const select = event.target as HTMLSelectElement
  const nextStatus = select.value as TaskStatus
  select.value = props.task.status
  emit('move', props.task.id, nextStatus)
}
</script>

<template>
  <article
    :draggable="!busy"
    class="rounded-control bg-brand p-3 text-white shadow-sm"
    :class="busy ? 'opacity-70' : 'cursor-grab active:cursor-grabbing'"
    @dragstart="emit('dragStart', $event, task.id)"
    @dragend="emit('dragEnd')"
  >
    <NuxtLink :to="`/tasks/${task.id}`" class="block rounded-sm p-1 font-bold leading-6 hover:underline">
      {{ task.title }}
    </NuxtLink>

    <div class="mt-3 flex flex-wrap gap-2">
      <TaskBadge :priority="task.priority" />
    </div>

    <NuxtLink :to="`/tasks/${task.id}`" class="mt-3 block rounded-control bg-white p-3 text-sm leading-6 text-ink hover:bg-canvas">
      <span class="line-clamp-2">{{ task.description || 'برای دیدن جزئیات وظیفه کلیک کنید.' }}</span>
    </NuxtLink>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
      <span :class="isMounted && isOverdue(task) ? 'font-bold text-yellow-200' : 'text-white/85'">{{ formatDueDate(task.dueDate) }}</span>
      <label class="flex items-center gap-1">
        <span class="sr-only">تغییر وضعیت {{ task.title }}</span>
        <select
          :value="task.status"
          :disabled="busy"
          :aria-label="`تغییر وضعیت ${task.title}`"
          class="max-w-28 rounded bg-white/15 px-1 py-1 text-xs text-white focus:bg-brand disabled:opacity-50"
          @change="changeStatus"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value" class="text-ink">{{ option.label }}</option>
        </select>
      </label>
    </div>
  </article>
</template>
