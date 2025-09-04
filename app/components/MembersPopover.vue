<template>
  <UPopover :popper="{ placement: 'bottom-start' }">
    <UButton
      variant="ghost"
      size="sm"
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
    >
      <UIcon name="i-heroicons-user-group" class="w-4 h-4" />
      Members
    </UButton>

    <template #content>
      <div class="p-4 w-96 bg-white">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-900">Members</h3>
          <UButton
            variant="ghost"
            size="xs"
            icon="i-heroicons-x-mark"
            class="text-gray-400 hover:text-gray-600"
          />
        </div>

        <!-- Search Input -->
        <div class="mb-4">
          <UInput
            v-model="searchQuery"
            placeholder="Search members"
            icon="i-heroicons-magnifying-glass"
            size="sm"
            class="w-full"
          />
        </div>

        <!-- Card Members Section -->
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Card members</h4>

          <div class="space-y-2 max-h-32 overflow-y-auto mb-4">
            <div
              v-for="member in assignedMembers"
              :key="member.user?.id"
              class="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <!-- User Avatar/Initials -->
                <div
                  class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                >
                  {{ getUserInitials(member.user) }}
                </div>

                <!-- User Info -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900">
                    {{ getUserFullName(member.user) }}
                  </div>
                </div>
              </div>

              <!-- Remove Button -->
              <UButton
                variant="ghost"
                size="xs"
                icon="i-heroicons-x-mark"
                class="text-gray-400 hover:text-red-600"
                @click="removeMemberFromCard(member.user?.id)"
              />
            </div>
          </div>

          <!-- No assigned members -->
          <div
            v-if="assignedMembers.length === 0"
            class="text-center py-2 text-gray-500 text-sm"
          >
            No members assigned
          </div>
        </div>

        <!-- Board Members Section -->
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Board members</h4>

          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="member in filteredAvailableMembers"
              :key="member.user?.id"
              class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
              @click="addMemberToCard(member.user?.id)"
            >
              <!-- User Avatar/Initials -->
              <div
                class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
              >
                {{ getUserInitials(member.user) }}
              </div>

              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900">
                  {{ getUserFullName(member.user) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ member.role }}
                </div>
              </div>

              <!-- Add Icon -->
              <UIcon name="i-heroicons-plus" class="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <!-- No available members -->
          <div
            v-if="filteredAvailableMembers.length === 0 && searchQuery"
            class="text-center py-4 text-gray-500 text-sm"
          >
            No members found
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
interface Props {
  boardId?: number;
  cardId?: number | string;
}

interface Emits {
  (e: "memberAdded", payload: { cardId: number; userId: number }): void;
  (e: "memberRemoved", payload: { cardId: number; userId: number }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Get stores
const dataStore = useDataStore();
const authStore = useAuthStore();

// Reactive state
const searchQuery = ref("");

// Get current card
const currentCard = computed(() => {
  if (!props.cardId) return null;
  const cardId =
    typeof props.cardId === "string" ? parseInt(props.cardId) : props.cardId;
  return dataStore.getById("cards", cardId);
});

// Get board members
const boardMembers = computed(() => {
  if (!props.boardId) return [];
  return dataStore.getBoardMembers(props.boardId);
});

// Get assigned members (users currently assigned to the card)
const assignedMembers = computed(() => {
  if (!currentCard.value?.assignedMembers) return [];

  return currentCard.value.assignedMembers
    .map((userId) => {
      const boardMember = boardMembers.value.find(
        (member) => member.userId === userId
      );
      return boardMember;
    })
    .filter(Boolean);
});

// Get available members (board members not assigned to card, filtered by search)
const filteredAvailableMembers = computed(() => {
  const assignedUserIds = currentCard.value?.assignedMembers || [];

  // Filter out already assigned members
  let availableMembers = boardMembers.value.filter(
    (member) => !assignedUserIds.includes(member.userId)
  );

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    availableMembers = availableMembers.filter((member) => {
      if (!member.user) return false;
      const fullName = getUserFullName(member.user).toLowerCase();
      return fullName.includes(query);
    });
  }

  return availableMembers;
});

// Helper functions
const getUserFullName = (user: any) => {
  if (!user) return "Unknown User";
  return `${user.firstName} ${user.lastName}`;
};

const getUserInitials = (user: any) => {
  if (!user) return "U";
  return `${user.firstName[0]}${user.lastName[0]}`;
};

// Member management functions
const addMemberToCard = (userId: number | undefined) => {
  if (!userId || !props.cardId) return;

  const cardId =
    typeof props.cardId === "string" ? parseInt(props.cardId) : props.cardId;

  // Update the card's assignedMembers array
  if (currentCard.value) {
    const currentMembers = currentCard.value.assignedMembers || [];
    if (!currentMembers.includes(userId)) {
      const updatedMembers = [...currentMembers, userId];

      // Update through data store
      dataStore.update("cards", cardId, {
        assignedMembers: updatedMembers,
      });

      // Emit event
      emit("memberAdded", { cardId, userId });
    }
  }
};

const removeMemberFromCard = (userId: number | undefined) => {
  if (!userId || !props.cardId) return;

  const cardId =
    typeof props.cardId === "string" ? parseInt(props.cardId) : props.cardId;

  // Update the card's assignedMembers array
  if (currentCard.value) {
    const currentMembers = currentCard.value.assignedMembers || [];
    const updatedMembers = currentMembers.filter((id) => id !== userId);

    // Update through data store
    dataStore.update("cards", cardId, {
      assignedMembers: updatedMembers,
    });

    // Emit event
    emit("memberRemoved", { cardId, userId });
  }
};
</script>
