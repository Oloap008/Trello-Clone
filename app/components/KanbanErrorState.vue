<template>
  <div class="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-gray-600">
        Board not found or you don't have access to this board.
      </p>
      <UButton class="mt-4" @click="$router.back()">Go Back</UButton>
    </div>
  </div>
</template>
