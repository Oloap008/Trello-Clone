<template>
  <div class="relative">
    <!-- Create New Board Card Trigger -->
    <div
      class="h-28 bg-gray-100 rounded-lg cursor-pointer transition-colors hover:bg-gray-200 group flex items-center justify-center"
      @click="togglePopover"
    >
      <span class="text-sm font-medium text-gray-600 group-hover:text-gray-800"
        >Create new board</span
      >
    </div>

    <!-- Popover Content -->
    <div
      v-if="isOpen"
      class="absolute z-50 top-full left-0 mt-2 w-80 p-6 bg-white rounded-lg shadow-xl border border-gray-200"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-900">Create board</h3>
        <button @click="closePopover" class="p-1 hover:bg-gray-100 rounded">
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleCreateBoard">
        <!-- Board Preview with actual background -->
        <div class="mb-6">
          <div class="relative h-24 rounded-lg overflow-hidden">
            <!-- Background image or color -->
            <div
              class="absolute inset-0"
              :style="{
                backgroundColor: selectedBackground
                  ? 'transparent'
                  : selectedColor,
                backgroundImage: selectedBackground
                  ? `url(${selectedBackground})`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }"
            ></div>

            <!-- Kanban columns mockup overlay -->
            <div class="relative h-full flex space-x-2 p-3">
              <!-- Column 1 -->
              <div class="flex-1 bg-white bg-opacity-90 rounded-sm p-1">
                <div class="h-1.5 bg-gray-300 rounded mb-1"></div>
                <div class="h-1 bg-gray-200 rounded mb-1"></div>
                <div class="h-1 bg-gray-200 rounded"></div>
              </div>

              <!-- Column 2 -->
              <div class="flex-1 bg-white bg-opacity-90 rounded-sm p-1">
                <div class="h-1.5 bg-gray-300 rounded mb-1"></div>
                <div class="h-1 bg-gray-200 rounded mb-1"></div>
                <div class="h-1 bg-gray-200 rounded mb-1"></div>
                <div class="h-1 bg-gray-200 rounded"></div>
              </div>

              <!-- Column 3 -->
              <div class="flex-1 bg-white bg-opacity-90 rounded-sm p-1">
                <div class="h-1.5 bg-gray-300 rounded mb-1"></div>
                <div class="h-1 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Background Section -->
        <div class="mb-6">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Background</h4>
          <div class="space-y-2">
            <!-- Background Images Row -->
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="bg in backgroundImages"
                :key="bg.id"
                type="button"
                class="h-12 rounded bg-cover bg-center border-2 transition-all hover:opacity-80"
                :class="
                  selectedBackground === bg.url
                    ? 'border-blue-500'
                    : 'border-gray-200'
                "
                :style="{ backgroundImage: `url(${bg.url})` }"
                @click="selectBackground(bg.url)"
              />
            </div>

            <!-- Color Options Row -->
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="color in backgroundColors"
                :key="color"
                type="button"
                class="h-12 rounded border-2 transition-all hover:opacity-80 relative flex items-center justify-center"
                :class="
                  selectedColor === color && !selectedBackground
                    ? 'border-gray-400'
                    : 'border-gray-200'
                "
                :style="{ backgroundColor: color }"
                @click="selectColor(color)"
              >
                <!-- Checkmark for selected color -->
                <UIcon
                  v-if="selectedColor === color && !selectedBackground"
                  name="i-heroicons-check"
                  class="w-5 h-5 text-white"
                />
              </button>

              <!-- More options button -->
              <button
                type="button"
                class="h-12 rounded border-2 border-gray-200 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-ellipsis-horizontal"
                  class="w-5 h-5 text-gray-500"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Board Title -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Board title <span class="text-red-500">*</span>
          </label>
          <input
            v-model="boardTitle"
            type="text"
            placeholder=""
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-300': showError && !boardTitle }"
          />
          <div v-if="showError && !boardTitle" class="flex items-center mt-2">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-4 h-4 text-yellow-500 mr-1 flex-shrink-0"
            />
            <span class="text-sm text-gray-600">Board title is required</span>
          </div>
        </div>

        <!-- Workspace Selection -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Workspace
          </label>
          <select
            v-model="selectedWorkspace"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
          >
            <option
              v-for="option in workspaceOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Visibility -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Visibility
          </label>
          <div class="relative">
            <button
              type="button"
              @click="showVisibilityOptions = !showVisibilityOptions"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
            >
              <div class="flex items-center">
                <UIcon
                  :name="selectedVisibilityOption?.icon"
                  class="w-4 h-4 mr-2 text-gray-500"
                />
                <span>{{ selectedVisibilityOption?.label }}</span>
              </div>
              <UIcon
                name="i-heroicons-chevron-down"
                class="w-4 h-4 text-gray-500"
              />
            </button>

            <!-- Visibility Options Dropdown -->
            <div
              v-if="showVisibilityOptions"
              class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg"
            >
              <div
                v-for="option in visibilityOptions"
                :key="option.value"
                @click="selectVisibility(option.value)"
                class="flex items-start p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <UIcon
                  :name="option.icon"
                  class="w-5 h-5 mr-3 mt-0.5 text-gray-500 flex-shrink-0"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900 text-sm">
                    {{ option.label }}
                  </div>
                  <div class="text-xs text-gray-600 mt-1">
                    {{ option.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Backdrop for visibility dropdown -->
          <div
            v-if="showVisibilityOptions"
            class="fixed inset-0 z-40"
            @click="showVisibilityOptions = false"
          ></div>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <button
            type="submit"
            class="w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="!boardTitle"
          >
            Create
          </button>

          <button
            type="button"
            class="w-full px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Start with a template
          </button>
        </div>
      </form>
    </div>

    <!-- Backdrop -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="closePopover"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  workspaceId?: number;
}

const props = defineProps<Props>();

// Popover state
const isOpen = ref(false);
const showVisibilityOptions = ref(false);

// Form data
const boardTitle = ref("");
const selectedColor = ref("#8B5CF6"); // Purple color to match screenshot
const selectedBackground = ref("");
const selectedWorkspace = ref(props.workspaceId || 1);
const visibility = ref("workspace");
const showError = ref(false);

// Background options - matching the screenshot
const backgroundImages = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=3840&h=2160&fit=crop",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=3840&h=2160&fit=crop",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=3840&h=2160&fit=crop",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=3840&h=2160&fit=crop",
  },
];

