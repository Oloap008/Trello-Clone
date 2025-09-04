<template>
  <div
    class="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl"
  >
    <div></div>
    <UButton
      label="Cancel"
      color="neutral"
      variant="outline"
      @click="$emit('cancel')"
    />
  </div>
</template>

<script setup>
defineEmits(["cancel"]);
</script>
