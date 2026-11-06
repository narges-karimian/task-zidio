<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const session = useSupabaseSession()
const route = useRoute()
const password = ref('')
const confirmation = ref('')
const message = ref('')
const passwordError = ref('')
const confirmationError = ref('')
const formError = ref('')
const isSubmitting = ref(false)
const isComplete = ref(false)
const isCheckingLink = ref(true)
const recoveryUserId = ref<string | null>(null)
const hasLinkError = computed(() => Boolean(route.query.error) || route.hash.includes('error='))
const canReset = computed(() => route.query.recovery === '1'
  && recoveryUserId.value !== null
  && session.value?.user.id === recoveryUserId.value
  && !hasLinkError.value)

onMounted(async () => {
  const code = route.query.code
  if (route.query.recovery !== '1' || typeof code !== 'string' || !code || hasLinkError.value) {
    isCheckingLink.value = false
    return
  }

  let verifiedAccessToken: string | null = null
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
    if (event === 'PASSWORD_RECOVERY') verifiedAccessToken = currentSession?.access_token ?? null
  })

  try {
    const flowId = route.query.sb_flow_id
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code,
      typeof flowId === 'string' ? { flowId } : undefined,
    )
    if (!error && data.session && verifiedAccessToken === data.session.access_token) {
      recoveryUserId.value = data.session.user.id
      const url = new URL(window.location.href)
      url.searchParams.delete('code')
      url.searchParams.delete('sb_flow_id')
      window.history.replaceState(window.history.state, '', url.toString())
    }
  } catch {
    // An invalid or expired code leaves the reset form unavailable.
  } finally {
    subscription.unsubscribe()
    isCheckingLink.value = false
  }
})

async function submit() {
  if (isSubmitting.value || isComplete.value) return

  message.value = ''
  passwordError.value = ''
  confirmationError.value = ''
  formError.value = ''

  if (!canReset.value) {
    formError.value = 'لینک بازیابی معتبر نیست یا منقضی شده است. دوباره درخواست بازیابی بدهید.'
    return
  }
  if (password.value.length < 8) passwordError.value = 'رمز عبور باید حداقل ۸ کاراکتر داشته باشد.'
  if (password.value !== confirmation.value) confirmationError.value = 'تکرار رمز عبور با رمز جدید یکسان نیست.'
  if (passwordError.value || confirmationError.value) return

  isSubmitting.value = true
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || userData.user?.id !== recoveryUserId.value) {
      formError.value = 'نشست بازیابی معتبر نیست یا منقضی شده است. دوباره درخواست بازیابی بدهید.'
      return
    }

    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) {
      if (error.code === 'weak_password') passwordError.value = 'رمز عبور قوی‌تری وارد کنید.'
      else if (error.code === 'same_password') passwordError.value = 'رمز جدید باید با رمز قبلی متفاوت باشد.'
      else formError.value = 'تغییر رمز انجام نشد. دوباره تلاش کنید.'
      return
    }

    password.value = ''
    confirmation.value = ''
    isComplete.value = true
    let signOutFailed = false
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      signOutFailed = Boolean(signOutError)
    } catch {
      signOutFailed = true
    }
    message.value = signOutFailed
      ? 'رمز عبور تغییر کرد، اما خروج خودکار انجام نشد. پیش از ورود دوباره، از حساب خارج شوید.'
      : 'رمز عبور تغییر کرد. اکنون می‌توانید با رمز جدید وارد شوید.'
  } catch {
    formError.value = 'ارتباط با سرویس بازیابی برقرار نشد. دوباره تلاش کنید.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section>
    <h1 class="text-page-title font-extrabold">تعیین رمز جدید</h1>
    <p class="mt-3 text-ink-muted">رمز عبور جدید خود را وارد و تأیید کنید.</p>

    <p v-if="isCheckingLink" role="status" class="mt-6 text-sm text-ink-muted">در حال بررسی لینک بازیابی…</p>
    <p v-else-if="!canReset && !isComplete" role="alert" class="mt-6 rounded-control bg-red-50 p-3 text-sm text-red-700">لینک بازیابی معتبر نیست یا منقضی شده است. دوباره درخواست بازیابی بدهید.</p>

    <form v-if="canReset && !isComplete" class="mt-9 grid gap-5" @submit.prevent="submit">
      <UiField id="reset-password" v-model="password" label="رمز جدید" type="password" autocomplete="new-password" :minlength="8" :error="passwordError" required />
      <UiField id="reset-confirmation" v-model="confirmation" label="تکرار رمز جدید" type="password" autocomplete="new-password" :minlength="8" :error="confirmationError" required />
      <p class="-mt-2 text-xs text-ink-muted">رمز عبور باید حداقل ۸ کاراکتر داشته باشد.</p>
      <UiButton type="submit" class="w-full" :disabled="isSubmitting">{{ isSubmitting ? 'در حال ثبت…' : 'ثبت رمز جدید' }}</UiButton>
      <p v-if="formError" role="alert" class="rounded-control bg-red-50 p-3 text-sm text-red-700">{{ formError }}</p>
    </form>

    <p v-if="message" role="status" class="mt-6 rounded-control bg-canvas p-3 text-sm text-brand">{{ message }}</p>
    <NuxtLink v-if="!isCheckingLink && !canReset && !isComplete" to="/forgot-password" class="mt-8 inline-block text-sm font-bold text-brand underline-offset-4 hover:underline">درخواست لینک جدید</NuxtLink>
    <NuxtLink to="/login" class="mt-8 inline-block text-sm font-bold text-brand underline-offset-4 hover:underline">بازگشت به ورود</NuxtLink>
  </section>
</template>
