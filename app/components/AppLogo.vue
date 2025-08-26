<template>
  <NuxtLink to="/" data-testid="logo">
    <div
      class="hover:opacity-75 transition items-center gap-x-2 hidden md:flex"
    >
      <!-- <NuxtImg src="/logo.svg" alt="Logo" height="30" width="30" /> -->
      <p
        :class="[
          'text-lg text-neutral-700 -ml-2 pb-2 underline decoration-orange-400 decoration-2',
          'heading-font',
        ]"
      >
        Taskify
      </p>
    </div>
  </NuxtLink>
</template>
