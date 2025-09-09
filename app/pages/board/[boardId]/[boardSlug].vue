<template>
  <div class="h-full">
    <!-- Board Content -->
    <div
      v-if="isAppReady && currentBoard"
      class="h-full"
      :style="{
        backgroundColor: currentBoard.color || '#f3f4f6',
        backgroundImage: currentBoard.backgroundImage
          ? `url(${currentBoard.backgroundImage})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
      @click="handleBackgroundClick"
      @dragover="handleGlobalDragOver"
    >
      <!-- Board Container -->
      <div
        id="lists-container"
        class="flex gap-4 overflow-x-auto h-full p-6 scrollbar-trello"
      >
        <!-- Lists -->
        <BoardList
          v-for="list in boardLists"
          :key="list.id"
          :list="list"
          :board-id="boardId"
          :current-user-id="currentUserId"
          :list-cards="getListCards(list.id)"
          :editing-list-id="editingListId"
          :editing-list-title="editingListTitle"
          :adding-card-to-list="addingCardToList"
          :new-card-title="newCardTitle"
          :dragged-card="draggedCard"
          :dragged-list="draggedList"
          :placeholder-list-id="placeholderListId"
          :placeholder-index="placeholderIndex"
          :closest-list-id="closestListId"
          class="flex-shrink-0"
          style="width: 272px; min-width: 272px"
          @start-editing-title="startEditingListTitle"
          @update-editing-title="editingListTitle = $event"
          @save-title="saveListTitle"
          @cancel-edit="cancelListEdit"
          @delete-list="deleteList"
          @start-adding-card="startAddingCard"
          @update-card-title="newCardTitle = $event"
          @add-card="addCard"
          @cancel-add-card="cancelAddCard"
          @handle-enter="handleEnter"
          @toggle-complete="toggleComplete"
          @open-card="openCardModal"
          @card-drag-start="handleCardDragStart"
          @card-drag-end="handleCardDragEnd"
          @card-drag-over="handleCardDragOver"
          @card-drop="handleCardDrop"
          @list-drag-start="handleListDragStart"
          @list-drag-end="handleListDragEnd"
          @list-drag-over="handleListDragOver"
          @list-drop="handleListDrop"
          @list-mouse-down="handleListMouseDown"
          @set-list-ref="setListRef"
          @set-title-input-ref="setTitleInputRef"
          @set-card-input-ref="setCardInputRef"
          @archive-card="handleArchiveCard"
          @archive-list="handleArchiveList"
          @archive-all-cards="handleArchiveAllCards"
        />

        <!-- Add List Button/Form -->
        <AddListForm
          :is-adding="isAddingList"
          :new-list-title="newListTitle"
          class="flex-shrink-0"
          style="width: 272px; min-width: 272px"
          @start-adding="startAddingList"
          @update-title="newListTitle = $event"
          @add-list="addList"
          @cancel="cancelAddList"
          @handle-enter="handleListEnter"
          @set-list-input-ref="listInput = $event"
        />
      </div>
    </div>

    <!-- Board Not Found -->
    <BoardNotFound v-else-if="!currentBoard && isAppReady" />

    <!-- Loading State -->
    <BoardLoading v-else />

    <!-- Card Modal -->
    <CardModal
      :is-open="isModalOpen"
      :selected-card="selectedCard"
      :selected-card-title="selectedCardTitle"
      :is-editing-title="isEditingCardTitle"
      :board-id="boardId"
      :current-list-id="currentListIdAsNumber"
      :card-activities="cardActivities"
      :new-comment="newComment"
      @close="closeModal"
      @card-moved="handleCardMoved"
      @member-added="handleMemberAdded"
      @member-removed="handleMemberRemoved"
      @toggle-complete="toggleCardComplete"
      @start-editing-title="startEditingCardTitle"
      @update-title="selectedCardTitle = $event"
      @save-title="saveCardTitle"
      @cancel-title-edit="cancelCardTitleEdit"
      @update-comment="newComment = $event"
      @set-title-input-ref="cardTitleInput = $event"
    />

    <ArchivedItems
      :is-open="showArchivePopover"
      :archived-cards="archivedCards"
      :archived-lists="archivedLists"
      :board-id="boardId || 0"
      @close="boardStore.closeArchiveModal()"
      @restore-card="handleRestoreCard"
      @delete-card="handleDeleteCard"
      @restore-list="handleRestoreList"
      @delete-list="handleDeleteList"
    />
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
const filterStore = useFilterStore();

// Set the current board ID in the board store
watchEffect(() => {
  if (boardId.value && boardStore.setBoardId) {
    boardStore.setBoardId(boardId.value);
  }
});

// Get current board and its data
const currentBoard = computed(() => {
  if (!boardId.value || !dataStore.isLoaded) return null;

  // Get the board regardless of status when we're on the board page
  // This prevents the component from breaking during the close transition
  const board = dataStore.getById("boards", boardId.value);

  // Only return null if the board truly doesn't exist
  return board || null;
});
const boardLists = computed(() =>
  dataStore.getListsForBoard(boardId.value || 0)
);

// Enhanced loading state with minimum delay
const isAppReady = ref(false);

onMounted(() => {
  const checkReady = () => {
    if (dataStore.isLoaded) {
      setTimeout(() => {
        isAppReady.value = true;
      }, 300);
    } else {
      setTimeout(checkReady, 50);
    }
  };
  checkReady();
});

// Get current user ID from auth store
const authStore = useAuthStore();
const currentUserId = computed(() => {
  const userId = authStore.user?.id;
  return userId ? parseInt(userId) : 1;
});

// Helper function to check if card was active in given time period
const isCardActiveInPeriod = (cardId: number, daysAgo: number): boolean => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  const activities = dataStore.cardActivities.value.filter(
    (activity) => activity.cardId === cardId
  );

  return activities.some(
    (activity) => new Date(activity.createdAt) > cutoffDate
  );
};

// Filter cards function
const filterCards = (cards: Card[]): Card[] => {
  console.log("🔍 filterCards called with:", {
    cardsCount: cards.length,
    activeFilters: filterStore.activeFilters,
    isFilterActive: filterStore.isFilterActive,
  });

  if (!filterStore.isFilterActive) {
    console.log("➡️ No filters active, returning all cards");
    return cards;
  }

  const filtered = cards.filter((card) => {
    let includeCard = true;

    // Keyword filter
    if (filterStore.activeFilters.keyword.trim()) {
      const keyword = filterStore.activeFilters.keyword.toLowerCase();
      const matchesTitle = card.title.toLowerCase().includes(keyword);
      const matchesDescription =
        card.description?.toLowerCase().includes(keyword) || false;

      if (!matchesTitle && !matchesDescription) {
        includeCard = false;
      }
    }

    // Member filters
    if (includeCard && filterStore.activeFilters.noMembers) {
      if (card.assignedMembers && card.assignedMembers.length > 0) {
        includeCard = false;
      }
    }

    if (includeCard && filterStore.activeFilters.assignedToMe) {
      if (!card.assignedMembers?.includes(currentUserId.value)) {
        includeCard = false;
      }
    }

    if (includeCard && filterStore.activeFilters.members.length > 0) {
      const hasSelectedMember = card.assignedMembers?.some((memberId) =>
        filterStore.activeFilters.members.includes(memberId)
      );
      if (!hasSelectedMember) {
        includeCard = false;
      }
    }

    // Card Status filter
    if (includeCard && filterStore.activeFilters.cardStatus !== "") {
      if (
        filterStore.activeFilters.cardStatus === "completed" &&
        !card.isComplete
      ) {
        includeCard = false;
      }
      if (
        filterStore.activeFilters.cardStatus === "incomplete" &&
        card.isComplete
      ) {
        includeCard = false;
      }
    }

    // Activity filter
    if (includeCard && filterStore.activeFilters.activity !== "") {
      switch (filterStore.activeFilters.activity) {
        case "lastWeek":
          if (!isCardActiveInPeriod(card.id, 7)) {
            includeCard = false;
          }
          break;
        case "twoWeeks":
          if (!isCardActiveInPeriod(card.id, 14)) {
            includeCard = false;
          }
          break;
        case "fourWeeks":
          if (!isCardActiveInPeriod(card.id, 28)) {
            includeCard = false;
          }
          break;
        case "noActivity":
          if (isCardActiveInPeriod(card.id, 28)) {
            includeCard = false;
          }
          break;
      }
    }

    return includeCard;
  });

  console.log("🎯 Filtered result:", {
    originalCount: cards.length,
    filteredCount: filtered.length,
  });

  return filtered;
};

// Get cards for a specific list with filtering applied
const getListCards = (listId: number) => {
  const allCards = dataStore.getCardsForList(listId);
  return filterCards(allCards);
};

// All the state that was previously spread across components
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

const isModalOpen = computed(() => boardStore.isModalOpen);
const selectedCard = computed(() => boardStore.selectedCard);
const selectedCardTitle = ref("");
const isEditingCardTitle = ref(false);
const cardTitleInput = ref<HTMLInputElement>();
const newComment = ref("");
const selectedCardListId = ref<string | null>(null);

// Archive modal state
const showArchivePopover = computed(() => {
  console.log("🏛️ Archive modal computed:", boardStore.showArchiveModal);
  return boardStore.showArchiveModal;
});

const archivedCards = computed(() => {
  if (!boardId.value || !dataStore.isLoaded) return [];

  const cards = boardStore.getArchivedCards(boardId.value);
  console.log("🗃️ Archived cards:", cards.length, cards);
  return cards;
});

const archivedLists = computed(() => {
  if (!boardId.value || !dataStore.isLoaded) return [];

  const lists = boardStore.getArchivedLists(boardId.value);
  console.log("🗃️ Archived lists:", lists.length, lists);
  return lists;
});

const handleRestoreList = (listId: number) => {
  if (boardStore.restoreList) {
    boardStore.restoreList(listId, false); // Don't auto-restore cards
    console.log(`List ${listId} restored!`);
  }
};

const handleDeleteList = (listId: number) => {
  console.log("Delete list clicked:", listId);

  const list = dataStore.getById("lists", listId);
  console.log("Found list:", list);

  // First, permanently delete all archived cards in this list
  const archivedCardsInList = archivedCards.value.filter(
    (card) => card.listId === listId
  );
  console.log("Archived cards in list:", archivedCardsInList.length);

  archivedCardsInList.forEach((card) => {
    const cardIndex = dataStore.cards.findIndex((c) => c.id === card.id);
    if (cardIndex !== -1) {
      dataStore.cards.splice(cardIndex, 1);
    }
  });

  // Then permanently remove the list
  if (dataStore.lists) {
    const listIndex = dataStore.lists.findIndex((l) => l.id === listId);
    console.log("List index:", listIndex);

    if (listIndex !== -1) {
      dataStore.lists.splice(listIndex, 1);
      console.log(`List "${list?.name}" permanently deleted!`);
    }
  }
};

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

const currentListIdAsNumber = computed(() => {
  return selectedCardListId.value
    ? parseInt(selectedCardListId.value)
    : undefined;
});

const handleRestoreCard = (cardId: number) => {
  if (boardStore.restoreCard) {
    boardStore.restoreCard(cardId);
  }
};
const handleDeleteCard = (cardId: number) => {
  console.log("Delete card clicked:", cardId);
  console.log("dataStore.data.value:", dataStore.data.value);
  console.log("dataStore.cards:", dataStore.cards);

  const card = dataStore.getById("cards", cardId);
  console.log("Found card:", card);

  // Try accessing the cards array directly
  if (dataStore.cards) {
    console.log("Cards array length before:", dataStore.cards.length);
    const cardIndex = dataStore.cards.findIndex((c) => c.id === cardId);
    console.log("Card index:", cardIndex);

    if (cardIndex !== -1) {
      // Try to remove from the array
      dataStore.cards.splice(cardIndex, 1);
      console.log("Cards array length after:", dataStore.cards.length);
    }
  }
};

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

const handleCardMoved = (payload: {
  cardId: number;
  listId: number;
  position: number;
}) => {
  console.log("Card moved:", payload);
};

const handleMemberAdded = (payload: any) => {
  console.log("Member added:", payload);
};

const handleMemberRemoved = (payload: any) => {
  console.log("Member removed:", payload);
};

const handleArchiveCard = (cardId: number) => {
  if (boardStore.archiveCard) {
    boardStore.archiveCard(cardId);
    console.log(`Card ${cardId} archived!`);
  }
};

const handleArchiveList = (listId: number) => {
  if (boardStore.archiveList) {
    boardStore.archiveList(listId, false); // Don't auto-archive cards
    console.log(`List ${listId} archived!`);
  }
};

const handleArchiveAllCards = (listId: number) => {
  // Archive all cards in the list
  const cardsInList = dataStore.getCardsForList(listId);
  cardsInList.forEach((card) => {
    if (boardStore.archiveCard) {
      boardStore.archiveCard(card.id);
    }
  });
  console.log(`All cards in list ${listId} archived!`);
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

<style scoped>
/* Improve scroll behavior - enable wheel scrolling */
.scrollbar-trello {
  scroll-behavior: smooth;
}

/* Trello-style scrollbar */
.scrollbar-trello::-webkit-scrollbar {
  height: 12px;
}

.scrollbar-trello::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.scrollbar-trello::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
}

.scrollbar-trello::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
