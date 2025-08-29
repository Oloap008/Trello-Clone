<template>
  <div class="group cursor-pointer h-28" @click="$emit('click', board.id)">
    <div
      class="relative h-20 rounded-t-lg overflow-hidden transition-all duration-200 hover:shadow-md"
      :style="{ backgroundColor: board.color || '#0079bf' }"
    >
      <!-- Background Image (if exists) -->
      <div
        v-if="board.backgroundImage"
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${board.backgroundImage})` }"
      ></div>

      <!-- Hover Overlay -->
      <div
        class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
      ></div>
    </div>

    <!-- Board title as part of the card -->
    <div
      class="bg-white border border-gray-200 border-t-0 rounded-b-lg p-2 h-8 flex items-center"
    >
      <h4 class="text-sm font-medium text-gray-900 truncate">
        {{ board.name }}
      </h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Board } from "~~/shared/types/globals";

interface Props {
  board: Board;
}

defineProps<Props>();

defineEmits<{
  click: [board: Board];
}>();
</script>
