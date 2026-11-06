<script setup lang="ts">
const slides = [
  {
    title: 'کارهایتان را در یک جا ببینید',
    description: 'وظایف شخصی را ثبت کنید و برای هر روز برنامه‌ای روشن داشته باشید.',
  },
  {
    title: 'روی کارهای مهم تمرکز کنید',
    description: 'با اولویت و تاریخ سررسید، وظایف مهم و عقب‌افتاده را زودتر پیدا کنید.',
  },
  {
    title: 'پیشرفت خود را دنبال کنید',
    description: 'وضعیت وظایف را تغییر دهید و نمایی از کارهای انجام‌شده ببینید.',
  },
]

const currentIndex = ref(0)
const currentSlide = computed(() => slides[currentIndex.value]!)

function previous() {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length
}

function next() {
  currentIndex.value = (currentIndex.value + 1) % slides.length
}
</script>

<template>
  <div class="mx-auto w-full max-w-xl text-center">
    <div aria-live="polite" aria-atomic="true" class="min-h-60">
      <Transition name="feature-slide" mode="out-in">
        <div :key="currentIndex">
          <p class="mb-7 text-sm font-bold text-white/75">مدیریت وظایف شخصی</p>
          <h2 class="text-3xl font-extrabold leading-relaxed xl:text-4xl">{{ currentSlide.title }}</h2>
          <p class="mx-auto mt-5 max-w-md text-base leading-8 text-white/85">{{ currentSlide.description }}</p>
        </div>
      </Transition>
    </div>

    <div class="mt-8 flex items-center justify-center gap-4" role="group" aria-label="کنترل اسلایدر ویژگی‌ها">
      <button type="button" class="grid size-11 place-items-center rounded-full text-2xl text-white/85 hover:bg-white/15" aria-label="اسلاید قبلی" @click="previous">→</button>
      <div class="flex items-center gap-1">
        <button
          v-for="(_, index) in slides"
          :key="index"
          type="button"
          :aria-label="`نمایش ویژگی ${index + 1}`"
          :aria-pressed="currentIndex === index"
          class="grid size-8 place-items-center rounded-full"
          @click="currentIndex = index"
        >
          <span class="size-2.5 rounded-full transition-colors" :class="currentIndex === index ? 'bg-white' : 'bg-white/45'" />
        </button>
      </div>
      <button type="button" class="grid size-11 place-items-center rounded-full text-2xl text-white/85 hover:bg-white/15" aria-label="اسلاید بعدی" @click="next">←</button>
    </div>
  </div>
</template>

<style scoped>
.feature-slide-enter-active,
.feature-slide-leave-active {
  transition: opacity 280ms ease, transform 280ms ease;
}

.feature-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.feature-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@media (prefers-reduced-motion: reduce) {
  .feature-slide-enter-active,
  .feature-slide-leave-active {
    transition: none;
  }

  .feature-slide-enter-from,
  .feature-slide-leave-to {
    transform: none;
  }
}
</style>
