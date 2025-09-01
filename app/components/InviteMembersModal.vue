<template>
  <div class="flex min-w-0">
    <!-- Left Section - Form -->
    <div class="flex-1 pr-8 min-w-0">
      <h1 class="text-2xl font-bold mb-2 text-gray-900">Invite your team</h1>
      <p class="text-gray-600 mb-6">
        Search and invite existing users to your workspace.
      </p>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Workspace Members Section -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-3">
            Search users to invite
          </label>

          <!-- User Search Input -->
          <div class="relative" style="z-index: 1000">
            <UInput
              v-model="searchQuery"
              placeholder="Search by name or email..."
              size="lg"
              class="w-full mb-2"
              icon="i-heroicons-magnifying-glass"
              @input="handleSearch"
            />

            <!-- Search Results Dropdown -->
            <div
              v-if="
                searchQuery &&
                (filteredUsers.length > 0 || filteredUsers.length === 0)
              "
              class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200/60 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-[1001] backdrop-blur-sm"
              style="
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15),
                  0 0 0 1px rgba(0, 0, 0, 0.05);
              "
            >
              <!-- Search Results -->
              <div v-if="filteredUsers.length > 0">
                <div
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  @click="selectUser(user)"
                >
                  <div class="flex items-center space-x-3">
                    <UAvatar
                      :alt="`${user.firstName} ${user.lastName}`"
                      size="sm"
                      :ui="{
                        background:
                          'bg-gradient-to-r from-blue-500 to-purple-500',
                      }"
                    >
                      {{ getUserInitials(user) }}
                    </UAvatar>
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        {{ user.firstName }} {{ user.lastName }}
                      </p>
                      <p class="text-xs text-gray-500">{{ user.email }}</p>
                    </div>
                  </div>
                  <UButton size="xs" variant="outline"> Add </UButton>
                </div>
              </div>

              <!-- No results message -->
              <div v-else class="p-3">
                <p class="text-sm text-gray-500 text-center">No users found</p>
              </div>
            </div>
          </div>

          <!-- Selected Users List -->
          <div v-if="selectedUsers.length > 0" class="mb-4 space-y-2">
            <h4 class="text-sm font-medium text-gray-700 mb-2">
              Selected users:
            </h4>
            <div
              v-for="user in selectedUsers"
              :key="user.id"
              class="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md"
            >
              <div class="flex items-center space-x-2">
                <UAvatar
                  :alt="`${user.firstName} ${user.lastName}`"
                  size="xs"
                  :ui="{
                    background: 'bg-gradient-to-r from-blue-500 to-purple-500',
                  }"
                >
                  {{ getUserInitials(user) }}
                </UAvatar>
                <div>
                  <span class="text-sm font-medium text-gray-900">
                    {{ user.firstName }} {{ user.lastName }}
                  </span>
                  <span class="text-xs text-gray-500 ml-1"
                    >({{ user.email }})</span
                  >
                </div>
              </div>
              <button
                class="text-gray-400 hover:text-red-500 transition-colors"
                type="button"
                @click="removeUser(user.id)"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Invite Button -->
          <UButton
            type="button"
            :loading="isInviting"
            class="w-full mb-6"
            :disabled="selectedUsers.length === 0"
            @click="sendInvites"
          >
            <span v-if="!isInviting">
              Invite {{ selectedUsers.length }}
              {{ selectedUsers.length === 1 ? "user" : "users" }} to Workspace
            </span>
            <span v-else>Sending invites...</span>
          </UButton>

          <!-- Skip Option -->
          <div class="text-center">
            <button
              type="button"
              class="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
              @click="handleSkip"
            >
              I'll do this later
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Right Section - Illustration -->
    <div class="flex-1 flex items-center justify-center pl-8 min-w-0">
      <div class="relative">
        <!-- Background circles -->
        <div
          class="absolute -top-4 -right-4 w-3 h-3 bg-blue-400 rounded-full opacity-60"
        />
        <div
          class="absolute -bottom-6 -left-6 w-2 h-2 bg-green-400 rounded-full opacity-60"
        />
        <div
          class="absolute top-1/2 -right-8 w-2 h-2 bg-yellow-400 rounded-full opacity-60"
        />
        <div
          class="absolute -top-8 left-1/3 w-4 h-4 bg-purple-400 rounded-full opacity-40"
        />

        <!-- Main illustration container -->
        <div
          class="bg-gradient-to-br from-cyan-400 via-teal-400 to-green-400 rounded-2xl p-8 shadow-xl"
        >
          <!-- Trello-style boards with team members -->
          <div class="flex space-x-4">
            <!-- Board 1 -->
            <div class="bg-white rounded-lg p-3 w-24 shadow-md">
              <div class="h-2 bg-gray-200 rounded mb-2" />
              <div class="h-2 bg-gray-300 rounded mb-2" />
              <div class="h-6 bg-red-100 rounded mb-1" />
              <div class="h-6 bg-green-100 rounded" />
            </div>

            <!-- Board 2 -->
            <div class="bg-white rounded-lg p-3 w-24 shadow-md">
              <div class="h-2 bg-gray-200 rounded mb-2" />
              <div class="h-6 bg-yellow-100 rounded mb-1" />
              <div class="h-6 bg-blue-100 rounded mb-1" />
              <div class="h-4 bg-gray-100 rounded" />
            </div>

            <!-- Board 3 -->
            <div class="bg-white rounded-lg p-3 w-24 shadow-md">
              <div class="h-2 bg-gray-200 rounded mb-2" />
              <div class="h-4 bg-gray-100 rounded mb-1" />
              <div class="h-6 bg-purple-100 rounded mb-1" />
              <div class="h-4 bg-gray-100 rounded" />
            </div>
          </div>

          <!-- Team avatars at bottom -->
          <div class="flex justify-center mt-4 space-x-2">
            <div
              class="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-600"
            >
              👤
            </div>
            <div
              class="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-600"
            >
              👤
            </div>
            <div
              class="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-600"
            >
              👤
            </div>
          </div>

          <!-- Cute mascot -->
          <div
            class="absolute -bottom-2 -left-4 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg"
          >
            <span class="text-white text-sm">😊</span>
          </div>
        </div>

        <!-- Floating elements -->
        <div
          class="absolute -top-6 left-8 w-6 h-6 bg-blue-500 rounded-full opacity-20 animate-bounce"
        />
        <div
          class="absolute -bottom-4 right-12 w-4 h-4 bg-green-500 rounded-full opacity-30 animate-pulse"
        />
      </div>
    </div>
  </div>

  <!-- Search Results Dropdown - Teleported to body -->
  <Teleport to="body">
    <div
      v-if="showDropdown && searchQuery"
      ref="dropdown"
      :style="dropdownPosition"
      class="fixed z-[99999] bg-white border border-gray-200/60 rounded-xl shadow-2xl max-h-64 overflow-y-auto backdrop-blur-sm"
      style="
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(0, 0, 0, 0.05);
      "
    >
      <!-- Search Results -->
      <div v-if="filteredUsers.length > 0">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
          @click="selectUser(user)"
        >
          <div class="flex items-center space-x-3">
            <UAvatar
              :alt="`${user.firstName} ${user.lastName}`"
              size="sm"
              :ui="{
                background: 'bg-gradient-to-r from-blue-500 to-purple-500',
              }"
            >
              {{ getUserInitials(user) }}
            </UAvatar>
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ user.firstName }} {{ user.lastName }}
              </p>
              <p class="text-xs text-gray-500">{{ user.email }}</p>
            </div>
          </div>
          <UButton size="xs" variant="outline"> Add </UButton>
        </div>
      </div>

      <!-- No results message -->
      <div v-else class="p-4">
        <p class="text-sm text-gray-500 text-center">No users found</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const emit = defineEmits(["complete", "back"]);

