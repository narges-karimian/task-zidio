<script setup lang="ts">
import type { Task, TaskInput, TaskPriority, TaskStatus } from '~/types/task'
import { priorityOptions, statusOptions } from '~/utils/taskPresentation'
import { validateTaskDraft, type TaskValidationErrors } from '~/utils/taskValidation'

const props = withDefaults(defineProps<{ task?: Task, submitting?: boolean, serverErrors?: TaskValidationErrors }>(), {
  submitting: false,
  serverErrors: () => ({}),
})
const emit = defineEmits<{
  submit: [input: TaskInput]
  cancel: []
  change: []
}>()

const title = ref(props.task?.title ?? '')
const description = ref(props.task?.description ?? '')
const status = ref<TaskStatus>(props.task?.status ?? 'TODO')
const priority = ref<TaskPriority>(props.task?.priority ?? 'Medium')
const dueDate = ref(props.task?.dueDate ?? '')
const estimateMinutes = ref(props.task?.estimateMinutes?.toString() ?? '')
const errors = ref<TaskValidationErrors>({})
const visibleErrors = computed(() => ({ ...props.serverErrors, ...errors.value }))

function clearFieldErrors(...fields: (keyof TaskValidationErrors)[]) {
  for (const field of fields) delete errors.value[field]
  emit('change')
}

watch(title, () => clearFieldErrors('title'))
watch(description, () => emit('change'))
watch(status, () => clearFieldErrors('status'))
watch(priority, () => clearFieldErrors('priority'))
watch(dueDate, () => clearFieldErrors('dueDate', 'timing'))
watch(estimateMinutes, () => clearFieldErrors('estimateMinutes', 'timing'))

function submit() {
  if (props.submitting) return
  const result = validateTaskDraft({
    title: title.value,
    description: description.value,
    status: status.value,
    priority: priority.value,
    dueDate: dueDate.value,
    estimateMinutes: estimateMinutes.value,
  })
  errors.value = result.errors
  if (result.input) emit('submit', result.input)
}
</script>

<template>
  <form class="grid gap-5" novalidate @submit.prevent="submit">
    <UiField id="task-title" v-model="title" label="عنوان وظیفه" placeholder="مثلاً مرور برنامه هفته" required :error="visibleErrors.title" />

    <div class="grid gap-2">
      <label for="task-description" class="text-sm font-medium">توضیحات</label>
      <textarea
        id="task-description"
        v-model="description"
        rows="4"
        placeholder="جزئیات این وظیفه را بنویسید"
        class="w-full rounded-control border border-border bg-white px-4 py-3 text-sm placeholder:text-ink-muted focus:border-brand focus:outline-none"
      />
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <div class="grid gap-2">
        <label for="task-status" class="text-sm font-medium">وضعیت</label>
        <select id="task-status" v-model="status" :aria-invalid="Boolean(visibleErrors.status)" :aria-describedby="visibleErrors.status ? 'task-status-error' : undefined" class="min-h-12 w-full rounded-control border border-border bg-white px-4 text-sm">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <p v-if="visibleErrors.status" id="task-status-error" role="alert" class="text-xs text-red-700">{{ visibleErrors.status }}</p>
      </div>
      <div class="grid gap-2">
        <label for="task-priority" class="text-sm font-medium">اولویت</label>
        <select id="task-priority" v-model="priority" :aria-invalid="Boolean(visibleErrors.priority)" :aria-describedby="visibleErrors.priority ? 'task-priority-error' : undefined" class="min-h-12 w-full rounded-control border border-border bg-white px-4 text-sm">
          <option v-for="option in priorityOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <p v-if="visibleErrors.priority" id="task-priority-error" role="alert" class="text-xs text-red-700">{{ visibleErrors.priority }}</p>
      </div>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <UiField id="task-due-date" v-model="dueDate" label="تاریخ سررسید" type="date" :error="visibleErrors.dueDate" />
      <UiField id="task-estimate" v-model="estimateMinutes" label="زمان تخمینی (دقیقه)" type="number" :min="1" :error="visibleErrors.estimateMinutes" />
    </div>
    <p class="-mt-2 text-xs text-ink-muted">حداقل یکی از تاریخ سررسید یا زمان تخمینی را وارد کنید.</p>
    <p v-if="visibleErrors.timing" role="alert" class="text-xs text-red-700">{{ visibleErrors.timing }}</p>

    <div class="flex flex-wrap justify-end gap-3 border-t border-brand-soft pt-5">
      <UiButton variant="secondary" :disabled="submitting" @click="emit('cancel')">انصراف</UiButton>
      <UiButton type="submit" :disabled="submitting">{{ submitting ? 'در حال ذخیره…' : task ? 'ذخیره تغییرات' : 'افزودن وظیفه' }}</UiButton>
    </div>
  </form>
</template>
