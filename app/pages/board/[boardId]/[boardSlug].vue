<template>
  <div
    v-if="isAppReady && currentBoard"
    class="p-6 bg-gray-100 min-h-screen flex flex-col"
    @click="handleBackgroundClick"
    @dragover="handleGlobalDragOver"
    :style="{
      backgroundColor: currentBoard.color || '#f3f4f6',
      backgroundImage: currentBoard.backgroundImage
        ? `url(${currentBoard.backgroundImage})`
        : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
  >
    <!-- Board Container -->
    <div class="flex flex-1 gap-4 overflow-x-auto pb-4" id="lists-container">
      <!-- Lists -->
      <div
        v-for="list in boardLists"
        :key="list.id"
        class="w-72 bg-gray-200 rounded-xl p-3 flex-shrink-0 flex flex-col h-full"
        :ref="(el) => setListRef(el, list.id.toString())"
        @click.stop
        :data-list-id="list.id"
        draggable="true"
        @dragstart="handleListDragStart($event, list)"
        @dragend="handleListDragEnd"
        @dragover="handleListDragOver"
        @drop="handleListDrop($event, list.id)"
        :class="{
          'opacity-50': draggedList?.id === list.id,
          'border-2 border-green-400':
            closestListId === list.id.toString() && draggedList,
        }"
        @mousedown="handleListMouseDown"
      >
        <!-- List Header -->
        <div class="flex items-center justify-between mb-3 flex-shrink-0">
          <!-- Editable Title -->
          <div class="flex-1 mr-2">
            <input
              v-if="editingListId === list.id"
              v-model="editingListTitle"
              @blur="saveListTitle(list.id)"
              @keydown.enter="saveListTitle(list.id)"
              @keydown.escape="cancelListEdit(list.id)"
              :ref="(el) => setTitleInputRef(el, list.id.toString())"
              class="w-full text-sm font-medium text-gray-800 bg-white border-2 border-blue-500 rounded px-2 py-1 focus:outline-none"
              maxlength="512"
            />
            <h2
              v-else
              @click="startEditingListTitle(list.id, list.name)"
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
              @click="deleteList(list.id)"
            />
          </div>
        </div>

        <!-- Cards Container -->
        <div
          class="flex-1 min-h-[20px] max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          :data-list-id="list.id"
          @drop="handleCardDrop($event, list.id)"
          @dragover="handleCardDragOver"
        >
          <div class="space-y-2 mb-2">
            <template
              v-for="(card, index) in getListCards(list.id)"
              :key="card.id"
            >
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
                @dragstart="handleCardDragStart($event, card, list.id)"
                @dragend="handleCardDragEnd"
                class="bg-white rounded-lg p-3 shadow-sm transition-all cursor-pointer group border-2 border-white hover:border-2 hover:border-blue-400"
                @click="openCardModal(card)"
              >
                <!-- Card content -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <!-- Checkbox -->
                    <div
                      @click.stop="toggleComplete(card.id)"
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
                        'translate-x-0': card.isComplete,
                        'group-hover:translate-x-0 -translate-x-6':
                          !card.isComplete,
                      }"
                      >{{ card.title }}</span
                    >
                  </div>
                </div>
              </div>
            </template>

            <!-- Insert placeholder at the end if needed -->
            <div
              v-if="
                draggedCard &&
                placeholderListId === list.id.toString() &&
                placeholderIndex === getListCards(list.id).length
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
              @click="startAddingCard(list.id)"
            >
              <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
              Add a card
            </UButton>
          </div>

          <!-- Add Card Form -->
          <div v-else class="space-y-2" @click.stop>
            <textarea
              v-model="newCardTitle"
              :ref="(el) => setCardInputRef(el, list.id.toString())"
              placeholder="Enter a title or paste a link"
              class="w-full p-3 text-sm border-none rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              rows="3"
              @keydown.escape="cancelAddCard"
              @keydown.enter="handleEnter"
            ></textarea>
            <div class="flex items-center gap-2">
              <UButton
                color="primary"
                size="sm"
                @click="addCard(list.id)"
                :disabled="!newCardTitle.trim()"
              >
                Add card
              </UButton>
              <UButton
                variant="ghost"
                size="sm"
                icon="i-heroicons-x-mark"
                @click="cancelAddCard"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Add List Button/Form -->
      <div class="w-72 flex-shrink-0">
        <div v-if="!isAddingList">
          <UButton
            variant="ghost"
            size="sm"
            class="w-full justify-start text-gray-600 hover:bg-gray-300 rounded-lg bg-white/60 backdrop-blur-sm h-12"
            @click.stop="startAddingList"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
            Add another list
          </UButton>
        </div>

        <!-- Add List Form -->
        <div v-else class="bg-gray-200 rounded-xl p-3" @click.stop>
          <textarea
            v-model="newListTitle"
            ref="listInput"
            placeholder="Enter list title..."
            class="w-full p-3 text-sm border-none rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-2"
            rows="2"
            @keydown.escape="cancelAddList"
            @keydown.enter="handleListEnter"
          ></textarea>
          <div class="flex items-center gap-2">
            <UButton
              color="primary"
              size="sm"
              @click="addList"
              :disabled="!newListTitle.trim()"
            >
              Add list
            </UButton>
            <UButton
              variant="ghost"
              size="sm"
              icon="i-heroicons-x-mark"
              @click="cancelAddList"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Card Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4"
      @click="closeModal"
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
            <select
              class="bg-transparent text-sm font-medium text-gray-700 border-none focus:outline-none cursor-pointer pr-6"
            >
              <option>{{ getCurrentListTitle() }}</option>
            </select>
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-4 h-4 text-gray-500 -ml-5"
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
              @click="closeModal"
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
                @click="toggleCardComplete"
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
                  v-if="isEditingCardTitle"
                  v-model="selectedCardTitle"
                  @blur="saveCardTitle"
                  @keydown.enter="saveCardTitle"
                  @keydown.escape="cancelCardTitleEdit"
                  ref="cardTitleInput"
                  class="w-full text-xl font-medium text-gray-900 bg-white border-none focus:outline-none p-0 m-0"
                />
                <h1
                  v-else
                  @click="startEditingCardTitle"
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
              <button
                class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
              >
                <UIcon name="i-heroicons-user-group" class="w-4 h-4" />
                Members
              </button>
            </div>

            <!-- Description Section -->
            <div class="mb-8">
              <div class="flex items-center gap-3 mb-4">
                <UIcon
                  name="i-heroicons-bars-3-bottom-left"
                  class="w-5 h-5 text-gray-600"
                />
                <h3 class="text-base font-semibold text-gray-800">
                  Description
                </h3>
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
                v-model="newComment"
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
                    <span class="text-gray-600">{{
                      activity.description
                    }}</span>
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
                      added this card to {{ getCurrentListTitle() }}</span
                    >
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
  </div>

  <!-- Board not found state -->
  <div
    v-else-if="!currentBoard && isAppReady"
    class="p-6 bg-gray-100 min-h-screen flex items-center justify-center"
  >
    <div class="text-center">
      <p class="text-gray-600">
        Board not found or you don't have access to this board.
      </p>
      <UButton class="mt-4" @click="$router.back()">Go Back</UButton>
    </div>
  </div>

  <!-- Loading State -->
  <div
    v-else
    class="p-6 bg-gray-100 min-h-screen flex items-center justify-center"
  >
    <div class="text-center">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-4"
      ></div>
      <p class="text-gray-600">Loading your board...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { List, Card } from "~/types";

