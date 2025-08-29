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

      <!-- Workspace Navigation Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <NuxtLink
            :to="routes.workspaceHome(workspace!)"
            class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            active-class="border-blue-500 text-blue-600"
          >
            <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 mr-2 inline" />
            Boards
          </NuxtLink>

          <NuxtLink
            :to="routes.workspaceMembers(workspace!)"
            class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            active-class="border-blue-500 text-blue-600"
          >
            <UIcon name="i-heroicons-users" class="w-4 h-4 mr-2 inline" />
            Members
          </NuxtLink>

          <NuxtLink
            :to="routes.workspaceSettings(workspace!)"
            class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            active-class="border-blue-500 text-blue-600"
          >
            <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-2 inline" />
            Settings
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Boards Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Boards</h2>
        <UButton v-if="canCreateBoard" color="blue" @click="handleCreateBoard">
          <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
          Create Board
        </UButton>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <!-- Existing Boards -->
        <BoardCard
          v-for="board in workspaceBoards"
          :key="board.id"
          :board="board"
          @click="navigateToBoard"
        />

        <!-- Create New Board Card -->
        <div
          v-if="canCreateBoard"
          class="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors group"
          @click="handleCreateBoard"
        >
          <div class="text-center">
            <UIcon
              name="i-heroicons-plus"
              class="w-6 h-6 text-gray-400 group-hover:text-gray-600 mx-auto mb-1"
            />
            <p class="text-sm text-gray-600 group-hover:text-gray-800">
              Create new board
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Workspace } from "~/types";
import { parseWorkspaceSlug, routes } from "~/utils/routes";
import { defaultKanbanData } from "~/utils/defaultData";

// Use the app layout
definePageMeta({
  layout: "home",
});

// Get route params
const route = useRoute();
const workspaceSlug = route.params.workspaceSlug as string;

// Parse workspace info from slug
const { id: workspaceId } = parseWorkspaceSlug(workspaceSlug);

// Data
const data = ref(defaultKanbanData);
const currentUser = ref({ id: 1, email: "demo@example.com" });

// Find workspace
const workspace = computed(() => {
  return data.value.workspaces.find((w) => w.id === workspaceId);
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
  if (!workspace.value) return false;

  // User owns workspace
  if (workspace.value.ownerId === currentUser.value.id) return true;

  // User is member of workspace
  return data.value.workspaceMembers.some(
    (member) =>
      member.workspaceId === workspaceId &&
      member.userId === currentUser.value.id
  );
});

if (!hasAccess.value) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied",
  });
}

// Get workspace boards
const workspaceBoards = computed(() => {
  return data.value.boards.filter((board) => board.workspaceId === workspaceId);
});

// Check if user can create boards
const canCreateBoard = computed(() => {
  if (!workspace.value) return false;

  // Owner can create boards
  if (workspace.value.ownerId === currentUser.value.id) return true;

  // Check member permissions
  const member = data.value.workspaceMembers.find(
    (m) => m.workspaceId === workspaceId && m.userId === currentUser.value.id
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

const navigateToBoard = (boardId: number) => {
  navigateTo(routes.board(boardId));
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
