<template>
  <div class="grid min-h-dvh bg-surface text-ink lg:grid-cols-2">
    <main class="flex min-w-0 flex-col px-5 py-7 sm:px-10 lg:px-16 lg:py-10">
      <header class="flex justify-center">
        <BrandLogo to="/login" />
      </header>
      <div class="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-12 lg:py-16">
        <slot />
      </div>
    </main>

    <aside class="hidden min-h-dvh items-center justify-center bg-brand px-12 py-16 text-white lg:flex xl:px-20">
      <FeatureSlider />
    </aside>
  </div>
</template>