// Get stores
const dataStore = useDataStore();
const authStore = useAuthStore();

// Form state
const searchQuery = ref("");
const selectedUsers = ref([]);
const isInviting = ref(false);

// Get current user ID for filtering
const currentUserId = computed(() =>
  authStore.user?.id ? parseInt(authStore.user.id) : null
);

// Get all users except the current user
const availableUsers = computed(() => {
  if (!currentUserId.value || !dataStore.isLoaded) return [];

  return dataStore.users.filter(
    (user) => user.id !== currentUserId.value && user.status === "active"
  );
});

// Filter users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return [];

  const query = searchQuery.value.toLowerCase();
  return availableUsers.value
    .filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const username = user.username.toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        username.includes(query)
      );
    })
    .filter(
      (user) => !selectedUsers.value.find((selected) => selected.id === user.id)
    )
    .slice(0, 10); // Limit to 10 results
});

// Functions
const handleSearch = () => {
  // Search happens automatically through computed property
};

const selectUser = (user) => {
  selectedUsers.value.push(user);
  searchQuery.value = ""; // Clear search after selection
};

const removeUser = (userId) => {
  selectedUsers.value = selectedUsers.value.filter(
    (user) => user.id !== userId
  );
};

const getUserInitials = (user) => {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};

const sendInvites = async () => {
  if (selectedUsers.value.length === 0) return;

  isInviting.value = true;

  try {
    // Get the latest workspace (assuming this is for a newly created workspace)
    const workspaces = dataStore.workspaces;
    const latestWorkspace = workspaces[workspaces.length - 1];

    if (!latestWorkspace) {
      throw new Error("No workspace found to add members to");
    }

    console.log("Adding members to workspace:", latestWorkspace.name);

    // Create workspace member records for each selected user
    selectedUsers.value.forEach((user) => {
      dataStore.create("workspaceMembers", {
        workspaceId: latestWorkspace.id,
        userId: user.id,
        role: "member",
        canCreateBoards: true,
        canInviteMembers: false,
        joinedAt: new Date().toISOString(),
      });

      console.log(`Added ${user.firstName} ${user.lastName} to workspace`);
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    emit("complete");
  } catch (error) {
    console.error("Error adding members:", error);
    // You could show an error toast here
  } finally {
    isInviting.value = false;
  }
};

const handleSkip = () => {
  emit("complete");
};
</script>
