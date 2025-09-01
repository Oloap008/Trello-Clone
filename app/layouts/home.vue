<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div
              class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center"
            >
              <span class="text-white font-bold text-sm">T</span>
            </div>
            <h1 class="text-xl font-semibold text-gray-900">Trello Clone</h1>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Search -->
          <div class="relative">
            <UInput
              placeholder="Search"
              size="sm"
              class="w-64"
              icon="i-heroicons-magnifying-glass-20-solid"
            />
          </div>

          <!-- Create Button -->
          <UButton color="blue" size="sm" @click="openModal"> Create </UButton>

          <!-- Right Side Actions -->
          <div class="flex items-center space-x-2">
            <UButton variant="ghost" size="sm" square>
              <UIcon name="i-heroicons-bell" />
            </UButton>
            <UButton variant="ghost" size="sm" square>
              <UIcon name="i-heroicons-question-mark-circle" />
            </UButton>

            <!-- User Avatar with Dropdown -->
            <UDropdownMenu :items="userItems">
              <UAvatar src="/api/placeholder/32/32" alt="User" size="sm" />
            </UDropdownMenu>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <AppSidebar v-if="showSidebar !== false" />

      <!-- Main Content -->
      <main class="flex-1">
        <slot />
      </main>
    </div>

    <!-- Custom Modal Overlay -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm pt-20"
      @click.self="closeModal"
    >
      <!-- Modal Content -->
      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto overflow-visible border-0"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-6 border-b border-gray-100"
        >
          <h2 class="text-lg font-semibold">
            {{
              modalStep === "workspace"
                ? "Create a Workspace"
                : "Invite your team"
            }}
          </h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="overflow-visible">
          <!-- Workspace Creation Step -->
          <WorkspaceSetupForm
            v-if="modalStep === 'workspace'"
            @submit="handleWorkspaceSubmit"
          />

          <!-- Team Invitation Step -->
          <TeamInviteForm
            v-else-if="modalStep === 'invite'"
            @complete="handleInviteComplete"
            @back="modalStep = 'workspace'"
          />
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl"
        >
          <div></div>
          <!-- Empty left side -->
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="closeModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, navigateTo } from "#app";
import WorkspaceSetupForm from "@/components/WorkspaceSetupForm.vue";

const authStore = useAuthStore();

const route = useRoute();
const showSidebar = computed(() => route.meta.showSidebar !== false);

// Modal state - now with steps
const isModalOpen = ref(false);
const modalStep = ref("workspace"); // 'workspace' or 'invite'

// Dropdown items - using onSelect with UModal
const userItems = ref([
  [
    {
      label: "Create Workspace",
      icon: "i-heroicons-building-office-2",
      onSelect: () => {
        console.log("Dropdown Create Workspace clicked!");
        openModal();
      },
    },
  ],
  [
    {
      label: "Log out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      onSelect: () => {
        console.log("Dropdown logout clicked!");
        logout();
      },
    },
  ],
]);

// Functions
const openModal = () => {
  console.log("Opening modal...");
  modalStep.value = "workspace";
  isModalOpen.value = true;
};

const closeModal = () => {
  console.log("Closing modal...");
  isModalOpen.value = false;
  modalStep.value = "workspace"; // Reset to first step
};

const handleWorkspaceSubmit = (formData) => {
  console.log("Workspace data submitted:", formData);

  // Create the workspace using the data store
  const dataStore = useDataStore();
  const authStore = useAuthStore();

  if (authStore.user) {
    const userId = parseInt(authStore.user.id);

    // Create the workspace
    const newWorkspace = dataStore.create("workspaces", {
      name: formData.name,
      description: formData.description,
      ownerId: userId,
      isPublic: false,
      status: "active",
    });

    console.log("Created workspace:", newWorkspace);

    // IMPORTANT: Add the owner as a workspace member
    const ownerMembership = dataStore.create("workspaceMembers", {
      workspaceId: newWorkspace.id,
      userId: userId,
      role: "admin",
      canCreateBoards: true,
      canInviteMembers: true,
      joinedAt: new Date().toISOString(),
    });

    console.log("Created owner membership:", ownerMembership);
  }

  // Move to next step
  modalStep.value = "invite";
};

const handleInviteComplete = () => {
  console.log("Team invitation completed");
  closeModal();
};

const logout = () => {
  authStore.signOut();
  console.log("Logging out...");
  navigateTo("/");
};
</script>

<style scoped>
/* Ensure dropdown can extend outside modal */
.overflow-visible {
  overflow: visible !important;
}

/* Modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: transform 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  transform: scale(0.95);
}
</style>
