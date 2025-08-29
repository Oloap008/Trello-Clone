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
          <UButton color="blue" size="sm" @click="createWorkspace"
            >Create</UButton
          >

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

    <!-- Workspace Modal -->
    <UModal
      v-model="isWorkspaceModalOpen"
      :ui="{ width: 'w-full max-w-lg' }"
      teleport
    >
      <template #header>
        <h3 class="text-lg font-semibold">Create a Workspace</h3>
      </template>

      <div class="p-4">
        <!-- Form Component -->
        <WorkspaceSetupForm @submit="handleWorkspaceSubmit" />
      </div>
    </UModal>

    <Test />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import WorkspaceSetupForm from "@/components/WorkspaceSetupForm.vue";

const route = useRoute();
const showSidebar = computed(() => route.meta.showSidebar !== false);

// Modal state
const isWorkspaceModalOpen = ref(false);

// Dropdown items
const userItems = ref([
  [
    {
      label: "Create Workspace",
      icon: "i-heroicons-building-office-2",
      click: () => createWorkspace(),
    },
  ],
  [
    {
      label: "Log out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: () => logout(),
    },
  ],
]);

// Functions
const createWorkspace = () => {
  isWorkspaceModalOpen.value = true;
};

const handleWorkspaceSubmit = (formData) => {
  console.log("Workspace data submitted:", formData);
  isWorkspaceModalOpen.value = false;
};

const logout = () => {
  console.log("Logging out...");
  navigateTo("/login");
};
</script>