// Use the app layout
definePageMeta({
  layout: "home",
  showSidebar: false,
});

// Get route params
const route = useRoute();
const boardId = computed(() => {
  const id = route.params.boardId;
  return typeof id === "string" ? parseInt(id) : null;
});

// Get stores
const dataStore = useDataStore();
const boardStore = useBoardStore();

// Set the current board ID in the board store
watchEffect(() => {
  if (boardId.value && boardStore.setBoardId) {
    boardStore.setBoardId(boardId.value);
  }
});

// Get current board and its data
const currentBoard = computed(() => boardStore.currentBoard);
const boardLists = computed(() =>
  dataStore.getListsForBoard(boardId.value || 0)
);

// Enhanced loading state with minimum delay
const isAppReady = ref(false);

onMounted(() => {
  const checkReady = () => {
    if (dataStore.isLoaded) {
      // Add a small delay to ensure users can see the loading state
      setTimeout(() => {
        isAppReady.value = true;
      }, 300); // 300ms delay
    } else {
      setTimeout(checkReady, 50); // Check again in 50ms
    }
  };
  checkReady();
});

// Get cards for a specific list
const getListCards = (listId: number) => {
  return dataStore.getCardsForList(listId);
};

// Component state
const listRefs = ref<Record<string, HTMLElement | null>>({});
const titleInputRefs = ref<Record<string, HTMLInputElement | null>>({});
const cardInputRefs = ref<Record<string, HTMLTextAreaElement | null>>({});

