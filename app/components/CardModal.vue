<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4"
    @click="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white rounded-lg w-full max-w-[1080px] max-h-[90vh] overflow-hidden shadow-xl"
      @click.stop
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200"
      >
        <div class="flex items-center">
          <!-- Move Card Popover -->
          <MoveCardPopover
            :card-id="selectedCard?.id"
            :current-list-id="currentListId"
            :current-board-id="boardId"
            @moved="$emit('card-moved', $event)"
          />
        </div>

        <div class="flex items-center gap-2">
          <UButton
            variant="ghost"
            size="xs"
            class="text-gray-500 hover:text-gray-700"
          >
            <UIcon
              name="i-heroicons-arrow-top-right-on-square"
              class="w-4 h-4"
            />
          </UButton>
          <UButton
            variant="ghost"
            size="xs"
            class="text-gray-500 hover:text-gray-700"
          >
            <UIcon name="i-heroicons-arrows-pointing-out" class="w-4 h-4" />
          </UButton>
          <UButton
            variant="ghost"
            size="xs"
            class="text-gray-500 hover:text-gray-700"
          >
            <UIcon name="i-heroicons-ellipsis-horizontal" class="w-4 h-4" />
          </UButton>
          <UButton
            variant="ghost"
            size="xs"
            @click="$emit('close')"
            class="text-gray-500 hover:text-gray-700"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </UButton>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="flex h-full">
        <!-- Left Column - Main Content -->
        <div
          class="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
        >
          <!-- Card Title with Checkbox -->
          <div class="flex items-center gap-3 mb-6">
            <div
              @click="$emit('toggle-complete')"
              class="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center cursor-pointer hover:border-gray-600 transition-all flex-shrink-0"
              :class="{
                'bg-green-500 border-green-500': selectedCard?.isComplete,
                'bg-white': !selectedCard?.isComplete,
              }"
            >
              <UIcon
                v-if="selectedCard?.isComplete"
                name="i-heroicons-check"
                class="w-3 h-3 text-white"
              />
            </div>

            <div class="flex-1 min-w-0">
              <input
                v-if="isEditingTitle"
                :value="selectedCardTitle"
                @input="$emit('update-title', $event.target.value)"
                @blur="$emit('save-title')"
                @keydown.enter="$emit('save-title')"
                @keydown.escape="$emit('cancel-title-edit')"
                :ref="(el) => $emit('set-title-input-ref', el)"
                class="w-full text-xl font-medium text-gray-900 bg-white border-none focus:outline-none p-0 m-0"
              />
              <h1
                v-else
                @click="$emit('start-editing-title')"
                class="text-xl font-medium text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded -ml-2"
              >
                {{ selectedCard?.title }}
              </h1>
            </div>
          </div>

          <!-- Action Buttons Row -->
          <div class="flex flex-wrap gap-2 mb-8">
            <button
              class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
            >
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
              Add
            </button>
            <button
              class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
            >
              <UIcon name="i-heroicons-tag" class="w-4 h-4" />
              Labels
            </button>
            <button
              class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
            >
              <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
              Dates
            </button>
            <button
              class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
            >
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4" />
              Checklist
            </button>
            <MembersPopover
              :board-id="boardId"
              :card-id="selectedCard?.id"
              @member-added="$emit('member-added', $event)"
              @member-removed="$emit('member-removed', $event)"
            />
          </div>

          <ModalMemberDisplay
            :member-ids="selectedCard?.assignedMembers"
            :board-id="boardId"
          />

          <!-- Description Section -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <UIcon
                name="i-heroicons-bars-3-bottom-left"
                class="w-5 h-5 text-gray-600"
              />
              <h3 class="text-base font-semibold text-gray-800">Description</h3>
            </div>

            <div class="ml-8">
              <div
                v-if="selectedCard?.description"
                class="p-3 text-sm rounded-sm text-gray-700 border border-gray-200"
              >
                {{ selectedCard.description }}
              </div>
              <div
                v-else
                class="w-full p-4 text-sm border border-gray-300 rounded-sm cursor-pointer hover:bg-gray-50 text-gray-500 bg-gray-50"
              >
                Add a more detailed description...
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Activity -->
        <div
          class="w-full sm:w-[428px] border-l border-gray-200 bg-gray-50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
        >
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-heroicons-chat-bubble-left-right"
                  class="w-5 h-5 text-gray-600"
                />
                <h3 class="text-base font-medium text-gray-800">
                  Comments and activity
                </h3>
              </div>
              <button
                class="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Show details
              </button>
            </div>

            <!-- Comment Input -->
            <textarea
              :value="newComment"
              @input="$emit('update-comment', $event.target.value)"
              placeholder="Write a comment..."
              class="w-full p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white mb-6"
              rows="3"
            ></textarea>

            <!-- Activity List -->
            <div
              v-for="activity in cardActivities"
              :key="activity.id"
              class="flex gap-3 mb-4"
            >
              <div
                class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
              >
                {{ getUserInitials(activity.userId) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-800">
                  <span class="font-medium">{{
                    getUserName(activity.userId)
                  }}</span>
                  <span class="text-gray-600">{{ activity.description }}</span>
                </div>
                <button class="text-xs text-blue-600 hover:underline mt-1">
                  {{ formatDate(activity.createdAt) }}
                </button>
              </div>
            </div>

            <!-- Default Activity if no activities exist -->
            <div v-if="cardActivities.length === 0" class="flex gap-3">
              <div
                class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
              >
                PH
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-800">
                  <span class="font-medium">Paolo Henry Co</span>
                  <span class="text-gray-600">
                    added this card to {{ getCurrentListTitle() }}
                  </span>
                </div>
                <button class="text-xs text-blue-600 hover:underline mt-1">
                  1 hour ago
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  selectedCard?: any;
  selectedCardTitle: string;
  isEditingTitle: boolean;
  boardId: number;
  currentListId?: number;
  cardActivities: any[];
  newComment: string;
}

defineProps<Props>();

defineEmits<{
  close: [];
  "card-moved": [payload: { cardId: number; listId: number; position: number }];
  "member-added": [payload: any];
  "member-removed": [payload: any];
  "toggle-complete": [];
  "start-editing-title": [];
  "update-title": [value: string];
  "save-title": [];
  "cancel-title-edit": [];
  "update-comment": [value: string];
  "set-title-input-ref": [el: HTMLInputElement | null];
}>();

// Helper functions for the activity section
const dataStore = useDataStore();
const boardStore = useBoardStore();

const getUserName = (userId: number) => {
  const user = dataStore.users.value.find((u) => u.id === userId);
  return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
};

const getUserInitials = (userId: number) => {
  const user = dataStore.users.value.find((u) => u.id === userId);
  return user ? `${user.firstName[0]}${user.lastName[0]}` : "U";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return "just now";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

const getCurrentListTitle = () => {
  if (boardStore.getCurrentListTitle) {
    return boardStore.getCurrentListTitle();
  }
  return "Unknown List";
};
</script>
