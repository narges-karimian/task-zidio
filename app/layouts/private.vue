<script setup lang="ts">
import { priorityOptions, statusOptions } from '~/utils/taskPresentation'

useHead({
  htmlAttrs: { class: 'overflow-hidden' },
  bodyAttrs: { class: 'overflow-hidden' },
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const isSigningOut = ref(false)
const signOutError = ref('')
const {
  search, statusFilter, priorityFilter, sortBy,
  showFilters, showCreate, clearFilters,
} = useDashboardControls()
const activeFilterCount = computed(() => Number(statusFilter.value !== 'all') + Number(priorityFilter.value !== 'all'))

watch(() => route.path, path => {
  if (path !== '/dashboard') showFilters.value = false
})

function handleSearch() {
  if (route.path !== '/dashboard') router.push('/dashboard')
}

async function openCreate() {
  if (route.path !== '/dashboard') await router.push('/dashboard')
  showCreate.value = true
}

async function signOut() {
  if (isSigningOut.value) return

  signOutError.value = ''
  isSigningOut.value = true
  showCreate.value = false
  showFilters.value = false
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      signOutError.value = 'خروج انجام نشد. دوباره تلاش کنید.'
      return
    }
    await navigateTo('/login')
  } catch {
    signOutError.value = 'ارتباط برای خروج برقرار نشد. دوباره تلاش کنید.'
  } finally {
    isSigningOut.value = false
  }
}
</script>

<template>
  <div class="flex h-dvh flex-col overflow-hidden bg-canvas text-ink">
    <header class="z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 bg-canvas px-4 py-4 sm:gap-5 sm:px-6 lg:px-8">
      <BrandLogo to="/dashboard" />

      <div class="flex w-full min-w-0 flex-none items-center justify-end gap-2 sm:w-auto sm:flex-1 sm:gap-3">
        <button
          v-if="route.path === '/dashboard'"
          type="button"
          :aria-label="activeFilterCount ? `نمایش فیلترها، ${activeFilterCount} فیلتر فعال` : 'نمایش فیلترها'"
          :aria-expanded="showFilters"
          class="relative grid size-11 shrink-0 place-items-center rounded-control bg-white hover:text-brand"
          :class="activeFilterCount ? 'text-brand ring-2 ring-brand' : 'text-[#262626]'"
          @click="showFilters = true"
        >
          <UiIcon name="filter" />
          <span v-if="activeFilterCount" class="absolute -left-1 -top-1 grid size-5 place-items-center rounded-full bg-brand text-xs text-white" aria-hidden="true">{{ activeFilterCount }}</span>
        </button>
        <div class="relative min-w-0 max-w-sm flex-1">
          <UiIcon name="search" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <label for="header-search" class="sr-only">جست‌وجو در عنوان وظایف</label>
          <input
            id="header-search"
            v-model="search"
            type="search"
            placeholder="جست‌وجوی وظیفه"
            class="min-h-11 w-full rounded-control border border-border bg-white py-2 pe-3 ps-10 text-sm placeholder:text-ink-muted"
            @input="handleSearch"
          >
        </div>
        <UiButton class="shrink-0 px-3 sm:px-5" aria-label="افزودن وظیفه" @click="openCreate">
          <UiIcon name="plus" />
          <span class="hidden sm:inline">افزودن وظیفه</span>
        </UiButton>
      </div>
    </header>

    <div class="grid min-h-0 flex-1 grid-cols-[4.5rem_minmax(0,1fr)] gap-3 px-3 pb-3 sm:gap-5 sm:px-5 sm:pb-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-6 lg:px-8">
      <aside class="flex min-h-0 flex-col rounded-panel bg-white p-2 shadow-sm lg:p-4">
        <nav aria-label="ناوبری اصلی" class="grid gap-2">
          <NuxtLink
            to="/dashboard"
            aria-label="داشبورد"
            class="flex min-h-12 items-center justify-center gap-3 rounded-control px-2 hover:bg-canvas lg:justify-start lg:px-4"
            :class="route.path === '/dashboard' && route.hash !== '#tasks' ? 'bg-brand-soft font-bold text-brand' : 'text-[#262626]'"
          >
            <UiIcon name="dashboard" />
            <span class="hidden lg:inline">داشبورد</span>
          </NuxtLink>
          <NuxtLink
            to="/dashboard#tasks"
            aria-label="وظایف من"
            class="flex min-h-12 items-center justify-center gap-3 rounded-control px-2 hover:bg-canvas lg:justify-start lg:px-4"
            :class="route.path !== '/dashboard' || route.hash === '#tasks' ? 'bg-brand-soft font-bold text-brand' : 'text-[#262626]'"
          >
            <UiIcon name="tasks" />
            <span class="hidden lg:inline">وظایف من</span>
          </NuxtLink>
        </nav>

        <button
          type="button"
          :disabled="isSigningOut"
          class="mt-auto flex min-h-12 items-center justify-center gap-3 rounded-control px-2 text-[#262626] hover:bg-canvas lg:justify-start lg:px-4"
          aria-label="خروج"
          @click="signOut"
        >
          <UiIcon name="logout" />
          <span class="hidden lg:inline">خروج</span>
        </button>
        <p v-if="signOutError" role="alert" class="px-2 text-xs text-red-700">{{ signOutError }}</p>
      </aside>

      <main class="min-h-0 min-w-0 overflow-y-auto overscroll-contain pb-3 sm:pb-6">
        <slot />
      </main>
    </div>

    <div v-if="showFilters && route.path === '/dashboard'" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/50 p-4" role="presentation" @click.self="showFilters = false">
      <section role="dialog" aria-modal="true" aria-labelledby="filter-title" class="w-full max-w-md rounded-panel bg-white p-5 shadow-xl sm:p-6">
        <div class="mb-5 flex items-center justify-between gap-3">
          <h2 id="filter-title" class="text-xl font-bold">فیلتر و مرتب‌سازی</h2>
          <button type="button" aria-label="بستن فیلترها" class="text-2xl text-ink-muted" @click="showFilters = false">×</button>
        </div>
        <div class="grid gap-5">
          <div class="grid gap-2">
            <label for="status-filter" class="text-sm font-medium">وضعیت</label>
            <select id="status-filter" v-model="statusFilter" class="min-h-11 rounded-control border border-border bg-white px-3 text-sm">
              <option value="all">همه وضعیت‌ها</option>
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          <div class="grid gap-2">
            <label for="priority-filter" class="text-sm font-medium">اولویت</label>
            <select id="priority-filter" v-model="priorityFilter" class="min-h-11 rounded-control border border-border bg-white px-3 text-sm">
              <option value="all">همه اولویت‌ها</option>
              <option v-for="option in priorityOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          <div class="grid gap-2">
            <label for="task-sort" class="text-sm font-medium">مرتب‌سازی</label>
            <select id="task-sort" v-model="sortBy" class="min-h-11 rounded-control border border-border bg-white px-3 text-sm">
              <option value="newest">جدیدترین</option>
              <option value="oldest">قدیمی‌ترین</option>
              <option value="due-asc">نزدیک‌ترین سررسید</option>
              <option value="due-desc">دورترین سررسید</option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex flex-wrap justify-end gap-2 border-t border-brand-soft pt-5">
          <UiButton variant="secondary" @click="clearFilters">پاک‌کردن فیلترها</UiButton>
          <UiButton @click="showFilters = false">نمایش نتایج</UiButton>
        </div>
      </section>
    </div>
  </div>
</template>
