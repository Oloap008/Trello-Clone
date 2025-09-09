<template>
  <Teleport to="body">
    <div v-if="isOpen">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/20"
        style="z-index: 99998; position: fixed"
        @click="$emit('close')"
      ></div>

      <!-- Archive Popover -->
      <div
        ref="archiveRef"
        class="fixed top-28 right-4 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-600 w-80 max-h-[80vh] overflow-hidden"
        style="z-index: 99999; position: fixed"
        @click.stop
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-gray-600"
        >
          <div class="flex items-center gap-3">
            <button
              @click="$emit('close')"
              class="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            >
              <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
            </button>
            <h3 class="text-lg font-medium text-white">Archived items</h3>
          </div>
          <button
            @click="$emit('close')"
            class="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-4">
          <!-- Search and Switch -->
          <div class="flex items-center justify-between mb-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search archive..."
              class="flex-1 p-2 text-sm bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mr-3"
            />
            <button
              @click="toggleView"
              class="px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors whitespace-nowrap"
            >
              {{
                currentView === "cards" ? "Switch to lists" : "Switch to cards"
              }}
            </button>
          </div>

          <!-- Time Period -->
          <div class="mb-4">
            <span class="text-sm text-gray-400">{{ timePeriod }}</span>
          </div>
        </div>

        <!-- Items List -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Cards View -->
          <div v-if="currentView === 'cards'">
            <div
              v-if="filteredArchivedCards.length === 0"
              class="text-center py-8 text-gray-400"
            >
              <UIcon
                name="i-heroicons-archive-box"
                class="w-8 h-8 mx-auto mb-2"
              />
              <p class="text-sm">No archived cards</p>
            </div>

            <div
              v-for="card in filteredArchivedCards"
              :key="card.id"
              class="px-4 py-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  >
                    <UIcon
                      name="i-heroicons-check"
                      class="w-3 h-3 text-white"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4 class="text-sm font-medium text-white truncate">
                      {{ card.title }}
                    </h4>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs text-gray-400"
                        >from {{ getListName(card.listId) }}</span
                      >
                      <span class="text-xs text-gray-500">•</span>
                      <span class="text-xs text-gray-400">{{
                        formatRelativeTime(card.updatedAt)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between mt-3">
                <button
                  @click="$emit('restore-card', card.id)"
                  class="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                >
                  <UIcon name="i-heroicons-arrow-uturn-left" class="w-3 h-3" />
                  Restore
                </button>
                <button
                  @click="$emit('delete-card', card.id)"
                  class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                >
                  <UIcon name="i-heroicons-trash" class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Lists View -->
          <div v-if="currentView === 'lists'">
            <div
              v-if="filteredArchivedLists.length === 0"
              class="text-center py-8 text-gray-400"
            >
              <UIcon
                name="i-heroicons-queue-list"
                class="w-8 h-8 mx-auto mb-2"
              />
              <p class="text-sm">No archived lists</p>
            </div>

            <div
              v-for="list in filteredArchivedLists"
              :key="list.id"
              class="px-4 py-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-medium text-white truncate">
                    {{ list.name }}
                  </h4>
                  <div class="flex items-center gap-2 mt-1">
                    <UIcon
                      name="i-heroicons-archive-box"
                      class="w-3 h-3 text-gray-400"
                    />
                    <span class="text-xs text-gray-400">Archived</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between mt-3">
                <button
                  @click="$emit('restore-list', list.id)"
                  class="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                >
                  <UIcon name="i-heroicons-arrow-uturn-left" class="w-3 h-3" />
                  Restore
                </button>
                <button
                  @click="$emit('delete-list', list.id)"
                  class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                >
                  <UIcon name="i-heroicons-trash" class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Card, List } from "~~/shared/types/globals";

interface Props {
  isOpen: boolean;
  archivedCards: Card[];
  archivedLists: List[];
  boardId: number;
}

defineProps<Props>();

defineEmits<{
  close: [];
  "restore-card": [cardId: number];
  "delete-card": [cardId: number];
  "restore-list": [listId: number];
  "delete-list": [listId: number];
}>();

// Local state
const currentView = ref<"cards" | "lists">("cards");
const searchQuery = ref("");
const timePeriod = ref("Past 7 days");

// Methods
const toggleView = () => {
  currentView.value = currentView.value === "cards" ? "lists" : "cards";
};

// Computed
const filteredArchivedCards = computed(() => {
  const props = getCurrentInstance()?.props as Props;
  if (!searchQuery.value.trim()) {
    return props.archivedCards || [];
  }

  const query = searchQuery.value.toLowerCase();
  return (props.archivedCards || []).filter(
    (card) =>
      card.title.toLowerCase().includes(query) ||
      (card.description && card.description.toLowerCase().includes(query))
  );
});

const filteredArchivedLists = computed(() => {
  const props = getCurrentInstance()?.props as Props;
  if (!searchQuery.value.trim()) {
    return props.archivedLists || [];
  }

  const query = searchQuery.value.toLowerCase();
  return (props.archivedLists || []).filter((list) =>
    list.name.toLowerCase().includes(query)
  );
});

const getListName = (listId: number) => {
  const dataStore = useDataStore();
  const list = dataStore.getById("lists", listId);
  return list?.name || "Unknown List";
};

const formatRelativeTime = (dateString: string | undefined) => {
  if (!dateString) return "Unknown time";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

  if (diffDays === 0) {
    if (diffHours === 0) return "Just now";
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};
</script>
