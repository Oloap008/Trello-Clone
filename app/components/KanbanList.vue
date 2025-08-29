<template>
  <div
    class="w-72 bg-gray-200 rounded-xl p-3 flex-shrink-0 flex flex-col h-full"
    :ref="(el) => setListRef(el, list.id.toString())"
    @click.stop
    :data-list-id="list.id"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="$emit('list-drag-end', $event)"
    @dragover="$emit('list-drag-over', $event)"
    @drop="$emit('list-drop', $event, list.id)"
    :class="dragClasses"
    @mousedown="$emit('list-mouse-down', $event)"
  >
    <!-- List Header -->
    <div class="flex items-center justify-between mb-3 flex-shrink-0">
      <div class="flex-1 mr-2">
        <input
          v-if="editableTitle.editingId.value === list.id"
          v-model="editableTitle.editingTitle.value"
          @blur="saveTitle"
          @keydown.enter="saveTitle"
          @keydown.escape="editableTitle.cancelEdit"
          :ref="(el) => editableTitle.setInputRef(el, list.id.toString())"
          class="w-full text-sm font-medium text-gray-800 bg-white border-2 border-blue-500 rounded px-2 py-1 focus:outline-none"
          maxlength="512"
        />
        <h2
          v-else
          @click="editableTitle.startEditing(list.id, list.name)"
          class="text-sm font-medium text-gray-800 px-2 py-1 rounded hover:bg-gray-300 cursor-pointer"
        >
          {{ list.name }}
        </h2>
      </div>

      <div class="flex items-center gap-1">
        <UButton
          variant="ghost"
          size="xs"
          icon="i-heroicons-arrows-pointing-out"
          class="text-gray-600 hover:bg-gray-300"
        />
        <UButton
          variant="ghost"
          size="xs"
          icon="i-heroicons-ellipsis-horizontal"
          class="text-gray-600 hover:bg-gray-300"
          @click="$emit('delete-list', list.id)"
        />
      </div>
    </div>

    <!-- Cards Container -->
    <div
      class="flex-1 min-h-[20px] max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
      :data-list-id="list.id"
      @drop="$emit('card-drop', $event, list.id)"
      @dragover="$emit('card-drag-over', $event)"
    >
      <div class="space-y-2 mb-2">
        <template v-for="(card, index) in cards" :key="card.id">
          <!-- Drag placeholder -->
          <div
            v-if="showPlaceholder(index)"
            class="h-10 bg-gray-300 rounded-lg opacity-50"
          />

          <!-- Card Component -->
          <KanbanCard
            :card="card"
            :list-id="list.id"
            @click="$emit('open-card-modal', card)"
            @drag-start="$emit('card-drag-start', $event, card, list.id)"
            @drag-end="$emit('card-drag-end', $event)"
            @toggle-complete="$emit('toggle-complete', card.id)"
          />
        </template>

        <!-- End placeholder -->
        <div
          v-if="showEndPlaceholder"
          class="h-10 bg-gray-300 rounded-lg opacity-50"
        />
      </div>
    </div>

    <!-- Add Card Section -->
    <KanbanCardForm
      :list-id="list.id"
      :is-adding="addingCardToList === list.id"
      @start-adding="$emit('start-adding-card', list.id)"
      @add-card="$emit('add-card', list.id, $event)"
      @cancel="$emit('cancel-add-card')"
    />
  </div>
</template>

<script setup lang="ts">
import type { List, Card } from "~/types";
import KanbanCard from "./KanbanCard.vue";

interface Props {
  list: List;
  cards: Card[];
  draggedList?: List | null;
  closestListId?: string | null;
  draggedCard?: any;
  placeholderListId?: string | null;
  placeholderIndex?: number | null;
  addingCardToList?: number | null;
}

interface Emits {
  (e: "set-list-ref", el: HTMLElement | null, listId: string): void;
  (e: "list-drag-start", event: DragEvent, list: List): void;
  (e: "list-drag-end", event: DragEvent): void;
  (e: "list-drag-over", event: DragEvent): void;
  (e: "list-drop", event: DragEvent, listId: number): void;
  (e: "list-mouse-down", event: MouseEvent): void;
  (e: "delete-list", listId: number): void;
  (e: "update-list", listId: number, updates: any): void;
  (e: "card-drop", event: DragEvent, listId: number): void;
  (e: "card-drag-over", event: DragEvent): void;
  (e: "open-card-modal", card: any): void;
  (e: "card-drag-start", event: DragEvent, card: any, listId: number): void;
  (e: "card-drag-end", event: DragEvent): void;
  (e: "toggle-complete", cardId: number): void;
  (e: "start-adding-card", listId: number): void;
  (e: "add-card", listId: number, title: string): void;
  (e: "cancel-add-card"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const editableTitle = useEditableTitle();

const dragClasses = computed(() => ({
  "opacity-50": props.draggedList?.id === props.list.id,
  "border-2 border-green-400":
    props.closestListId === props.list.id.toString() && props.draggedList,
}));

const showPlaceholder = (index: number) => {
  return (
    props.draggedCard &&
    props.placeholderListId === props.list.id.toString() &&
    props.placeholderIndex === index
  );
};

const showEndPlaceholder = computed(() => {
  return (
    props.draggedCard &&
    props.placeholderListId === props.list.id.toString() &&
    props.placeholderIndex === props.cards.length
  );
});

const setListRef = (el: HTMLElement | null, listId: string) => {
  emit("set-list-ref", el, listId);
};

const handleDragStart = (event: DragEvent) => {
  if (editableTitle.editingId.value === props.list.id) {
    event.preventDefault();
    return;
  }
  emit("list-drag-start", event, props.list);
};

const saveTitle = () => {
  if (editableTitle.editingTitle.value.trim()) {
    emit("update-list", props.list.id, {
      name: editableTitle.editingTitle.value.trim(),
    });
  }
  editableTitle.cancelEdit();
};
</script>
