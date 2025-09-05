<template>
  <div class="w-64 bg-gray-50 border-r border-gray-200 h-full">
    <!-- Navigation -->
    <div class="p-2 space-y-1">
      <!-- Top Navigation Items -->
      <nav class="space-y-1 mb-6">
        <NuxtLink
          :to="userBoardsUrl"
          class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
          active-class="bg-gray-100 text-gray-900"
        >
          <UIcon
            name="i-heroicons-squares-2x2"
            class="w-5 h-5 mr-3 text-gray-400"
          />
          Boards
        </NuxtLink>

        <NuxtLink
          :to="userBoardsUrl"
          class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
          active-class="bg-gray-100 text-gray-900"
        >
          <UIcon name="i-heroicons-home" class="w-5 h-5 mr-3 text-gray-400" />
          Home
        </NuxtLink>
      </nav>

      <!-- Workspaces Section -->
      <div class="mb-4">
        <h3
          class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
        >
          Workspaces
        </h3>

        <div
          v-for="workspace in userWorkspaces"
          :key="workspace.id"
          class="mb-2"
        >
          <!-- Workspace Header -->
          <button
            class="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 group"
            @click="toggleWorkspace(workspace.id)"
          >
            <!-- Workspace Avatar -->
            <div
              :class="[
                'w-6 h-6 rounded mr-3 flex items-center justify-center text-white text-xs font-medium',
                getWorkspaceColor(workspace.id),
              ]"
            >
              {{ getWorkspaceInitial(workspace.name) }}
            </div>

            <!-- Workspace Name -->
            <span class="flex-1 text-left font-medium truncate">
              {{ workspace.name }}
            </span>

            <!-- Expand/Collapse Icon -->
            <UIcon
              :name="
                expandedWorkspaces.has(workspace.id)
                  ? 'i-heroicons-chevron-down'
                  : 'i-heroicons-chevron-right'
              "
              class="w-4 h-4 text-gray-400"
            />
          </button>

          <!-- Workspace Content -->
          <div
            v-if="expandedWorkspaces.has(workspace.id)"
            class="ml-4 mt-1 space-y-1"
          >
            <!-- Boards -->
            <NuxtLink
              :to="getWorkspaceHomeUrl(workspace)"
              class="flex items-center px-3 py-1.5 text-sm text-gray-600 rounded hover:bg-gray-100"
              active-class="bg-blue-50 text-blue-700"
            >
              <UIcon
                name="i-heroicons-squares-2x2"
                class="w-4 h-4 mr-2 text-gray-400"
              />
              Boards
            </NuxtLink>

            <!-- Members -->
            <NuxtLink
              :to="getWorkspaceMembersUrl(workspace)"
              class="flex items-center px-3 py-1.5 text-sm text-gray-600 rounded hover:bg-gray-100"
              active-class="bg-blue-50 text-blue-700"
            >
              <UIcon
                name="i-heroicons-users"
                class="w-4 h-4 mr-2 text-gray-400"
              />
              Members
              <UIcon
                name="i-heroicons-plus"
                class="w-3 h-3 ml-auto text-gray-400"
              />
            </NuxtLink>

            <!-- Settings -->
            <NuxtLink
              :to="getWorkspaceSettingsUrl(workspace)"
              class="flex items-center px-3 py-1.5 text-sm text-gray-600 rounded hover:bg-gray-100"
              active-class="bg-blue-50 text-blue-700"
            >
              <UIcon
                name="i-heroicons-cog-6-tooth"
                class="w-4 h-4 mr-2 text-gray-400"
              />
              Settings
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Workspace } from "~~/shared/types/globals";

// Get stores
const dataStore = useDataStore();
const authStore = useAuthStore();

// Get current user from auth store
const currentUser = computed(() => authStore.user);

// Get user's workspaces from the store
const userWorkspaces = computed(() => {
  if (!currentUser.value) return [];

  // Convert string ID to number for comparison with your data
  const userId = parseInt(currentUser.value.id);

  // Use the new helper method from the store
  return dataStore.getWorkspacesForUser(userId);
});

// State
const expandedWorkspaces = ref(new Set([1])); // Expand first workspace by default

// Computed URLs
const userBoardsUrl = computed(() => {
  if (!currentUser.value) return "/";
  return `/user/${encodeURIComponent(currentUser.value.email)}/boards`;
});

// Methods
const toggleWorkspace = (workspaceId: number) => {
  if (expandedWorkspaces.value.has(workspaceId)) {
    expandedWorkspaces.value.delete(workspaceId);
  } else {
    expandedWorkspaces.value.add(workspaceId);
  }
};

const getWorkspaceInitial = (name: string) => {
  return name.charAt(0).toUpperCase();
};

const getWorkspaceColor = (workspaceId: number) => {
  const colors = [
    "bg-pink-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-purple-500",
  ];
  return colors[workspaceId % colors.length];
};

const getWorkspaceBoards = (workspaceId: number) => {
  return dataStore.getBoardsForWorkspace(workspaceId);
};

// URL helpers
const createWorkspaceSlug = (workspace: Workspace): string => {
  const nameSlug = workspace.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${nameSlug}-${workspace.id}`;
};

const getWorkspaceHomeUrl = (workspace: Workspace) => {
  return `/workspaces/${createWorkspaceSlug(workspace)}/home`;
};

const getWorkspaceMembersUrl = (workspace: Workspace) => {
  return `/workspaces/${createWorkspaceSlug(workspace)}/members`;
};

const getWorkspaceSettingsUrl = (workspace: Workspace) => {
  return `/workspaces/${createWorkspaceSlug(workspace)}/settings`;
};
</script>
