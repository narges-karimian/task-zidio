<script setup lang="ts">
import logoUrl from '~/assets/images/Logo.svg'

defineProps<{
  to: string
}>()
</script>

<template>
  <NuxtLink :to="to" aria-label="لوگوی تسک‌زیدیو" class="inline-flex shrink-0 items-center">
    <img :src="logoUrl" alt="تسک‌زیدیو" width="262" height="48" class="h-10 w-auto max-w-full sm:h-12">
  </NuxtLink>
</template>
