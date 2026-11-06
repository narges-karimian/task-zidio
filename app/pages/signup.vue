<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const name = ref('')
const email = ref('')
const password = ref('')
const message = ref('')
const formError = ref('')
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const isSubmitting = ref(false)

async function submit() {
  if (isSubmitting.value) return

  message.value = ''
  formError.value = ''
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''

  const trimmedName = name.value.trim()
  const trimmedEmail = email.value.trim()

  if (!trimmedName) nameError.value = 'نام خود را وارد کنید.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) emailError.value = 'ایمیل معتبر وارد کنید.'
  if (password.value.length < 8) passwordError.value = 'رمز عبور باید حداقل ۸ کاراکتر داشته باشد.'
  if (nameError.value || emailError.value || passwordError.value) return

  isSubmitting.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: password.value,
      options: {
        data: { name: trimmedName },
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    })

    if (error) {
      if (error.code === 'email_address_invalid') emailError.value = 'ایمیل معتبر وارد کنید.'
      else if (error.code === 'weak_password') passwordError.value = 'رمز عبور قوی‌تری وارد کنید.'
      else if (error.code === 'user_already_exists') emailError.value = 'این ایمیل قبلاً ثبت شده است. وارد شوید یا رمزتان را بازیابی کنید.'
      else if (error.code === 'over_email_send_rate_limit') formError.value = 'تعداد درخواست‌های ایمیل زیاد است. کمی بعد دوباره تلاش کنید.'
      else formError.value = 'ثبت‌نام انجام نشد. دوباره تلاش کنید.'
      return
    }

    if (!data.user) {
      formError.value = 'ثبت‌نام انجام نشد. دوباره تلاش کنید.'
      return
    }

    password.value = ''
    if (data.session) {
      await supabase.auth.signOut()
      message.value = 'حساب شما ساخته شد. اکنون می‌توانید وارد شوید.'
    } else {
      message.value = 'برای تکمیل ثبت‌نام، ایمیل خود را بررسی و حساب را تأیید کنید.'
    }
  } catch {
    formError.value = 'ارتباط با سرویس ثبت‌نام برقرار نشد. دوباره تلاش کنید.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section>
    <h1 class="text-center text-page-title font-extrabold text-ink">ساخت حساب</h1>
    <p class="mt-3 text-center text-ink-muted">برای برنامه‌ریزی و پیگیری کارهای شخصی خود شروع کنید.</p>

    <form class="mt-9 grid gap-5" @submit.prevent="submit">
      <UiField id="signup-name" v-model="name" label="نام" autocomplete="name" :error="nameError" required />
      <UiField id="signup-email" v-model="email" label="ایمیل" type="email" autocomplete="email" placeholder="name@example.com" :error="emailError" required />
      <UiField id="signup-password" v-model="password" label="رمز عبور" type="password" autocomplete="new-password" :minlength="8" :error="passwordError" required />
      <p class="-mt-2 text-xs text-ink-muted">رمز عبور باید حداقل ۸ کاراکتر داشته باشد.</p>
      <UiButton type="submit" class="w-full" :disabled="isSubmitting">{{ isSubmitting ? 'در حال ثبت‌نام…' : 'ثبت‌نام' }}</UiButton>
      <p v-if="formError" role="alert" class="rounded-control bg-red-50 p-3 text-sm text-red-700">{{ formError }}</p>
      <p v-if="message" role="status" class="rounded-control bg-canvas p-3 text-sm text-brand">{{ message }}</p>
    </form>

    <p class="mt-8 text-center text-sm text-ink-muted">
      حساب دارید؟ <NuxtLink to="/login" class="font-bold text-brand underline-offset-4 hover:underline">وارد شوید</NuxtLink>
    </p>
  </section>
</template>
