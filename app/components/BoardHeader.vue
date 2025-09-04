<template>
  <div
    class="bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-3 relative"
  >
    <div class="flex items-center justify-between">
      <!-- Left side - Board Name -->
      <div class="flex items-center space-x-3">
        <!-- Editable Board Name -->
        <div class="flex items-center">
          <input
            v-if="isEditingBoardName"
            v-model="editingBoardName"
            @blur="saveBoardName"
            @keydown.enter="saveBoardName"
            @keydown.escape="cancelBoardNameEdit"
            ref="boardNameInput"
            class="bg-white/90 text-gray-900 font-bold text-lg px-3 py-1 rounded border-2 border-blue-500 focus:outline-none min-w-[200px]"
            maxlength="100"
          />
          <button
            v-else
            @click="startEditingBoardName"
            class="text-white font-bold text-lg hover:bg-white/20 px-3 py-1 rounded transition-colors"
          >
            {{ board?.name || "Board Name" }}
          </button>
        </div>
      </div>

      <!-- Right side - Controls -->
      <div class="flex items-center space-x-2 relative">
        <!-- Board Members Avatars -->
        <div class="flex -space-x-2" v-if="boardMembers.length > 0">
          <UAvatar
            v-for="member in boardMembers.slice(0, 4)"
            :key="member.id"
            :alt="member.user.firstName + ' ' + member.user.lastName"
            size="sm"
            class="ring-2 ring-white/30"
            :ui="{
              background: 'bg-gradient-to-r from-blue-500 to-purple-500',
            }"
          >
            {{ getUserInitials(member.user) }}
          </UAvatar>

          <!-- Show +N more if there are more members -->
          <div
            v-if="boardMembers.length > 4"
            class="w-8 h-8 rounded-full bg-gray-600 border-2 border-white/30 flex items-center justify-center text-xs text-white font-medium"
          >
            +{{ boardMembers.length - 4 }}
          </div>
        </div>

        <!-- Board Visibility -->
        <UButton
          variant="ghost"
          size="sm"
          class="text-white hover:bg-white/20 border border-white/30"
          @click="toggleVisibilityMenu"
        >
          <UIcon
            :name="
              board?.isPublic
                ? 'i-heroicons-globe-alt'
                : 'i-heroicons-lock-closed'
            "
            class="w-4 h-4 mr-2"
          />
          {{ board?.isPublic ? "Public" : "Private" }}
        </UButton>

        <!-- Filter Button -->
        <div class="relative">
          <UButton
            variant="ghost"
            size="sm"
            class="text-white hover:bg-white/20"
            :class="{ 'bg-white/20': showFilterPopover || hasActiveFilters }"
            @click="toggleFilter"
          >
            <UIcon name="i-heroicons-funnel" class="w-4 h-4 mr-2" />
            Filter
            <!-- Filter indicator badge -->
            <div
              v-if="hasActiveFilters && !showFilterPopover"
              class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            ></div>
          </UButton>

          <!-- Filter Popover with higher z-index -->
          <BoardFilterPopover
            :is-visible="showFilterPopover"
            :board-members="boardMembers"
            :current-user-id="currentUserId"
            @close="showFilterPopover = false"
            @filter-change="handleFilterChange"
          />
        </div>

        <!-- Board Menu -->
        <BoardMenuPopover
          @show-archive="$emit('show-archive')"
          @export-board="$emit('export-board')"
          @close-board="$emit('close-board')"
          @go-to-boards="$emit('go-to-boards')"
        />
      </div>
    </div>

    <!-- Visibility Dropdown Menu -->
    <div
      v-if="showVisibilityMenu"
      ref="visibilityMenuRef"
      class="absolute top-16 left-4 bg-white rounded-lg shadow-lg border p-3 z-50 min-w-[280px]"
      @click.stop
    >
      <h3 class="font-semibold text-gray-900 mb-3">Change visibility</h3>

      <div class="space-y-2">
        <button
          @click="setBoardVisibility(false)"
          class="w-full text-left p-3 rounded hover:bg-gray-100 transition-colors"
          :class="{ 'bg-blue-50 border border-blue-200': !board?.isPublic }"
        >
          <div class="flex items-start space-x-3">
            <UIcon
              name="i-heroicons-lock-closed"
              class="w-5 h-5 text-gray-600 mt-0.5"
            />
            <div>
              <div class="font-medium text-gray-900">Private</div>
              <div class="text-sm text-gray-600">
                Only board members can see and edit this board
              </div>
            </div>
          </div>
        </button>

        <button
          @click="setBoardVisibility(true)"
          class="w-full text-left p-3 rounded hover:bg-gray-100 transition-colors"
          :class="{ 'bg-blue-50 border border-blue-200': board?.isPublic }"
        >
          <div class="flex items-start space-x-3">
            <UIcon
              name="i-heroicons-globe-alt"
              class="w-5 h-5 text-gray-600 mt-0.5"
            />
            <div>
              <div class="font-medium text-gray-900">Public</div>
              <div class="text-sm text-gray-600">
                Anyone can see this board. Only board members can edit.
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Board, BoardMember } from "~/types";

