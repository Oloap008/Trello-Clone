<template>
  <div ref="buttonContainer" class="relative">
    <!-- Reopen Button -->
    <button
      :class="[
        'px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors',
        { 'bg-blue-100': isVisible },
      ]"
      @click="togglePopover"
    >
      Reopen
    </button>

    <!-- Teleport Popover outside modal -->
    <Teleport to="body">
      <div
        v-if="isVisible"
        class="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-72 z-[60]"
        :style="popoverStyle"
        @click.stop
      >
        <!-- Header -->
        <div class="p-3 border-b border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-600">
              Select a Workspace
            </h3>
            <button
              class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
              @click="closePopover"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>
          <p class="text-xs text-gray-500 truncate">{{ boardName }}</p>
        </div>

        <!-- Workspace Selection -->
        <div class="p-3">
          <label class="block text-xs font-medium text-gray-700 mb-2">
            Your Workspaces
          </label>

          <div class="relative">
            <select
              v-model="selectedWorkspaceId"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm"
            >
              <option value="">Select workspace...</option>
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

          <!-- Reopen Board Button -->
          <button
            :disabled="!selectedWorkspaceId"
            class="w-full mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
            @click="handleReopen"
          >
            Reopen board
          </button>
        </div>
      </div>

      <!-- Backdrop -->
      <div
        v-if="isVisible"
        class="fixed inset-0 bg-transparent z-[59]"
        @click="closePopover"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Workspace {
  id: number;
  name: string;
}

interface Props {
  boardId: number;
  boardName: string;
  workspaces: Workspace[];
  currentWorkspaceId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  workspaces: () => [],
  currentWorkspaceId: undefined,
});

const emit = defineEmits<{
  reopen: [boardId: number, workspaceId: number | string];
  delete: [boardId: number];
}>();

// State
const isVisible = ref(false);
const selectedWorkspaceId = ref<number | string>("");
const buttonContainer = ref<HTMLElement>();
const popoverStyle = ref({});

// Calculate popover position
const calculatePopoverPosition = () => {
  if (!buttonContainer.value) return;

  const rect = buttonContainer.value.getBoundingClientRect();
  const popoverWidth = 288; // w-72 = 288px
  const popoverHeight = 200; // estimated height

  let left = rect.right - popoverWidth; // Align right edge
  let top = rect.bottom + 4; // 4px gap below button

  // Adjust if popover would go off screen
  if (left < 8) {
    left = 8; // 8px margin from left edge
  }

  if (left + popoverWidth > window.innerWidth - 8) {
    left = window.innerWidth - popoverWidth - 8; // 8px margin from right edge
  }

  if (top + popoverHeight > window.innerHeight - 8) {
    top = rect.top - popoverHeight - 4; // Show above button instead
  }

  popoverStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
  };
};

// Methods
const togglePopover = () => {
  if (!isVisible.value) {
    // Set default workspace when opening
    if (props.currentWorkspaceId) {
      selectedWorkspaceId.value = props.currentWorkspaceId;
    } else if (props.workspaces.length > 0) {
      selectedWorkspaceId.value = props.workspaces[0].id;
    } else {
      selectedWorkspaceId.value = "personal";
    }

    // Calculate position
    nextTick(() => {
      calculatePopoverPosition();
    });
  }
  isVisible.value = !isVisible.value;
};

const closePopover = () => {
  isVisible.value = false;
  selectedWorkspaceId.value = "";
};

const handleReopen = () => {
  if (selectedWorkspaceId.value) {
    console.log(
      "Reopening board:",
      props.boardId,
      "to workspace:",
      selectedWorkspaceId.value
    );
    emit("reopen", props.boardId, selectedWorkspaceId.value);
    closePopover();
  } else {
    console.log("No workspace selected");
  }
};

// Handle window resize
onMounted(() => {
  const handleResize = () => {
    if (isVisible.value) {
      calculatePopoverPosition();
    }
  };

  window.addEventListener("resize", handleResize);

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });
});
</script>
