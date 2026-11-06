<script setup lang="ts">
import type { Task, TaskInput, TaskStatus } from '~/types/task'
import type { TaskSort } from '~/composables/useDashboardControls'
import { isOverdue, priorityLabels, statusLabels } from '~/utils/taskPresentation'
import { taskSaveFieldErrors, type TaskValidationErrors } from '~/utils/taskValidation'

definePageMeta({ layout: 'private' })

const router = useRouter()
const user = useSupabaseUser()
const { listTasks, createTask, updateTask } = useTasks()
const { data, pending, error, refresh } = await useAsyncData(
  () => `tasks:${user.value?.id ?? 'guest'}`,
  () => listTasks(),
)
const tasks = computed(() => data.value ?? [])
const { search, statusFilter, priorityFilter, sortBy, showCreate } = useDashboardControls()
const isMounted = ref(false)
onMounted(() => { isMounted.value = true })
const isFiltering = computed(() => Boolean(search.value.trim())
  || statusFilter.value !== 'all' || priorityFilter.value !== 'all')

const statuses: TaskStatus[] = ['TODO', 'In Progress', 'Review', 'Done']
const isCreating = ref(false)
const createError = ref('')
const createFieldErrors = ref<TaskValidationErrors>({})
const updatingStatusId = ref<string | null>(null)
const statusError = ref('')
const draggingId = ref<string | null>(null)
const dragOverStatus = ref<TaskStatus | null>(null)

watch(showCreate, open => {
  if (open) {
    createError.value = ''
    createFieldErrors.value = {}
  }
})

function clearCreateErrors() {
  createError.value = ''
  createFieldErrors.value = {}
}

const total = computed(() => tasks.value.length)
const countByStatus = (status: TaskStatus) => computed(() =>
  tasks.value.filter(task => task.status === status).length)
const todoCount = countByStatus('TODO')
const inProgressCount = countByStatus('In Progress')
const reviewCount = countByStatus('Review')
const doneCount = countByStatus('Done')
const overdueCount = computed(() => tasks.value.filter(isOverdue).length)
const sortLabels: Record<TaskSort, string> = {
  newest: 'جدیدترین',
  oldest: 'قدیمی‌ترین',
  'due-asc': 'نزدیک‌ترین سررسید',
  'due-desc': 'دورترین سررسید',
}

function compareNewest(a: Task, b: Task): number {
  return b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id)
}

function compareDueDate(a: Task, b: Task, direction: 1 | -1): number {
  if (!a.dueDate && !b.dueDate) return compareNewest(a, b)
  if (!a.dueDate) return 1
  if (!b.dueDate) return -1
  return direction * a.dueDate.localeCompare(b.dueDate) || compareNewest(a, b)
}

const visibleTasks = computed(() => {
  const title = search.value.trim().toLocaleLowerCase()
  const result = tasks.value.filter(task => (
    (!title || task.title.toLocaleLowerCase().includes(title))
    && (statusFilter.value === 'all' || task.status === statusFilter.value)
    && (priorityFilter.value === 'all' || task.priority === priorityFilter.value)
  ))

  return result.sort((a: Task, b: Task) => {
    if (sortBy.value === 'oldest') {
      return a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
    }
    if (sortBy.value === 'due-asc') return compareDueDate(a, b, 1)
    if (sortBy.value === 'due-desc') return compareDueDate(a, b, -1)
    return compareNewest(a, b)
  })
})

const columns = computed(() => statuses.map(status => ({
  status,
  label: statusLabels[status],
  tasks: visibleTasks.value.filter(task => task.status === status),
})))

async function saveTask(input: TaskInput) {
  if (isCreating.value) return
  isCreating.value = true
  createError.value = ''
  createFieldErrors.value = {}
  let createdTask: Task | null = null

  try {
    createdTask = await createTask(input)
    data.value = [createdTask, ...tasks.value]
    showCreate.value = false
  } catch (error) {
    createFieldErrors.value = taskSaveFieldErrors(error)
    if (!Object.keys(createFieldErrors.value).length) {
      createError.value = 'ذخیره وظیفه انجام نشد. دوباره تلاش کنید.'
    }
  } finally {
    isCreating.value = false
  }

  if (createdTask) await router.push(`/tasks/${createdTask.id}`)
}

async function moveTask(id: string, status: TaskStatus) {
  const task = tasks.value.find(item => item.id === id)
  if (!task || task.status === status || updatingStatusId.value) return

  updatingStatusId.value = id
  statusError.value = ''
  try {
    const updated = await updateTask(id, { status })
    if (!updated) {
      statusError.value = 'وظیفه پیدا نشد. فهرست را دوباره بارگذاری کنید.'
      await refresh()
      return
    }
    data.value = tasks.value.map(item => item.id === id ? updated : item)
  } catch {
    statusError.value = 'تغییر وضعیت ذخیره نشد. دوباره تلاش کنید.'
  } finally {
    updatingStatusId.value = null
  }
}

function startDrag(event: DragEvent, id: string) {
  if (!event.dataTransfer || updatingStatusId.value) return
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', id)
  draggingId.value = id
}

function endDrag() {
  draggingId.value = null
  dragOverStatus.value = null
}