const placeholderListId = ref<string | null>(null);
const placeholderIndex = ref<number | null>(null);
const closestListId = ref<string | null>(null);

const editingListId = ref<number | null>(null);
const editingListTitle = ref("");
const isAddingList = ref(false);
const newListTitle = ref("");
const listInput = ref<HTMLTextAreaElement>();

const addingCardToList = ref<number | null>(null);
const newCardTitle = ref("");

// Modal state - use board store
const isModalOpen = computed(() => boardStore.isModalOpen);
const selectedCard = computed(() => boardStore.selectedCard);
const selectedCardTitle = ref("");
const isEditingCardTitle = ref(false);
const cardTitleInput = ref<HTMLInputElement>();
const newComment = ref("");
const selectedCardListId = ref<string | null>(null);

// Get card activities
const cardActivities = computed(() => {
  if (!selectedCard.value) return [];
  const cardId =
    typeof selectedCard.value.id === "string"
      ? parseInt(selectedCard.value.id)
      : selectedCard.value.id;
  return boardStore.getCardActivities(cardId);
});

const draggedCard = ref<{ card: any; sourceListId: number } | null>(null);
const draggedList = ref<List | null>(null);

// Helper functions
const setListRef = (el: HTMLElement | null, listId: string) => {
  listRefs.value[listId] = el;
};

const setTitleInputRef = (el: HTMLInputElement | null, listId: string) => {
  titleInputRefs.value[listId] = el;
};

const setCardInputRef = (el: HTMLTextAreaElement | null, listId: string) => {
  cardInputRefs.value[listId] = el;
};

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

// Enhanced drag detection functions
const detectClosestListForList = (x: number, y: number) => {
  let minDistance = Infinity;
  let closestId: string | null = null;

  for (const [id, el] of Object.entries(listRefs.value)) {
    if (el && id !== draggedList.value?.id.toString()) {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestId = id;
      }
    }
  }

  closestListId.value = closestId;
};

const detectClosestListForCard = (x: number, y: number) => {
  let minDistance = Infinity;
  let closest: { id: string; element: HTMLElement } | null = null;

  for (const [id, el] of Object.entries(listRefs.value)) {
    if (el) {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = { id, element: el };
      }
    }
  }
  return closest;
};

// Enhanced global drag over handler
const handleGlobalDragOver = (event: DragEvent) => {
  event.preventDefault();

  if (draggedCard.value) {
    const closestList = detectClosestListForCard(event.clientX, event.clientY);
    if (!closestList) return;

    closestListId.value = closestList.id;

    const rect = closestList.element.getBoundingClientRect();
    const insideList =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!insideList) {
      placeholderListId.value = closestList.id;
      const listCards = getListCards(parseInt(closestList.id));
      placeholderIndex.value = listCards.length;
    }
  }

  if (draggedList.value) {
    detectClosestListForList(event.clientX, event.clientY);
  }
};

// List functions
const startAddingList = () => {
  isAddingList.value = true;
  nextTick(() => {
    listInput.value?.focus();
  });
};

const addList = () => {
  if (newListTitle.value.trim() && boardStore.createList) {
    boardStore.createList(newListTitle.value.trim());
    newListTitle.value = "";
    isAddingList.value = false;
  }
};

const cancelAddList = () => {
  isAddingList.value = false;
  newListTitle.value = "";
};

const handleListEnter = (event: KeyboardEvent) => {
  if (!event.shiftKey) {
    event.preventDefault();
    addList();
  }
};

const deleteList = (listId: number) => {
  if (boardStore.deleteList) {
    boardStore.deleteList(listId);
  }
};