// Props
interface Props {
  board: Board | null;
  boardMembers?: BoardMember[];
  currentUserId?: number;
  isFilterActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  boardMembers: () => [],
  currentUserId: 1,
  isFilterActive: false,
});

// Emits
const emit = defineEmits<{
  "update-board-name": [name: string];
  "update-board-visibility": [isPublic: boolean];
  "invite-members": [];
  "toggle-filter": [];
  "filter-change": [filters: any];
  "export-board": [];
  "close-board": [];
  "delete-board": [];
  "show-archive": [];
  "go-to-boards": [];
}>();

// Composables
const toast = useToast();

// State
const isEditingBoardName = ref(false);
const editingBoardName = ref("");
const boardNameInput = ref<HTMLInputElement>();
const showVisibilityMenu = ref(false);
const visibilityMenuRef = ref<HTMLElement>();
const showFilterPopover = ref(false);
const activeFilters = ref<any>({
  keyword: "",
  noMembers: false,
  assignedToMe: false,
  members: [],
  completed: false,
  incomplete: false,
  activeLastWeek: false,
  activeTwoWeeks: false,
  activeFourWeeks: false,
  noActivity: false,
});

// Computed
const hasActiveFilters = computed(() => {
  return (
    activeFilters.value.keyword.trim() !== "" ||
    activeFilters.value.noMembers ||
    activeFilters.value.assignedToMe ||
    activeFilters.value.members.length > 0 ||
    activeFilters.value.completed ||
    activeFilters.value.incomplete ||
    activeFilters.value.activeLastWeek ||
    activeFilters.value.activeTwoWeeks ||
    activeFilters.value.activeFourWeeks ||
    activeFilters.value.noActivity
  );
});

// Board menu items
const boardMenuItems = computed(() => [
  [
    {
      label: "About this board",
      icon: "i-heroicons-information-circle",
      onSelect: () => console.log("About board"),
    },
    {
      label: "Activity",
      icon: "i-heroicons-clock",
      onSelect: () => console.log("Board activity"),
    },
  ],
  [
    {
      label: "Settings",
      icon: "i-heroicons-cog-6-tooth",
      onSelect: () => console.log("Board settings"),
    },
    {
      label: "Labels",
      icon: "i-heroicons-tag",
      onSelect: () => console.log("Manage labels"),
    },
    {
      label: "Custom fields",
      icon: "i-heroicons-adjustments-horizontal",
      onSelect: () => console.log("Custom fields"),
    },
  ],
  [
    {
      label: "Print, export, and share",
      icon: "i-heroicons-share",
      onSelect: () => emit("export-board"),
    },
    {
      label: "Copy board",
      icon: "i-heroicons-document-duplicate",
      onSelect: () => console.log("Copy board"),
    },
  ],
  [
    {
      label: "Archived items",
      icon: "i-heroicons-archive-box",
      onSelect: () => emit("show-archive"),
    },
  ],
  [
    {
      label: "Close board",
      icon: "i-heroicons-archive-box",
      color: "warning",
      onSelect: () => emit("close-board"),
    },
  ],
]);

// Methods
const getUserInitials = (user: any) => {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};

const startEditingBoardName = () => {
  if (!props.board) return;

  editingBoardName.value = props.board.name;
  isEditingBoardName.value = true;

  nextTick(() => {
    boardNameInput.value?.focus();
    boardNameInput.value?.select();
  });
};

const saveBoardName = () => {
  if (!editingBoardName.value.trim()) {
    cancelBoardNameEdit();
    return;
  }

  emit("update-board-name", editingBoardName.value.trim());
  isEditingBoardName.value = false;

  toast.add({
    title: "Board name updated",
    color: "success",
    icon: "i-heroicons-check-circle",
  });
};

const cancelBoardNameEdit = () => {
  isEditingBoardName.value = false;
  editingBoardName.value = "";
};

const toggleVisibilityMenu = () => {
  showVisibilityMenu.value = !showVisibilityMenu.value;
  // Close filter if open
  if (showVisibilityMenu.value) {
    showFilterPopover.value = false;
  }
};

const setBoardVisibility = (isPublic: boolean) => {
  emit("update-board-visibility", isPublic);
  showVisibilityMenu.value = false;

  toast.add({
    title: `Board is now ${isPublic ? "public" : "private"}`,
    color: "success",
    icon: isPublic ? "i-heroicons-globe-alt" : "i-heroicons-lock-closed",
  });
};

const handleInviteMembers = () => {
  emit("invite-members");
};

const toggleFilter = () => {
  showFilterPopover.value = !showFilterPopover.value;
  // Close visibility menu if open
  if (showFilterPopover.value) {
    showVisibilityMenu.value = false;
  }
  emit("toggle-filter");
};

const handleFilterChange = (filters: any) => {
  activeFilters.value = filters;
  emit("filter-change", filters);
};

// Manual click outside implementation for visibility menu
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    if (
      showVisibilityMenu.value &&
      visibilityMenuRef.value &&
      !visibilityMenuRef.value.contains(event.target as Node)
    ) {
      showVisibilityMenu.value = false;
    }
  };

  document.addEventListener("click", handleClickOutside);

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
});
</script>
