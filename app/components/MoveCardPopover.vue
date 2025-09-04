<template>
  <UPopover :popper="{ placement: 'bottom-start' }">
    <UButton
      variant="ghost"
      size="xs"
      class="text-sm font-medium text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
    >
      {{ getCurrentListTitle() }}
      <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 ml-1" />
    </UButton>

    <template #content>
      <div class="p-4 w-96 bg-white">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-900">Move card</h3>
          <UButton
            variant="ghost"
            size="xs"
            icon="i-heroicons-x-mark"
            class="text-gray-400 hover:text-gray-600"
          />
        </div>

        <!-- Select destination - Board on first row, List and Position on second row -->
        <div class="space-y-4 mb-4">
          <!-- Board Selection - Full width on first row -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Board</label
            >
            <USelect
              v-model="selectedBoard"
              :items="boardOptions"
              placeholder="Select board"
              size="sm"
              class="w-full"
              :disabled="isLoading"
            />
          </div>

          <!-- List and Position Selection - Side by side on second row -->
          <div class="grid grid-cols-2 gap-4">
            <!-- List Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >List</label
              >
              <USelect
                v-model="selectedList"
                :items="listOptions"
                placeholder="Select list"
                size="sm"
                class="w-full"
                :disabled="!selectedBoard || isLoading"
              />
            </div>

            <!-- Position Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Position</label
              >
              <USelect
                v-model="selectedPosition"
                :items="positionOptions"
                placeholder="Select position"
                size="sm"
                class="w-full"
                :disabled="!selectedList || isLoading"
              />
            </div>
          </div>
        </div>

        <!-- Move Button -->
        <div class="mt-4">
          <UButton
            @click="moveCard"
            :disabled="!canMove || isLoading"
            :loading="isLoading"
            color="primary"
            size="sm"
            class="w-full"
          >
            Move
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
interface Props {
  cardId?: number | string;
  currentListId?: number;
  currentBoardId?: number;
}

interface Emits {
  (
    e: "moved",
    payload: { cardId: number; listId: number; position: number }
  ): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Get stores
const dataStore = useDataStore();
const authStore = useAuthStore();
const boardStore = useBoardStore();

// Reactive state
const selectedBoard = ref<number | null>(props.currentBoardId || null);
const selectedList = ref<number | null>(props.currentListId || null);
const selectedPosition = ref<number>(1);
const isLoading = ref(false);

// Get user boards that they can edit
const boardOptions = computed(() => {
  if (!authStore.user) return [];

  const userId = parseInt(authStore.user.id);
  const userBoards = dataStore.getBoardsForUser(userId);

  return userBoards
    .filter((board) => dataStore.canUserEditBoard(userId, board.id))
    .map((board) => ({
      label: board.name,
      value: board.id,
    }));
});

// Get lists for selected board
const listOptions = computed(() => {
  if (!selectedBoard.value) return [];

  const lists = dataStore.getListsForBoard(selectedBoard.value);
  return lists.map((list) => ({
    label: list.name,
    value: list.id,
  }));
});

// Get position options for selected list
const positionOptions = computed(() => {
  if (!selectedList.value) return [];

  const cards = dataStore.getCardsForList(selectedList.value);

  // If moving within the same list, exclude the current card from count
  let adjustedCards = cards;
  if (selectedList.value === props.currentListId && props.cardId) {
    const cardId =
      typeof props.cardId === "string" ? parseInt(props.cardId) : props.cardId;
    adjustedCards = cards.filter((card) => card.id !== cardId);
  }

  const maxPosition = adjustedCards.length + 1;

  const options = [];
  for (let i = 1; i <= maxPosition; i++) {
    options.push({
      label: i.toString(),
      value: i,
    });
  }

  return options;
});

// Check if move is possible
const canMove = computed(() => {
  return (
    selectedBoard.value &&
    selectedList.value &&
    selectedPosition.value &&
    (selectedBoard.value !== props.currentBoardId ||
      selectedList.value !== props.currentListId ||
      selectedPosition.value !== getCurrentCardPosition())
  );
});

// Get current list title
const getCurrentListTitle = () => {
  if (boardStore.getCurrentListTitle) {
    return boardStore.getCurrentListTitle();
  }

  if (props.currentListId) {
    const list = dataStore.getById("lists", props.currentListId);
    return list?.name || "Unknown List";
  }

  return "Unknown List";
};

// Get current card position
const getCurrentCardPosition = () => {
  if (!props.cardId || !props.currentListId) return 1;

  const cardId =
    typeof props.cardId === "string" ? parseInt(props.cardId) : props.cardId;
  const card = dataStore.getById("cards", cardId);
  return card?.position || 1;
};

// Watch board selection to update list
watch(selectedBoard, (newBoardId) => {
  selectedList.value = null;
  selectedPosition.value = 1;

  // If it's the same board as current, pre-select current list
  if (newBoardId === props.currentBoardId && props.currentListId) {
    selectedList.value = props.currentListId;
  }
});

// Watch list selection to update position
watch(selectedList, (newListId) => {
  selectedPosition.value = 1;

  // If it's the same list as current, try to maintain current position
  if (newListId === props.currentListId && props.cardId) {
    selectedPosition.value = getCurrentCardPosition();
  }
});

// Initialize with current values
onMounted(() => {
  selectedBoard.value = props.currentBoardId || null;
  selectedList.value = props.currentListId || null;
  selectedPosition.value = getCurrentCardPosition();
});

const moveCard = async () => {
  if (!canMove.value || !props.cardId) return;

  isLoading.value = true;

  try {
    const cardId =
      typeof props.cardId === "string" ? parseInt(props.cardId) : props.cardId;

    // Use boardStore.moveCard if available
    if (boardStore.moveCard) {
      boardStore.moveCard(cardId, selectedList.value!, selectedPosition.value);
    }

    // Emit the move event
    emit("moved", {
      cardId,
      listId: selectedList.value!,
      position: selectedPosition.value,
    });

    // Close the modal after successful move
    if (boardStore.closeCardModal) {
      boardStore.closeCardModal();
    }
  } catch (error) {
    console.error("Error moving card:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
