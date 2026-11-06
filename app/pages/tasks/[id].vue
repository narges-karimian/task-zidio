<script setup lang="ts">
import type { TaskInput } from '~/types/task'
import { formatCreatedAt, formatDueDate, isOverdue } from '~/utils/taskPresentation'
import { taskSaveFieldErrors, type TaskValidationErrors } from '~/utils/taskValidation'

definePageMeta({ layout: 'private' })

const route = useRoute()
const router = useRouter()
const user = useSupabaseUser()
const { getTask, updateTask, deleteTask } = useTasks()
const { data: taskResult, pending, error, refresh } = await useAsyncData(
  () => `task:${user.value?.id ?? 'guest'}:${String(route.params.id)}`,
  async () => ({ task: await getTask(String(route.params.id)) }),
)
const task = computed(() => taskResult.value?.task ?? null)
const isMounted = ref(false)
onMounted(() => { isMounted.value = true })
const showEdit = ref(false)
const showDelete = ref(false)
const isEditing = ref(false)
const isDeleting = ref(false)
const editError = ref('')
const editFieldErrors = ref<TaskValidationErrors>({})
const deleteError = ref('')

function openEdit() {
  editError.value = ''
  editFieldErrors.value = {}
  showEdit.value = true
}

function clearEditErrors() {
  editError.value = ''
  editFieldErrors.value = {}
}

function openDelete() {
  deleteError.value = ''
  showDelete.value = true
}

async function saveTask(input: TaskInput) {
  if (!task.value || isEditing.value) return
  isEditing.value = true
  editError.value = ''
  editFieldErrors.value = {}

  try {
    const updated = await updateTask(task.value.id, input)
    if (!updated) {
      taskResult.value = { task: null }
      showEdit.value = false
      return
    }
    taskResult.value = { task: updated }
    showEdit.value = false
    void refreshNuxtData(`tasks:${user.value?.id ?? 'guest'}`)
  } catch (error) {
    editFieldErrors.value = taskSaveFieldErrors(error)
    if (!Object.keys(editFieldErrors.value).length) {
      editError.value = 'ویرایش وظیفه ذخیره نشد. دوباره تلاش کنید.'
    }
  } finally {
    isEditing.value = false
  }
}

async function confirmDelete() {
  if (!task.value || isDeleting.value) return
  isDeleting.value = true
  deleteError.value = ''
  let deleted = false

  try {
    deleted = await deleteTask(task.value.id)
    if (!deleted) {
      taskResult.value = { task: null }
      showDelete.value = false
      return
    }
    showDelete.value = false
    taskResult.value = { task: null }
  } catch {
    deleteError.value = 'حذف وظیفه انجام نشد. دوباره تلاش کنید.'
  } finally {
    isDeleting.value = false
  }

  if (deleted) {
    void refreshNuxtData(`tasks:${user.value?.id ?? 'guest'}`)
    await router.push('/dashboard')
  }
}
</script>

