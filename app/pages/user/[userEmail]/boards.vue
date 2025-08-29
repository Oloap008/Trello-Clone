<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Your Workspaces Section -->
    <section>
      <h2
        class="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-6"
      >
        YOUR WORKSPACES
      </h2>

      <div class="space-y-12">
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
            <CreateBoardPopover :workspace-id="workspace.id" />
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
</template>

<script setup lang="ts">
import type { Workspace } from "~/types";
import type { Board } from "~~/shared/types/globals";

// Use the home layout
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
if (currentUser.value && currentUser.value.email !== decodedUserEmail) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied",
  });
}

// Get user's workspaces
const userWorkspaces = computed(() => {
  if (!currentUser.value) return [];

  const userId = parseInt(currentUser.value.id);
  return dataStore.getWorkspacesForUser(userId);
});

// Methods
const getWorkspaceBoards = (workspaceId: number) => {
  return dataStore.getBoardsForWorkspace(workspaceId);
};

const canCreateBoardInWorkspace = (workspaceId: number) => {
  if (!currentUser.value) return false;

  const userId = parseInt(currentUser.value.id);

  // Check if data is loaded and workspaces exist
  if (!dataStore.data.value?.workspaces) return false;

  const workspace = dataStore.data.value.workspaces.find(
    (w) => w.id === workspaceId
  );

  // Owner can create boards
  if (workspace?.ownerId === userId) return true;

  // Check workspace member permissions
  if (!dataStore.data.value?.workspaceMembers) return false;

  const member = dataStore.data.value.workspaceMembers.find(
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
  title: `${decodedUserEmail} - Boards | Trello Clone`,
  meta: [
    {
      name: "description",
      content: `${decodedUserEmail}'s boards and workspaces`,
    },
  ],
});
</script>
