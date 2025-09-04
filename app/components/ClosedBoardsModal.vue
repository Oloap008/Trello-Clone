<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200"
      >
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-archive-box" class="w-5 h-5 text-gray-600" />
          <h2 class="text-lg font-semibold text-gray-900">Closed boards</h2>
        </div>
        <button
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          @click="$emit('close')"
        >
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Workspace Filter -->
      <div class="p-4 border-b border-gray-200">
        <div class="relative">
          <select
            v-model="selectedWorkspace"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
          >
            <option value="all">All boards</option>
            <option value="personal">Personal</option>
            <option
              v-for="workspace in workspaces"
              :key="workspace.id"
              :value="workspace.id"
            >
              {{ workspace.name }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-4 h-4 text-gray-400"
            />
          </div>
        </div>
      </div>

      <!-- Closed Boards List -->
      <div class="max-h-96 overflow-y-auto">
        <div v-if="filteredClosedBoards.length === 0" class="p-8 text-center">
          <UIcon
            name="i-heroicons-archive-box"
            class="w-12 h-12 text-gray-300 mx-auto mb-4"
          />
          <p class="text-gray-500 text-sm">No closed boards found</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="board in filteredClosedBoards"
            :key="board.id"
            class="p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <!-- Board Info -->
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <!-- Board Thumbnail -->
                <div
                  class="w-10 h-8 rounded flex-shrink-0 flex items-center justify-center"
                  :style="{
                    backgroundColor: board.color || '#6b7280',
                    backgroundImage: board.backgroundImage
                      ? `url(${board.backgroundImage})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }"
                >
                  <span
                    v-if="!board.backgroundImage"
                    class="text-white text-xs font-medium"
                  >
                    {{ board.name.charAt(0).toUpperCase() }}
                  </span>
                </div>

                <!-- Board Details -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-medium text-gray-900 truncate">
                    {{ board.name }}
                  </h3>
                  <p class="text-xs text-gray-500">
                    {{ getWorkspaceName(board.workspaceId) }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-2 flex-shrink-0">
                <ReopenBoardPopover
                  :board-id="board.id"
                  :board-name="board.name"
                  :workspaces="workspaces"
                  :current-workspace-id="board.workspaceId"
                  @reopen="
                    (boardId, workspaceId) =>
                      $emit('reopen', boardId, workspaceId)
                  "
                  @delete="(boardId) => $emit('delete', boardId)"
                />

                <DeleteBoardPopover
                  :board-id="board.id"
                  :board-name="board.name"
                  @delete="(boardId) => $emit('delete', boardId)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ClosedBoard {
  id: number;
  name: string;
  color?: string;
  backgroundImage?: string;
  workspaceId?: number;
  closedAt?: string;
}

interface Workspace {
  id: number;
  name: string;
}

interface Props {
  isVisible: boolean;
  closedBoards: ClosedBoard[];
  workspaces: Workspace[];
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  closedBoards: () => [],
  workspaces: () => [],
});

const emit = defineEmits<{
  close: [];
  reopen: [boardId: number];
  delete: [boardId: number];
}>();

// State
const selectedWorkspace = ref<string | number>("all");

// Computed
const filteredClosedBoards = computed(() => {
  if (selectedWorkspace.value === "all") {
    return props.closedBoards;
  }

  if (selectedWorkspace.value === "personal") {
    return props.closedBoards.filter((board) => !board.workspaceId);
  }

  return props.closedBoards.filter(
    (board) => board.workspaceId === selectedWorkspace.value
  );
});

// Methods
const getWorkspaceName = (workspaceId?: number): string => {
  if (!workspaceId) return "Personal";

  const workspace = props.workspaces.find((w) => w.id === workspaceId);
  return workspace?.name || "Unknown Workspace";
};

const handleBackdropClick = () => {
  emit("close");
};

const handleReopenBoard = (boardId: number) => {
  emit("reopen", boardId);
};

const handleDeleteBoard = (boardId: number) => {
  emit("delete", boardId);
};

// Reset filter when modal opens
watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible) {
      selectedWorkspace.value = "all";
    }
  }
);

// Prevent body scroll when modal is open
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