<template>
  <UiState v-if="pending" kind="loading" title="در حال بارگذاری وظیفه" />
  <UiState v-else-if="error" kind="error" title="بارگذاری وظیفه انجام نشد" message="اتصال را بررسی کنید و دوباره تلاش کنید.">
    <UiButton @click="refresh()">تلاش دوباره</UiButton>
  </UiState>
  <div v-else-if="task" class="space-y-5">
    <NuxtLink to="/dashboard#tasks" class="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline">→ بازگشت به وظایف</NuxtLink>

    <div class="grid items-start gap-4 lg:grid-cols-2 lg:gap-5">
      <article class="min-w-0 overflow-hidden rounded-panel bg-white shadow-sm">
        <h2 class="bg-brand px-5 py-4 text-center text-lg font-bold text-white sm:px-6">عنوان و توضیحات</h2>
        <div class="p-5 sm:p-6">
          <h1 class="break-words text-2xl font-extrabold leading-relaxed sm:text-3xl">{{ task.title }}</h1>
          <div class="mt-6 border-t border-brand-soft pt-5">
            <h3 class="text-sm font-bold text-ink">توضیحات وظیفه</h3>
            <p class="mt-3 whitespace-pre-wrap break-words text-sm leading-8 text-ink-muted">
              {{ task.description || 'توضیحی برای این وظیفه ثبت نشده است.' }}
            </p>
          </div>
        </div>
      </article>

      <section class="min-w-0 overflow-hidden rounded-panel bg-white shadow-sm" aria-labelledby="task-info-title">
        <h2 id="task-info-title" class="bg-brand px-5 py-4 text-center text-lg font-bold text-white sm:px-6">اطلاعات وظیفه</h2>
        <div class="p-5 sm:p-6">
          <dl class="divide-y divide-brand-soft/50">
            <div class="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
              <dt class="flex items-center gap-2 text-sm text-ink-muted"><UiIcon name="status" /> وضعیت</dt>
              <dd><TaskBadge :status="task.status" /></dd>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 py-4">
              <dt class="flex items-center gap-2 text-sm text-ink-muted"><UiIcon name="priority" /> اولویت</dt>
              <dd><TaskBadge :priority="task.priority" /></dd>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 py-4">
              <dt class="flex items-center gap-2 text-sm text-ink-muted"><UiIcon name="calendar" /> تاریخ سررسید</dt>
              <dd class="text-sm font-bold" :class="isMounted && isOverdue(task) ? 'text-red-700' : ''">{{ formatDueDate(task.dueDate) }}</dd>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 py-4">
              <dt class="flex items-center gap-2 text-sm text-ink-muted"><UiIcon name="clock" /> زمان تخمینی</dt>
              <dd class="text-sm font-bold">{{ task.estimateMinutes ? `${task.estimateMinutes.toLocaleString('fa-IR')} دقیقه` : 'ثبت نشده' }}</dd>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 py-4 last:pb-0">
              <dt class="flex items-center gap-2 text-sm text-ink-muted"><UiIcon name="calendar" /> زمان ایجاد</dt>
              <dd class="text-sm font-bold">{{ isMounted ? formatCreatedAt(task.createdAt) : 'در حال نمایش…' }}</dd>
            </div>
          </dl>
          <div class="mt-6 flex flex-wrap gap-2 border-t border-brand-soft pt-5">
            <UiButton @click="openEdit">ویرایش وظیفه</UiButton>
            <UiButton variant="danger" @click="openDelete">حذف وظیفه</UiButton>
          </div>
        </div>
      </section>
    </div>

    <div v-if="showEdit" class="fixed inset-0 z-50 overflow-y-auto bg-ink/50 p-4" role="presentation" @click.self="!isEditing && (showEdit = false)">
      <section role="dialog" aria-modal="true" aria-labelledby="edit-title" class="mx-auto my-6 w-full max-w-2xl rounded-panel bg-white p-5 shadow-xl sm:p-7">
        <div class="mb-6 flex items-center justify-between gap-4">
          <h2 id="edit-title" class="text-section-title font-bold">ویرایش وظیفه</h2>
          <button type="button" aria-label="بستن" :disabled="isEditing" class="text-2xl text-ink-muted disabled:opacity-50" @click="showEdit = false">×</button>
        </div>
        <TaskForm :key="task.id" :task="task" :submitting="isEditing" :server-errors="editFieldErrors" @submit="saveTask" @change="clearEditErrors" @cancel="showEdit = false" />
        <p v-if="editError" role="alert" class="mt-4 text-sm text-red-700">{{ editError }}</p>
      </section>
    </div>

    <div v-if="showDelete" class="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" role="presentation" @click.self="!isDeleting && (showDelete = false)">
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" class="w-full max-w-md rounded-panel bg-white p-6 shadow-xl">
        <h2 id="delete-title" class="text-xl font-bold">حذف وظیفه</h2>
        <p id="delete-description" class="mt-3 text-sm leading-7 text-ink-muted">آیا از حذف «{{ task.title }}» مطمئن هستید؟</p>
        <p v-if="deleteError" role="alert" class="mt-3 text-sm text-red-700">{{ deleteError }}</p>
        <div class="mt-6 flex justify-end gap-3">
          <UiButton variant="secondary" :disabled="isDeleting" @click="showDelete = false">انصراف</UiButton>
          <UiButton variant="danger" :disabled="isDeleting" @click="confirmDelete">{{ isDeleting ? 'در حال حذف…' : 'حذف وظیفه' }}</UiButton>
        </div>
      </section>
    </div>
  </div>

  <UiState v-else kind="error" title="وظیفه پیدا نشد" message="این وظیفه وجود ندارد یا به آن دسترسی ندارید.">
    <NuxtLink to="/dashboard" class="font-bold text-brand hover:underline">بازگشت به داشبورد</NuxtLink>
  </UiState>
</template>
