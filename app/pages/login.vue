<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const redirectInfo = useSupabaseCookieRedirect()
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const formError = ref('')
const isSubmitting = ref(false)

async function submit() {
  if (isSubmitting.value) return

  emailError.value = ''
  passwordError.value = ''
  formError.value = ''

  const trimmedEmail = email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) emailError.value = 'ایمیل معتبر وارد کنید.'
  if (!password.value) passwordError.value = 'رمز عبور را وارد کنید.'
  if (emailError.value || passwordError.value) return

  isSubmitting.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: password.value,
    })

    if (error) {
      if (error.code === 'invalid_credentials') formError.value = 'ایمیل یا رمز عبور نادرست است.'
      else if (error.code === 'email_not_confirmed') formError.value = 'ابتدا ایمیل خود را تأیید کنید، سپس دوباره وارد شوید.'
      else if (error.code === 'over_request_rate_limit') formError.value = 'تعداد تلاش‌ها زیاد است. چند دقیقه دیگر دوباره تلاش کنید.'
      else formError.value = 'ورود انجام نشد. دوباره تلاش کنید.'
      return
    }

    if (!data.session) {
      formError.value = 'نشست ورود برقرار نشد. دوباره تلاش کنید.'
      return
    }

    password.value = ''
    await navigateTo(redirectInfo.pluck() || '/dashboard')
  } catch {
    formError.value = 'ارتباط با سرویس ورود برقرار نشد. دوباره تلاش کنید.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section>
    <h1 class="text-center text-page-title font-extrabold text-ink">ورود به حساب</h1>
    <p class="mt-3 text-center text-ink-muted">خوش برگشتید! کارهای امروزتان را با تمرکز بیشتری دنبال کنید.</p>

    <form class="mt-9 grid gap-5" @submit.prevent="submit">
      <UiField id="login-email" v-model="email" label="ایمیل" type="email" autocomplete="email" placeholder="name@example.com" :error="emailError" required />
      <UiField id="login-password" v-model="password" label="رمز عبور" type="password" autocomplete="current-password" :error="passwordError" required />
      <div class="text-end">
        <NuxtLink to="/forgot-password" class="text-sm font-bold text-brand underline-offset-4 hover:underline">رمز عبور را فراموش کرده‌اید؟</NuxtLink>
      </div>
      <UiButton type="submit" class="w-full" :disabled="isSubmitting">{{ isSubmitting ? 'در حال ورود…' : 'ورود' }}</UiButton>
      <p v-if="formError" role="alert" class="rounded-control bg-red-50 p-3 text-sm text-red-700">{{ formError }}</p>
    </form>

    <p class="mt-8 text-center text-sm text-ink-muted">
      حساب ندارید؟ <NuxtLink to="/signup" class="font-bold text-brand underline-offset-4 hover:underline">ثبت‌نام کنید</NuxtLink>
    </p>
  </section>
</template>
