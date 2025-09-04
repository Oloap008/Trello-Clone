<template>
  <div class="flex items-center justify-between p-6 border-b border-gray-100">
    <h2 class="text-lg font-semibold">{{ title }}</h2>
    <button
      @click="$emit('close')"
      class="text-gray-400 hover:text-gray-600 transition-colors"
    >
      <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: String,
});

defineEmits(["close"]);
</script>
