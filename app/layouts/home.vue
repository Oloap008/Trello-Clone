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

    <!-- UModal - Multi-step modal -->
    <UModal
      v-model:open="isModalOpen"
      :title="
        modalStep === 'workspace' ? 'Create a Workspace' : 'Invite your team'
      "
      :ui="{
        content: 'sm:max-w-4xl',
        body: 'p-0',
      }"
    >
      <!-- Invisible trigger - modal is controlled programmatically -->
      <div style="display: none" />

      <template #body>
        <div class="p-6">
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
      </template>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="closeModal"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, navigateTo } from "#app";
import WorkspaceSetupForm from "@/components/WorkspaceSetupForm.vue";

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
    const newWorkspace = dataStore.create("workspaces", {
      name: formData.name,
      type: formData.type,
      description: formData.description,
      ownerId: parseInt(authStore.user.id),
    });

    console.log("Created workspace:", newWorkspace);
  }

  // Move to next step
  modalStep.value = "invite";
};

const handleInviteComplete = () => {
  console.log("Team invitation completed");
  closeModal();
};

const logout = () => {
  console.log("Logging out...");
  navigateTo("/login");
};
</script>

<style scoped>
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