const startEditingListTitle = (listId: number, currentTitle: string) => {
  editingListId.value = listId;
  editingListTitle.value = currentTitle;
  nextTick(() => {
    const input = titleInputRefs.value[listId.toString()];
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const saveListTitle = (listId: number) => {
  if (boardStore.updateList && editingListTitle.value.trim()) {
    boardStore.updateList(listId, { name: editingListTitle.value.trim() });
  }
  editingListId.value = null;
  editingListTitle.value = "";
};

const cancelListEdit = (listId: number) => {
  editingListId.value = null;
  editingListTitle.value = "";
};

// Card functions
const startAddingCard = (listId: number) => {
  addingCardToList.value = listId;
  nextTick(() => {
    const input = cardInputRefs.value[listId.toString()];
    if (input) {
      input.focus();
    }
  });
};

const addCard = (listId: number) => {
  if (newCardTitle.value.trim() && boardStore.createCard) {
    boardStore.createCard(listId, newCardTitle.value.trim());
    newCardTitle.value = "";
    nextTick(() => {
      const input = cardInputRefs.value[listId.toString()];
      if (input) {
        input.focus();
      }
    });
  }
};

const cancelAddCard = () => {
  addingCardToList.value = null;
  newCardTitle.value = "";
};

const handleEnter = (event: KeyboardEvent) => {
  if (!event.shiftKey && addingCardToList.value) {
    event.preventDefault();
    addCard(addingCardToList.value);
  }
};

const toggleComplete = (cardId: number) => {
  if (boardStore.toggleCardComplete) {
    boardStore.toggleCardComplete(cardId);
  }
};

const openCardModal = (card: any) => {
  if (boardStore.openCardModal) {
    const kanbanCard = {
      id: card.id.toString(),
      title: card.title,
      isComplete: card.isComplete,
      description: card.description || "",
    };
    boardStore.openCardModal(kanbanCard);
    selectedCardTitle.value = card.title;

    // Store the list ID for the selected card
    const list = boardLists.value.find((l) =>
      getListCards(l.id).some((c) => c.id === card.id)
    );
    selectedCardListId.value = list?.id.toString() || null;
  }
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  if (boardStore.closeCardModal) {
    boardStore.closeCardModal();
  }
  isEditingCardTitle.value = false;
  newComment.value = "";
  selectedCardListId.value = null;
  document.body.style.overflow = "auto";
};

const getCurrentListTitle = () => {
  if (boardStore.getCurrentListTitle) {
    return boardStore.getCurrentListTitle();
  }

  // Fallback logic using selectedCardListId
  if (selectedCardListId.value) {
    const list = boardLists.value.find(
      (l) => l.id.toString() === selectedCardListId.value
    );
    return list?.name || "Unknown List";
  }

  return "Unknown List";
};

const toggleCardComplete = () => {
  if (selectedCard.value && boardStore.toggleCardComplete) {
    const cardId =
      typeof selectedCard.value.id === "string"
        ? parseInt(selectedCard.value.id)
        : selectedCard.value.id;
    boardStore.toggleCardComplete(cardId);
  }
};

const startEditingCardTitle = () => {
  if (selectedCard.value) {
    selectedCardTitle.value = selectedCard.value.title;
    isEditingCardTitle.value = true;
    nextTick(() => {
      cardTitleInput.value?.focus();
      cardTitleInput.value?.select();
    });
  }
};

const saveCardTitle = () => {
  if (
    selectedCard.value &&
    boardStore.updateCard &&
    selectedCardTitle.value.trim()
  ) {
    const cardId =
      typeof selectedCard.value.id === "string"
        ? parseInt(selectedCard.value.id)
        : selectedCard.value.id;
    boardStore.updateCard(cardId, { title: selectedCardTitle.value.trim() });
    selectedCard.value.title = selectedCardTitle.value.trim();
  }
  isEditingCardTitle.value = false;
};

const cancelCardTitleEdit = () => {
  if (selectedCard.value) {
    selectedCardTitle.value = selectedCard.value.title;
  }
  isEditingCardTitle.value = false;
};

// Background click handler
const handleBackgroundClick = () => {
  if (addingCardToList.value) {
    if (newCardTitle.value.trim()) {
      addCard(addingCardToList.value);
    }
    cancelAddCard();
  }

  if (isAddingList.value) {
    if (newListTitle.value.trim()) {
      addList();
    } else {
      cancelAddList();
    }
  }

  if (editingListId.value) {
    saveListTitle(editingListId.value);
  }
};

// Enhanced drag and drop functions
const handleCardDragStart = (event: DragEvent, card: any, listId: number) => {
  event.stopPropagation();
  draggedCard.value = { card, sourceListId: listId };
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "card");
  }
};

const handleCardDragEnd = (event: DragEvent) => {
  if (draggedCard.value && closestListId.value) {
    const { card, sourceListId } = draggedCard.value;
    const targetListId = parseInt(closestListId.value);

    if (sourceListId !== targetListId && boardStore.moveCard) {
      const cardId = typeof card.id === "string" ? parseInt(card.id) : card.id;
      const insertIndex = placeholderIndex.value;
      boardStore.moveCard(cardId, targetListId, insertIndex);
    }
  }

  // Reset drag state
  draggedCard.value = null;
  placeholderListId.value = null;
  placeholderIndex.value = null;
  closestListId.value = null;
};

const handleCardDragOver = (event: DragEvent) => {
  if (!draggedCard.value) return;
  event.preventDefault();
  event.stopPropagation();

  const listElement = event.currentTarget as HTMLElement;
  const listId = listElement.dataset.listId;
  if (!listId) return;

  placeholderListId.value = listId;
  const listCards = getListCards(parseInt(listId));
  let newIndex = listCards.length;

  const mouseY = event.clientY;
  const cardElements =
    listElement.querySelectorAll<HTMLElement>("[data-card-id]");

  for (let i = 0; i < cardElements.length; i++) {
    const rect = cardElements[i].getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;

    if (mouseY < middleY) {
      newIndex = i;
      break;
    }
  }

  placeholderIndex.value = newIndex;
};

const handleCardDrop = (event: DragEvent, targetListId: number) => {
  event.preventDefault();
  event.stopPropagation();

  if (!draggedCard.value) return;

  const { card, sourceListId } = draggedCard.value;

  if (boardStore.moveCard) {
    const cardId = typeof card.id === "string" ? parseInt(card.id) : card.id;
    const insertIndex = placeholderIndex.value;
    boardStore.moveCard(cardId, targetListId, insertIndex);
  }

  // Reset drag state
  draggedCard.value = null;
  placeholderListId.value = null;
  placeholderIndex.value = null;
};

const handleListDragStart = (event: DragEvent, list: List) => {
  if (editingListId.value === list.id) {
    event.preventDefault();
    return;
  }
  draggedList.value = list;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "list");
  }
};

