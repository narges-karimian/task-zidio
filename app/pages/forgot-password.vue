<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const email = ref('')
const message = ref('')
const emailError = ref('')
const formError = ref('')
const isSubmitting = ref(false)

async function submit() {
  if (isSubmitting.value) return

  message.value = ''
  emailError.value = ''
  formError.value = ''

  const trimmedEmail = email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    emailError.value = 'ایمیل معتبر وارد کنید.'
    return
  }

  isSubmitting.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password?recovery=1`,
    })

    if (error) {
      if (error.code === 'email_address_invalid') emailError.value = 'ایمیل معتبر وارد کنید.'
      else if (error.code === 'over_email_send_rate_limit') formError.value = 'تعداد درخواست‌های ایمیل زیاد است. کمی بعد دوباره تلاش کنید.'
      else formError.value = 'درخواست بازیابی انجام نشد. دوباره تلاش کنید.'
      return
    }

    message.value = 'اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی برای آن ارسال می‌شود.'
  } catch {
    formError.value = 'ارتباط با سرویس بازیابی برقرار نشد. دوباره تلاش کنید.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section>
    <h1 class="text-page-title font-extrabold">بازیابی رمز عبور</h1>
    <p class="mt-3 text-ink-muted">ایمیل حساب خود را وارد کنید تا لینک تعیین رمز جدید برایتان ارسال شود.</p>

    <form class="mt-9 grid gap-5" @submit.prevent="submit">
      <UiField id="recovery-email" v-model="email" label="ایمیل" type="email" autocomplete="email" placeholder="name@example.com" :error="emailError" required />
      <UiButton type="submit" class="w-full" :disabled="isSubmitting">{{ isSubmitting ? 'در حال ارسال…' : 'درخواست لینک بازیابی' }}</UiButton>
      <p v-if="formError" role="alert" class="rounded-control bg-red-50 p-3 text-sm text-red-700">{{ formError }}</p>
      <p v-if="message" role="status" class="rounded-control bg-canvas p-3 text-sm text-brand">{{ message }}</p>
    </form>

    <NuxtLink to="/login" class="mt-8 inline-block text-sm font-bold text-brand underline-offset-4 hover:underline">بازگشت به ورود</NuxtLink>
  </section>
</template>