function dropOnColumn(status: TaskStatus) {
  const id = draggingId.value
  endDrag()
  if (id) void moveTask(id, status)
}
</script>

<template>
  <div class="space-y-5">
    <h1 class="sr-only">برد وظایف</h1>

    <section v-if="!pending && !error && isMounted" aria-label="آمار وظایف" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard label="همه وظایف" :value="total" :total="total" />
      <StatCard label="برای انجام" :value="todoCount" :total="total" />
      <StatCard label="در حال انجام" :value="inProgressCount" :total="total" />
      <StatCard label="در بازبینی" :value="reviewCount" :total="total" />
      <StatCard label="انجام‌شده" :value="doneCount" :total="total" />
      <StatCard label="عقب‌افتاده" :value="overdueCount" :total="total" />
    </section>

    <section id="tasks" aria-label="برد وظایف" class="scroll-mt-4">
      <div v-if="statusFilter !== 'all' || priorityFilter !== 'all'" class="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span class="text-ink-muted">فیلترهای فعال:</span>
        <button
          v-if="statusFilter !== 'all'"
          type="button"
          class="rounded-control bg-brand-soft px-3 py-2 font-medium text-brand"
          :aria-label="`حذف فیلتر وضعیت ${statusLabels[statusFilter]}`"
          @click="statusFilter = 'all'"
        >
          وضعیت: {{ statusLabels[statusFilter] }} ×
        </button>
        <button
          v-if="priorityFilter !== 'all'"
          type="button"
          class="rounded-control bg-brand-soft px-3 py-2 font-medium text-brand"
          :aria-label="`حذف فیلتر اولویت ${priorityLabels[priorityFilter]}`"
          @click="priorityFilter = 'all'"
        >
          اولویت: {{ priorityLabels[priorityFilter] }} ×
        </button>
      </div>
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <p v-if="!pending && !error">{{ visibleTasks.length.toLocaleString('fa-IR') }} وظیفه نمایش داده می‌شود</p>
        <p>ترتیب: {{ sortLabels[sortBy] }}</p>
      </div>
      <p v-if="statusError" role="alert" class="mb-3 rounded-control bg-red-50 p-3 text-sm text-red-700">{{ statusError }}</p>

      <UiState v-if="pending" kind="loading" title="در حال بارگذاری وظایف" />
      <UiState v-else-if="error" kind="error" title="بارگذاری وظایف انجام نشد" message="اتصال را بررسی کنید و دوباره تلاش کنید.">
        <UiButton @click="refresh()">تلاش دوباره</UiButton>
      </UiState>
      <div v-else-if="visibleTasks.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <section
          v-for="column in columns"
          :key="column.status"
          class="min-w-0 rounded-panel p-1 transition-colors"
          :class="draggingId && dragOverStatus === column.status ? 'bg-brand-soft/65 outline-2 outline-dashed outline-brand' : ''"
          :aria-label="`ستون ${column.label}`"
          @dragover.prevent="dragOverStatus = column.status"
          @drop.prevent="dropOnColumn(column.status)"
        >
          <div class="mb-2 flex min-h-11 items-center justify-between rounded-control bg-white px-4 text-sm font-bold text-ink">
            <h2>{{ column.label }}</h2>
            <span class="text-ink-muted">{{ column.tasks.length.toLocaleString('fa-IR') }}</span>
          </div>
          <div class="grid content-start gap-3">
            <TaskBoardCard
              v-for="task in column.tasks"
              :key="task.id"
              :task="task"
              :busy="updatingStatusId !== null"
              @drag-start="startDrag"
              @drag-end="endDrag"
              @move="moveTask"
            />
            <p v-if="!column.tasks.length" class="rounded-control border border-dashed border-brand-soft p-5 text-center text-xs text-ink-muted">
              وظیفه‌ای در این وضعیت نیست
            </p>
          </div>
        </section>
      </div>
      <UiState
        v-else-if="!tasks.length && !isFiltering"
        title="هنوز وظیفه‌ای ندارید"
        message="از دکمهٔ افزودن وظیفه در هدر استفاده کنید."
      />
      <UiState v-else title="نتیجه‌ای پیدا نشد" message="عبارت جست‌وجو یا فیلترها را تغییر دهید." />
    </section>

    <div v-if="showCreate" class="fixed inset-0 z-50 overflow-y-auto bg-ink/50 p-4" role="presentation" @click.self="!isCreating && (showCreate = false)">
      <section role="dialog" aria-modal="true" aria-labelledby="create-title" class="mx-auto my-6 w-full max-w-2xl rounded-panel bg-white p-5 shadow-xl sm:p-7">
        <div class="mb-6 flex items-center justify-between gap-4">
          <h2 id="create-title" class="text-section-title font-bold">وظیفه جدید</h2>
          <button type="button" aria-label="بستن" :disabled="isCreating" class="text-2xl text-ink-muted disabled:opacity-50" @click="showCreate = false">×</button>
        </div>
        <TaskForm :submitting="isCreating" :server-errors="createFieldErrors" @submit="saveTask" @change="clearCreateErrors" @cancel="showCreate = false" />
        <p v-if="createError" role="alert" class="mt-4 text-sm text-red-700">{{ createError }}</p>
      </section>
    </div>
  </div>
</template>
