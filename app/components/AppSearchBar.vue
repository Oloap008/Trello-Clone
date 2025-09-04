<template>
  <div class="relative">
    <UInput
      v-model="searchQuery"
      placeholder="Search"
      size="sm"
      class="w-64"
      icon="i-heroicons-magnifying-glass-20-solid"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";

const searchQuery = ref("");
</script>
