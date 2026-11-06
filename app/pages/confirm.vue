<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const session = useSupabaseSession()
const supabase = useSupabaseClient()
const redirectInfo = useSupabaseCookieRedirect()
const route = useRoute()
const confirmationError = ref(Boolean(route.query.error))
const isCheckingLink = ref(true)

onMounted(async () => {
  if (confirmationError.value) {
    isCheckingLink.value = false
    return
  }

  const code = route.query.code
  if (typeof code === 'string' && code) {
    try {
      const flowId = route.query.sb_flow_id
      const { error } = await supabase.auth.exchangeCodeForSession(
        code,
        typeof flowId === 'string' ? { flowId } : undefined,
      )
      if (error) confirmationError.value = true
    } catch {
      confirmationError.value = true
    }
  }

  isCheckingLink.value = false
  if (!confirmationError.value && session.value) {
    await navigateTo(redirectInfo.pluck() || '/dashboard')
  } else {
    confirmationError.value = true
  }
})
</script>

<template>
  <section class="text-center">
    <h1 class="text-page-title font-extrabold text-ink">تأیید حساب</h1>
    <p v-if="isCheckingLink" class="mt-3 text-ink-muted">در حال تکمیل تأیید ایمیل و ورود به حساب شما…</p>
    <p v-else-if="confirmationError" role="alert" class="mt-3 text-red-700">لینک تأیید معتبر نیست یا منقضی شده است. برای ورود، از صفحهٔ ورود اقدام کنید.</p>
    <NuxtLink to="/login" class="mt-8 inline-block text-sm font-bold text-brand underline-offset-4 hover:underline">بازگشت به ورود</NuxtLink>
  </section>
</template>
