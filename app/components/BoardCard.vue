<template>
  <div
    :data-card-id="card.id"
    :data-list-id="listId"
    draggable="true"
    @dragstart="$emit('drag-start', $event, card, listId)"
    @dragend="$emit('drag-end', $event)"
    class="bg-white rounded-lg p-3 shadow-sm transition-all cursor-pointer group border-2 border-white hover:border-2 hover:border-blue-400"
    :class="{
      'opacity-75': card.isComplete,
      'border-l-4 border-l-green-500': card.isComplete,
    }"
    @click="$emit('open-card', card)"
  >
    <!-- Card content -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Checkbox -->
        <div
          @click.stop="$emit('toggle-complete', card.id)"
          class="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center cursor-pointer hover:border-gray-600 transition-all flex-shrink-0"
          :class="{
            'bg-green-500 border-green-500': card.isComplete,
            'opacity-0 group-hover:opacity-100': !card.isComplete,
            'opacity-100': card.isComplete,
          }"
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
          :class="{
            'translate-x-0 line-through text-gray-500': card.isComplete,
            'group-hover:translate-x-0 -translate-x-6': !card.isComplete,
          }"
        >
          {{ card.title }}
        </span>
      </div>

      <!-- Archive Icon (debugging - always visible) -->
      <div
        @click.stop="$emit('archive-card', card.id)"
        class="bg-red-200 transition-opacity duration-200 cursor-pointer p-1 rounded hover:bg-gray-100 flex-shrink-0"
        title="Archive card"
      >
        <span class="text-xs">{{
          card.isComplete ? "COMPLETE" : "INCOMPLETE"
        }}</span>
      </div>
    </div>
    <MemberAvatars
      :member-ids="card.assignedMembers"
      :board-id="boardId"
      :max-display="3"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  card: any;
  listId: number;
  boardId: number;
  currentUserId: number;
}

defineProps<Props>();

defineEmits<{
  "drag-start": [event: DragEvent, card: any, listId: number];
  "drag-end": [event: DragEvent];
  "toggle-complete": [cardId: number];
  "open-card": [card: any];
  "archive-card": [cardId: number];
}>();
</script>
