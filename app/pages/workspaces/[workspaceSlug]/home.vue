<template>
  <div class="p-6">
    <!-- Workspace Header -->
    <div class="mb-8">
      <div class="flex items-center space-x-4 mb-4">
        <div
          :class="[
            'w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl',
            getWorkspaceColor(workspace?.id || 0),
          ]"
        >
          {{ workspace ? getWorkspaceInitial(workspace.name) : "" }}
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ workspace?.name }}
          </h1>
          <p v-if="workspace?.description" class="text-gray-600 mt-1">
            {{ workspace.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Boards Section -->
    <section>
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Boards</h2>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <!-- Existing Boards -->
        <WorkspaceBoardCard
          v-for="board in workspaceBoards"
          :key="board.id"
          :board="board"
          @click="navigateToBoard(board)"
        />

        <!-- Create New Board Card -->
        <CreateBoardPopover />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Workspace } from "~/types";
import { parseWorkspaceSlug, routes } from "~/utils/routes";
import type { Board } from "~~/shared/types/globals";

// Use the app layout
definePageMeta({
  layout: "home",
});

// Get stores
const dataStore = useDataStore();
const authStore = useAuthStore();

// Get route params
const route = useRoute();
const workspaceSlug = route.params.workspaceSlug as string;

// Parse workspace info from slug
const { id: workspaceId } = parseWorkspaceSlug(workspaceSlug);

// Get current user from auth store
const currentUser = computed(() => authStore.user);

// Find workspace using data store
const workspace = computed(() => {
  return dataStore.getById("workspaces", workspaceId);
});

// Check if workspace exists
if (!workspace.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Workspace not found",
  });
}

// Check if user has access to this workspace
const hasAccess = computed(() => {
  if (!workspace.value || !currentUser.value) return false;

  const userId = parseInt(currentUser.value.id);

  // User owns workspace
  if (workspace.value.ownerId === userId) return true;

  // User is member of workspace
  return dataStore.workspaceMembers.some(
    (member) => member.workspaceId === workspaceId && member.userId === userId
  );
});

if (!hasAccess.value) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied",
  });
}

// Get workspace boards using data store
const workspaceBoards = computed(() => {
  return dataStore.getBoardsForWorkspace(workspaceId);
});

// Check if user can create boards
const canCreateBoard = computed(() => {
  if (!workspace.value || !currentUser.value) return false;

  const userId = parseInt(currentUser.value.id);

  // Owner can create boards
  if (workspace.value.ownerId === userId) return true;

  // Check member permissions
  const member = dataStore.workspaceMembers.find(
    (m) => m.workspaceId === workspaceId && m.userId === userId
  );

  return member?.canCreateBoards ?? false;
});

// Methods
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

const navigateToBoard = (board: Board) => {
  navigateTo(
    `/board/${board.id}/${board.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}`
  );
};

const handleCreateBoard = () => {
  // Handle board creation
  console.log("Create board in workspace:", workspaceId);
};

// SEO
useHead({
  title: `${workspace.value?.name} - Workspace | Trello Clone`,
  meta: [
    {
      name: "description",
      content: `${workspace.value?.name} workspace boards`,
    },
  ],
});
</script>
