<template>
  <Teleport to="body">
    <div v-if="isVisible">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/20"
        style="z-index: 99998; position: fixed"
        @click="closeFilter"
      ></div>

      <!-- Filter Popover -->
      <div
        ref="filterRef"
        class="fixed top-28 right-4 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-600 p-4 w-80 max-h-[80vh] overflow-y-auto"
        style="z-index: 99999; position: fixed"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-white">Filter</h3>
          <UButton
            variant="ghost"
            size="xs"
            @click="closeFilter"
            class="text-gray-400 hover:text-white"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </UButton>
        </div>

        <!-- Keyword Section -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Keyword
          </label>
          <input
            v-model="filters.keyword"
            type="text"
            placeholder="Enter a keyword..."
            class="w-full p-2 text-sm bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-400 mt-1">
            Search cards, members, and more.
          </p>
        </div>

        <!-- Members Section - CHECKBOXES (Multiple selection) -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-3">
            Members
          </label>
          <div class="space-y-2">
            <!-- No members option -->
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.noMembers"
                type="checkbox"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <div class="ml-3 flex items-center">
                <UIcon
                  name="i-heroicons-user"
                  class="w-4 h-4 text-gray-400 mr-2"
                />
                <span class="text-sm text-gray-300">No members</span>
              </div>
            </label>

            <!-- Cards assigned to me -->
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.assignedToMe"
                type="checkbox"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <div class="ml-3 flex items-center">
                <div
                  class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2"
                >
                  {{ currentUserInitials }}
                </div>
                <span class="text-sm text-gray-300">Cards assigned to me</span>
              </div>
            </label>

            <!-- Board Members -->
            <label
              v-for="member in otherBoardMembers"
              :key="member.id"
              class="flex items-center cursor-pointer"
            >
              <input
                v-model="filters.members"
                :value="member.userId"
                type="checkbox"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <div class="ml-3 flex items-center">
                <div
                  class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-medium mr-2"
                >
                  {{ getUserInitials(member.user) }}
                </div>
                <span class="text-sm text-gray-300">
                  {{ member.user.firstName }} {{ member.user.lastName }}
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- Card Status Section - RADIO BUTTONS (Single selection) -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-3">
            Card status
          </label>
          <div class="space-y-2">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.cardStatus"
                value=""
                type="radio"
                name="cardStatus"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span class="ml-3 text-sm text-gray-300">All cards</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.cardStatus"
                value="completed"
                type="radio"
                name="cardStatus"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span class="ml-3 text-sm text-gray-300">Marked as complete</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.cardStatus"
                value="incomplete"
                type="radio"
                name="cardStatus"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span class="ml-3 text-sm text-gray-300"
                >Not marked as complete</span
              >
            </label>
          </div>
        </div>

        <!-- Activity Section - RADIO BUTTONS (Single selection) -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-3">
            Activity
          </label>
          <div class="space-y-2">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.activity"
                value=""
                type="radio"
                name="activity"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span class="ml-3 text-sm text-gray-300">All activity</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.activity"
                value="lastWeek"
                type="radio"
                name="activity"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span class="ml-3 text-sm text-gray-300"
                >Active in the last week</span
              >
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.activity"
                value="twoWeeks"
                type="radio"
                name="activity"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span class="ml-3 text-sm text-gray-300"
                >Active in the last two weeks</span
              >
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.activity"
                value="fourWeeks"
                type="radio"
                name="activity"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span class="ml-3 text-sm text-gray-300"
                >Active in the last four weeks</span
              >
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                v-model="filters.activity"
                value="noActivity"
                type="radio"
                name="activity"
                class="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span class="ml-3 text-gray-300"
                >Without activity in the last four weeks</span
              >
            </label>
          </div>
        </div>

        <!-- Clear Filters Button -->
        <div class="pt-4 border-t border-gray-600">
          <button
            @click="clearFilters"
            :disabled="!hasActiveFilters"
            class="w-full py-2 px-3 text-sm font-medium rounded transition-colors"
            :class="
              hasActiveFilters
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-500 cursor-not-allowed'
            "
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { BoardMember } from "~/types";

// Props
interface Props {
  isVisible: boolean;
  boardMembers: BoardMember[];
  currentUserId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  currentUserId: 1,
});

// Emits
const emit = defineEmits<{
  close: [];
  "filter-change": [filters: FilterState];
}>();

// Updated filter state interface
interface FilterState {
  keyword: string;
  noMembers: boolean;
  assignedToMe: boolean;
  members: number[];
  cardStatus: "" | "completed" | "incomplete"; // Radio button value
  activity: "" | "lastWeek" | "twoWeeks" | "fourWeeks" | "noActivity"; // Radio button value
}

// Refs
const filterRef = ref<HTMLElement>();

// Updated filter state with radio button values
const filters = ref<FilterState>({
  keyword: "",
  noMembers: false,
  assignedToMe: false,
  members: [],
  cardStatus: "", // Empty string means "All cards"
  activity: "", // Empty string means "All activity"
});

// Computed
const currentUserInitials = computed(() => {
  const currentUser = props.boardMembers.find(
    (m) => m.userId === props.currentUserId
  );
  if (currentUser) {
    return getUserInitials(currentUser.user);
  }
  return "ME";
});

// Filter out current user from board members to avoid duplication
const otherBoardMembers = computed(() => {
  // Convert currentUserId to number for proper comparison since boardMember.userId is a number
  const currentUserIdNum =
    typeof props.currentUserId === "string"
      ? parseInt(props.currentUserId)
      : props.currentUserId;

  return props.boardMembers.filter(
    (member) => member.userId !== currentUserIdNum
  );
});

const hasActiveFilters = computed(() => {
  return (
    filters.value.keyword.trim() !== "" ||
    filters.value.noMembers ||
    filters.value.assignedToMe ||
    filters.value.members.length > 0 ||
    filters.value.cardStatus !== "" ||
    filters.value.activity !== ""
  );
});

// Methods
const getUserInitials = (user: any) => {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};

const closeFilter = () => {
  emit("close");
};

const clearFilters = () => {
  filters.value = {
    keyword: "",
    noMembers: false,
    assignedToMe: false,
    members: [],
    cardStatus: "",
    activity: "",
  };

  emit("filter-change", filters.value);
};

// Watch for filter changes and emit them
watch(
  filters,
  (newFilters) => {
    emit("filter-change", newFilters);
  },
  { deep: true }
);

// Prevent body scroll when popover is open
watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = "auto";
});
</script>
