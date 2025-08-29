<template>
  <div
    :data-card-id="card.id"
    :data-list-id="listId"
    draggable="true"
    @dragstart="$emit('drag-start', $event)"
    @dragend="$emit('drag-end', $event)"
    class="bg-white rounded-lg p-3 shadow-sm transition-all cursor-pointer group border-2 border-white hover:border-2 hover:border-blue-400"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Checkbox -->
        <div
          @click.stop="$emit('toggle-complete')"
          class="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center cursor-pointer hover:border-gray-600 transition-all flex-shrink-0"
          :class="checkboxClasses"
        >
          <UIcon
            v-if="card.isComplete"
            name="i-heroicons-check"
            class="w-3 h-3 text-white"
            draggable="false"
          />
        </div>
        <span
          class="text-sm text-gray-800 transition-transform duration-200 ease-out"
          :class="titleClasses"
        >
          {{ card.title }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from "~/types";

interface Props {
  card: Card;
  listId: number;
}

interface Emits {
  (e: "click"): void;
  (e: "drag-start", event: DragEvent): void;
  (e: "drag-end", event: DragEvent): void;
  (e: "toggle-complete"): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const checkboxClasses = computed(() => ({
  "bg-green-500 border-green-500": props.card.isComplete,
  "opacity-0 group-hover:opacity-100": !props.card.isComplete,
  "opacity-100": props.card.isComplete,
}));

const titleClasses = computed(() => ({
  "translate-x-0": props.card.isComplete,
  "group-hover:translate-x-0 -translate-x-6": !props.card.isComplete,
}));
</script>