const backgroundColors = [
  "#87CEEB", // Light blue
  "#4682B4", // Steel blue
  "#191970", // Navy blue
  "#8B5CF6", // Purple (default selected)
];

// Get stores
const dataStore = useDataStore();
const authStore = useAuthStore();

// Get current user
const currentUser = computed(() => authStore.user);

// Get user's workspaces for the dropdown
const userWorkspaces = computed(() => {
  if (!currentUser.value) return [];

  const userId = parseInt(currentUser.value.id);
  return dataStore.getWorkspacesForUser(userId);
});

// Workspace options for dropdown
const workspaceOptions = computed(() => {
  return userWorkspaces.value.map((workspace) => ({
    label: workspace.name,
    value: workspace.id,
  }));
});

// Get current workspace for visibility options
const currentWorkspace = computed(() => {
  return userWorkspaces.value.find((w) => w.id === selectedWorkspace.value);
});

// Visibility options based on workspace
const visibilityOptions = computed(() => {
  const options = [
    {
      value: "private",
      label: "Private",
      description:
        "Only board members can see this board. Workspace admins can close the board or remove members.",
      icon: "i-heroicons-lock-closed",
    },
    {
      value: "public",
      label: "Public",
      description:
        "Anyone on the internet can see this board. Only board members can edit.",
      icon: "i-heroicons-globe-alt",
    },
  ];

  if (currentWorkspace.value) {
    options.splice(1, 0, {
      value: "workspace",
      label: "Workspace",
      description: `All members of the ${currentWorkspace.value.name} workspace can see and edit this board.`,
      icon: "i-heroicons-users",
    });
  }

  return options;
});

// Selected visibility option details
const selectedVisibilityOption = computed(() => {
  return visibilityOptions.value.find(
    (option) => option.value === visibility.value
  );
});

// Methods
const togglePopover = () => {
  isOpen.value = !isOpen.value;
};

const closePopover = () => {
  isOpen.value = false;
};

const selectBackground = (url: string) => {
  selectedBackground.value = url;
};

const selectColor = (color: string) => {
  selectedColor.value = color;
  selectedBackground.value = "";
};

const selectVisibility = (value: string) => {
  visibility.value = value;
  showVisibilityOptions.value = false;
};

const handleCreateBoard = () => {
  if (!boardTitle.value.trim()) {
    showError.value = true;
    return;
  }

  if (!currentUser.value) {
    console.error("No current user found");
    return;
  }

  // Create the board using your data store
  const newBoard = dataStore.create("boards", {
    name: boardTitle.value.trim(),
    description: "",
    color: selectedBackground.value ? undefined : selectedColor.value,
    backgroundImage: selectedBackground.value || undefined,
    workspaceId: selectedWorkspace.value,
    ownerId: parseInt(currentUser.value.id), // Convert string ID to number
    visibility: visibility.value, // Use the three-option visibility
    status: "active",
  });

  // Add the current user as the board owner in BoardMembers
  dataStore.create("boardMembers", {
    boardId: newBoard.id,
    userId: parseInt(currentUser.value.id),
    role: "owner",
    canEdit: true,
    canInvite: true,
    joinedAt: new Date().toISOString(),
  });

  console.log("Board created successfully:", newBoard);

  // Reset form
  boardTitle.value = "";
  selectedBackground.value = "";
  selectedColor.value = "#8B5CF6";
  showError.value = false;
  showVisibilityOptions.value = false;

  closePopover();

  // Optional: Navigate to the new board
  navigateTo(
    `/board/${newBoard.id}/${newBoard.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}`
  );
};
</script>
