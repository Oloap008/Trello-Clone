<template>
  <div
    class="w-72 bg-gray-200 rounded-xl p-3 flex-shrink-0 flex flex-col"
    style="height: fit-content; max-height: calc(100vh - 200px)"
    :ref="(el) => $emit('set-list-ref', el, list.id.toString())"
    @click.stop
    :data-list-id="list.id"
    draggable="true"
    @dragstart="$emit('list-drag-start', $event, list)"
    @dragend="$emit('list-drag-end', $event)"
    @dragover="$emit('list-drag-over', $event)"
    @drop="$emit('list-drop', $event, list.id)"
    :class="{
      'opacity-50': draggedList?.id === list.id,
      'border-2 border-green-400':
        closestListId === list.id.toString() && draggedList,
    }"
    @mousedown="$emit('list-mouse-down', $event)"
  >
    <!-- List Header -->
    <div class="flex items-center justify-between mb-3 flex-shrink-0">
      <!-- Editable Title -->
      <div class="flex-1 mr-2">
        <input
          v-if="editingListId === list.id"
          :value="editingListTitle"
          @input="$emit('update-editing-title', $event.target.value)"
          @blur="$emit('save-title', list.id)"
          @keydown.enter="$emit('save-title', list.id)"
          @keydown.escape="$emit('cancel-edit', list.id)"
          :ref="(el) => $emit('set-title-input-ref', el, list.id.toString())"
          class="w-full text-sm font-medium text-gray-800 bg-white border-2 border-blue-500 rounded px-2 py-1 focus:outline-none"
          maxlength="512"
        />
        <h2
          v-else
          @click="$emit('start-editing-title', list.id, list.name)"
          class="text-sm font-medium text-gray-800 px-2 py-1 rounded hover:bg-gray-300 cursor-pointer"
        >
          {{ list.name }}
        </h2>
      </div>

      <div class="flex items-center gap-1">
        <ListActionsMenu
          :list-id="list.id"
          @archive-list="$emit('archive-list', $event)"
          @archive-all-cards="$emit('archive-all-cards', $event)"
        />
      </div>
    </div>

    <!-- Cards Container -->
    <div
      class="flex-1 min-h-[20px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
      style="max-height: calc(100vh - 280px)"
      :data-list-id="list.id"
      @drop="$emit('card-drop', $event, list.id)"
      @dragover="$emit('card-drag-over', $event)"
    >
      <div class="space-y-2 mb-2">
        <template v-for="(card, index) in listCards" :key="card.id">
          <!-- Insert placeholder before the current card if needed -->
          <div
            v-if="
              draggedCard &&
              placeholderListId === list.id.toString() &&
              placeholderIndex === index
            "
            class="h-10 bg-gray-300 rounded-lg opacity-50"
          ></div>

          <!-- Card -->
          <div
            :data-card-id="card.id"
            :data-list-id="list.id"
            draggable="true"
            @dragstart="$emit('card-drag-start', $event, card, list.id)"
            @dragend="$emit('card-drag-end', $event)"
            class="bg-white rounded-lg p-3 shadow-sm transition-all cursor-pointer group border-2 border-white hover:border-2 hover:border-blue-400 w-full"
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
                  class="text-sm text-gray-800 transition-transform duration-200 ease-out break-words"
                  :class="{
                    'translate-x-0': card.isComplete,
                    'group-hover:translate-x-0 -translate-x-6':
                      !card.isComplete,
                  }"
                >
                  {{ card.title }}
                </span>
              </div>

              <!-- Archive Icon (only shows on hover for completed cards) -->
              <div
                v-if="card.isComplete"
                @click.stop="$emit('archive-card', card.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer p-1 rounded hover:bg-gray-100 flex-shrink-0"
                title="Archive card"
              >
                <UIcon
                  name="i-heroicons-inbox-arrow-down"
                  class="w-4 h-4 text-gray-500 hover:text-gray-700"
                  draggable="false"
                />
              </div>
            </div>
            <MemberAvatars
              :member-ids="card.assignedMembers"
              :board-id="boardId"
              :max-display="3"
            />
          </div>
        </template>

        <!-- Insert placeholder at the end if needed -->
        <div
          v-if="
            draggedCard &&
            placeholderListId === list.id.toString() &&
            placeholderIndex === listCards.length
          "
          class="h-10 bg-gray-300 rounded-lg opacity-50"
        ></div>
      </div>
    </div>

    <!-- Add Card Section - Fixed at bottom -->
    <div class="flex-shrink-0 mt-2">
      <div v-if="addingCardToList !== list.id">
        <UButton
          variant="ghost"
          size="sm"
          class="w-full justify-start text-gray-600 hover:bg-gray-300 rounded-lg"
          @click="$emit('start-adding-card', list.id)"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
          Add a card
        </UButton>
      </div>

      <!-- Add Card Form -->
      <div v-else class="space-y-2" @click.stop>
        <textarea
          :value="newCardTitle"
          @input="$emit('update-card-title', $event.target.value)"
          :ref="(el) => $emit('set-card-input-ref', el, list.id.toString())"
          placeholder="Enter a title or paste a link"
          class="w-full p-3 text-sm border-none rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          rows="3"
          @keydown.escape="$emit('cancel-add-card')"
          @keydown.enter="$emit('handle-enter', $event)"
        ></textarea>
        <div class="flex items-center gap-2">
          <UButton
            color="primary"
            size="sm"
            @click="$emit('add-card', list.id)"
            :disabled="!newCardTitle.trim()"
          >
            Add card
          </UButton>
          <UButton
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
            @click="$emit('cancel-add-card')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { List } from "~~/shared/types/globals";

interface Props {
  list: List;
  boardId: number;
  currentUserId: number;
  listCards: any[];
  editingListId: number | null;
  editingListTitle: string;
  addingCardToList: number | null;
  newCardTitle: string;
  draggedCard: any;
  draggedList: any;
  placeholderListId: string | null;
  placeholderIndex: number | null;
  closestListId: string | null;
}

defineProps<Props>();

defineEmits<{
  "start-editing-title": [listId: number, currentTitle: string];
  "update-editing-title": [value: string];
  "save-title": [listId: number];
  "cancel-edit": [listId: number];
  "delete-list": [listId: number];
  "start-adding-card": [listId: number];
  "update-card-title": [value: string];
  "add-card": [listId: number];
  "cancel-add-card": [];
  "handle-enter": [event: KeyboardEvent];
  "toggle-complete": [cardId: number];
  "open-card": [card: any];
  "card-drag-start": [event: DragEvent, card: any, listId: number];
  "card-drag-end": [event: DragEvent];
  "card-drag-over": [event: DragEvent];
  "card-drop": [event: DragEvent, listId: number];
  "list-drag-start": [event: DragEvent, list: List];
  "list-drag-end": [event: DragEvent];
  "list-drag-over": [event: DragEvent];
  "list-drop": [event: DragEvent, listId: number];
  "list-mouse-down": [event: MouseEvent];
  "set-list-ref": [el: HTMLElement | null, listId: string];
  "set-title-input-ref": [el: HTMLInputElement | null, listId: string];
  "set-card-input-ref": [el: HTMLTextAreaElement | null, listId: string];
  "archive-card": [cardId: number];
  "archive-list": [listId: number];
  "archive-all-cards": [listId: number];
}>();
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
