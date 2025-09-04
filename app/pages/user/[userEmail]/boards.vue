<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Loading state -->
    <div
      v-if="!dataStore.isLoaded || !authStore.isLoaded"
      class="flex items-center justify-center min-h-[50vh]"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading your workspaces...</p>
      </div>
    </div>

    <!-- Main content -->
    <div v-else>
      <!-- Your Workspaces Section -->
      <section>
        <h2
          class="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-6"
        >
          YOUR WORKSPACES
        </h2>

        <div v-if="userWorkspaces.length === 0" class="text-center py-12">
          <p class="text-gray-500 mb-4">You don't have any workspaces yet.</p>
          <UButton color="primary">Create Your First Workspace</UButton>
        </div>

        <div v-else class="space-y-12">
          <div v-for="workspace in userWorkspaces" :key="workspace.id">
            <!-- Workspace Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div
                  :class="[
                    'w-8 h-8 rounded flex items-center justify-center text-white font-medium text-sm',
                    getWorkspaceColor(workspace.id),
                  ]"
                >
                  {{ getWorkspaceInitial(workspace.name) }}
                </div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ workspace.name }}
                </h3>
              </div>

              <div class="flex items-center space-x-1">
                <WorkspaceNavButton
                  :to="getWorkspaceHomeUrl(workspace)"
                  icon="i-heroicons-squares-2x2"
                  label="Boards"
                />

                <WorkspaceNavButton
                  :to="getWorkspaceMembersUrl(workspace)"
                  icon="i-heroicons-users"
                  label="Members"
                />

                <WorkspaceNavButton
                  :to="getWorkspaceSettingsUrl(workspace)"
                  icon="i-heroicons-cog-6-tooth"
                  label="Settings"
                />
              </div>
            </div>

            <!-- Boards Grid -->
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-4"
            >
              <!-- Existing Boards -->
              <WorkspaceBoardCard
                v-for="board in getWorkspaceBoards(workspace.id)"
                :key="board.id"
                :board="board"
                @click="navigateToBoard(board)"
              />

              <!-- Create New Board Popover -->
              <CreateBoardPopover
                v-if="canCreateBoardInWorkspace(workspace.id)"
                :workspace-id="workspace.id"
              />
            </div>
          </div>
        </div>

        <!-- Single View All Closed Boards Button -->
        <div class="mt-8">
          <button
            class="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
          >
            <UIcon name="i-heroicons-eye-slash" class="w-4 h-4 mr-1.5" />
            View all closed boards
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Workspace } from "~/types";
import type { Board } from "~~/shared/types/globals";

// Use the home layout and require authentication
definePageMeta({
  layout: "home",
});

// Get stores
const dataStore = useDataStore();
const authStore = useAuthStore();

// Get route params
const route = useRoute();
const userEmail = route.params.userEmail as string;

// Get current user from auth store
const currentUser = computed(() => authStore.user);

// Decode email if it was URL encoded
const decodedUserEmail = decodeURIComponent(userEmail);

// Auth check - make sure the user can access this page
watchEffect(() => {
  if (
    authStore.isLoaded &&
    currentUser.value &&
    currentUser.value.email !== decodedUserEmail
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied - You can only view your own boards",
    });
  }
});

// Get user's workspaces
const userWorkspaces = computed(() => {
  if (!currentUser.value || !dataStore.isLoaded) return [];

  // Convert string ID to number for data store compatibility
  const userId = parseInt(currentUser.value.id);
  return dataStore.getWorkspacesForUser(userId);
});

// Methods
const getWorkspaceBoards = (workspaceId: number) => {
  return dataStore.getBoardsForWorkspace(workspaceId);
};

const canCreateBoardInWorkspace = (workspaceId: number) => {
  if (!currentUser.value || !dataStore.isLoaded) return false;

  const userId = parseInt(currentUser.value.id);

  const workspace = dataStore.getById("workspaces", workspaceId);

  // Owner can create boards
  if (workspace?.ownerId === userId) return true;

  // Check workspace member permissions
  const member = dataStore.workspaceMembers.find(
    (m) => m.workspaceId === workspaceId && m.userId === userId
  );

  return member?.canCreateBoards ?? false;
};

const navigateToBoard = (board: Board) => {
  navigateTo(
    `/board/${board.id}/${board.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}`
  );
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

// SEO
useHead({
  title: `${currentUser.value?.name || decodedUserEmail} - Boards | Taskify`,
  meta: [
    {
      name: "description",
      content: `${
        currentUser.value?.name || decodedUserEmail
      }'s boards and workspaces`,
    },
  ],
});
</script>
