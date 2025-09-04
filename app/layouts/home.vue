<template>
  <div class="min-h-screen">
    <AppHeader @create="openCreateModal" @logout="handleLogout" />

    <div class="flex">
      <AppSidebar v-if="showSidebar" />
      <main class="flex-1">
        <slot />
      </main>
    </div>

    <CreateWorkspaceModal
      v-model="isCreateModalOpen"
      @workspace-created="handleWorkspaceCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, navigateTo } from "#app";

const route = useRoute();
const showSidebar = computed(() => route.meta.showSidebar !== false);

// Modal state
const isCreateModalOpen = ref(false);

const openCreateModal = () => {
  isCreateModalOpen.value = true;
};

const handleLogout = async () => {
  const authStore = useAuthStore();
  authStore.signOut();
  console.log("Logging out...");
  await navigateTo("/");
};

const handleWorkspaceCreated = (workspace) => {
  console.log("Workspace created:", workspace);
  // Handle any additional logic after workspace creation
};
</script>