const handleListDragEnd = (event: DragEvent) => {
  if (draggedList.value && closestListId.value) {
    const sourceListId = draggedList.value.id;
    const targetListId = parseInt(closestListId.value);

    if (sourceListId !== targetListId && boardStore.updateList) {
      // Get the target list to swap positions
      const targetList = boardLists.value.find((l) => l.id === targetListId);
      if (targetList) {
        // Swap positions between the lists
        const tempPosition = draggedList.value.position;
        boardStore.updateList(sourceListId, { position: targetList.position });
        boardStore.updateList(targetListId, { position: tempPosition });
      }
    }
  }

  draggedList.value = null;
  closestListId.value = null;
};

const handleListDragOver = (event: DragEvent) => {
  if (!draggedList.value) return;
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
};

const handleListDrop = (event: DragEvent, targetListId: number) => {
  event.preventDefault();
  event.stopPropagation();

  if (!draggedList.value || draggedList.value.id === targetListId) return;

  const sourceListId = draggedList.value.id;

  if (boardStore.updateList) {
    // Get the target list to swap positions
    const targetList = boardLists.value.find((l) => l.id === targetListId);
    if (targetList) {
      // Swap positions
      const tempPosition = draggedList.value.position;
      boardStore.updateList(sourceListId, { position: targetList.position });
      boardStore.updateList(targetListId, { position: tempPosition });
    }
  }

  draggedList.value = null;
};

const handleListMouseDown = (event: MouseEvent) => {
  event.stopPropagation();
};

// SEO and title
useHead({
  title: computed(() =>
    currentBoard.value
      ? `${currentBoard.value.name} | Trello Clone`
      : "Board | Trello Clone"
  ),
});
</script>
