<template>
  <!-- Custom Modal Overlay to handle overflow properly -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm pt-20"
    @click.self="closeModal"
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-visible border-0"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-100"
      >
        <h2 class="text-lg font-semibold">Invite to Workspace</h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-visible">
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Invite your team
          </h3>
          <p class="text-gray-600">
            Search and invite existing users to {{ workspaceName }}.
          </p>
        </div>

        <!-- User Search Input with Dropdown -->
        <div class="relative mb-4" style="z-index: 1000">
          <UInput
            v-model="searchQuery"
            placeholder="Search by name or email..."
            size="lg"
            class="w-full"
            icon="i-heroicons-magnifying-glass"
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
                class="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
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
        <div v-if="selectedUsers.length > 0" class="mb-6 space-y-2">
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
              class="text-gray-400 hover:text-red-500"
              type="button"
              @click="removeUser(user.id)"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl"
      >
        <UButton variant="outline" @click="closeModal"> Cancel </UButton>

        <UButton
          :loading="isInviting"
          :disabled="selectedUsers.length === 0"
          @click="sendInvites"
        >
          <span v-if="!isInviting">
            Invite {{ selectedUsers.length }}
            {{ selectedUsers.length === 1 ? "user" : "users" }}
          </span>
          <span v-else>Sending invites...</span>
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  workspaceId: {
    type: Number,
    required: true,
  },
  workspaceName: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["invited"]);

// Get stores
const dataStore = useDataStore();
const authStore = useAuthStore();

// Modal state
const isOpen = ref(false);
const searchQuery = ref("");
const selectedUsers = ref([]);
const isInviting = ref(false);

// Get current user ID for filtering
const currentUserId = computed(() =>
  authStore.user?.id ? parseInt(authStore.user.id) : null
);

// Get existing workspace members to exclude them from search
const existingMemberIds = computed(() => {
  if (!dataStore.isLoaded) return [];
  return dataStore.workspaceMembers
    .filter((member) => member.workspaceId === props.workspaceId)
    .map((member) => member.userId);
});

// Get all users except current user and existing members
const availableUsers = computed(() => {
  if (!currentUserId.value || !dataStore.isLoaded) return [];

  return dataStore.users.filter(
    (user) =>
      user.id !== currentUserId.value &&
      user.status === "active" &&
      !existingMemberIds.value.includes(user.id)
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
    .slice(0, 10);
});

// Methods
const openModal = () => {
  isOpen.value = true;
  // Reset form state
  searchQuery.value = "";
  selectedUsers.value = [];
};

const closeModal = () => {
  isOpen.value = false;
  searchQuery.value = "";
  selectedUsers.value = [];
};

const selectUser = (user) => {
  selectedUsers.value.push(user);
  searchQuery.value = "";
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
    // Create workspace member records for each selected user
    selectedUsers.value.forEach((user) => {
      dataStore.create("workspaceMembers", {
        workspaceId: props.workspaceId,
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

    // Emit event to parent to refresh data
    emit("invited", selectedUsers.value);

    closeModal();
  } catch (error) {
    console.error("Error adding members:", error);
  } finally {
    isInviting.value = false;
  }
};

// Expose methods to parent
defineExpose({
  openModal,
  closeModal,
});
</script>

<style scoped>
/* Ensure dropdown can extend outside modal */
.overflow-visible {
  overflow: visible !important;
}
</style>
