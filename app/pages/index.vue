<script setup>
definePageMeta({
  layout: "marketing",
});
</script>

<template>
  <div class="flex items-center justify-center flex-col">
    <div class="flex items-center justify-center flex-col font-heading">
      <div
        class="mb-4 flex items-center border shadow-sm p-4 bg-amber-100 text-amber-700 rounded-full uppercase"
      >
        <UIcon name="i-lucide-medal" class="h-6 w-6 mr-2" />
        No 1 task management
      </div>

      <h1 class="text-3xl md:text-6xl text-center text-neutral-800 mb-6">
        Trello helps team move
      </h1>

      <div
        class="text-3xl md:text-6xl text-center bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-4 p-2 rounded-md pb-4 w-fit"
      >
        work forward.
      </div>
    </div>

    <div
      class="text-sm md:text-xl text-neutral-400 mt-4 max-w-xs md:max-w-2xl text-center mx-auto font-poppins"
    >
      Collaborate, manage projects, and reach new productivity peaks. From high
      rises to the home office, the way your team works is unique - accomplish
      it all with Trello.
    </div>

    <UButton size="lg" class="mt-6"> Get Trello for free </UButton>
  </div>
</template>
