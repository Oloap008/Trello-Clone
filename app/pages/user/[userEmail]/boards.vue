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
        />
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
            class="text-sm text-blue-600 hover:text-blue-800 underline"
            @click="showClosedBoards"
          >
            View all closed boards
          </button>
        </div>
      </section>
    </div>

    <!-- Closed Boards Modal -->
    <ClosedBoardsModal
      :is-visible="showClosedBoardsModal"
      :closed-boards="closedBoards"
      :workspaces="workspaces"
      @close="showClosedBoardsModal = false"
      @reopen="handleReopenBoard"
      @delete="handleDeleteBoard"
    />
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
  const boards = dataStore.getBoardsForWorkspace(workspaceId);
  console.log(`Boards for workspace ${workspaceId}:`, boards.length);
  return boards;
};

const canCreateBoardInWorkspace = (workspaceId: number) => {
  if (!currentUser.value || !dataStore.isLoaded) return false;

  const userId = parseInt(currentUser.value.id);
  const workspace = dataStore.getById("workspaces", workspaceId);

  // Owner can create boards
  if (workspace?.ownerId === userId) return true;

  // Check workspace member permissions with proper null checking
  const workspaceMembers = dataStore.workspaceMembers?.value || [];
  const member = workspaceMembers.find(
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

// State for the modal
const showClosedBoardsModal = ref(false);

// Get closed boards from your store/data
const closedBoards = computed(() => {
  if (!dataStore.isLoaded || !authStore.user?.id) return [];

  const userId = parseInt(authStore.user.id);

  // FIXED: Remove .value since these are already computed properties
  const allBoards = dataStore.boards || [];
  const allBoardMembers = dataStore.boardMembers || [];

  console.log("=== CLOSED BOARDS DEBUG ===");
  console.log("User ID:", userId);
  console.log("Total boards:", allBoards.length);
  console.log("Total board members:", allBoardMembers.length);

  // Debug: Log all boards and their statuses
  console.log("=== ALL BOARDS DEBUG ===");
  allBoards.forEach((board) => {
    console.log(
      `Board ID: ${board.id}, Name: "${board.name}", Status: "${board.status}", WorkspaceId: ${board.workspaceId}`
    );
  });
  console.log("=== END BOARDS DEBUG ===");

  const result = allBoards.filter((board) => {
    if (board.status !== "not_active") return false;

    const membership = allBoardMembers.find(
      (member) => member.boardId === board.id && member.userId === userId
    );
    return !!membership;
  });

  console.log("Closed boards found:", result.length);
  return result;
});

// Get workspaces from your store/data
const workspaces = computed(() => {
  if (!dataStore.isLoaded || !authStore.user?.id) return [];

  const userId = parseInt(authStore.user.id);
  return dataStore.getWorkspacesForUser(userId);
});

// Function to show the closed boards modal
const showClosedBoards = () => {
  showClosedBoardsModal.value = true;
};

// Function to handle reopening a board
const handleReopenBoard = async (boardId, workspaceId) => {
  try {
    console.log(`Reopening board ${boardId} to workspace ${workspaceId}`);

    // Update the board with new workspace and active status
    const updates = {
      status: "active",
      workspaceId: workspaceId === "personal" ? null : parseInt(workspaceId),
    };

    console.log("Updates object:", updates);

    const reopenedBoard = dataStore.update("boards", boardId, updates);

    const toast = useToast();
    toast.add({
      title: "Board reopened successfully",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    console.log(`Board "${reopenedBoard.name}" has been reopened`);
  } catch (error) {
    console.error("Error reopening board:", error);

    const toast = useToast();
    toast.add({
      title: "Failed to reopen board",
      description: "Please try again",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  }
};

// Function to handle permanently deleting a board
const handleDeleteBoard = async (boardId: number) => {
  try {
    console.log(`Deleting board ${boardId}`);

    // Get the board name for confirmation
    const board = dataStore.getById("boards", boardId);
    const boardName = board?.name || "this board";

    // Get all related data that needs to be deleted
    const boardCards = dataStore.cards.filter(
      (card) => card.boardId === boardId
    );
    const boardLists = dataStore.lists.filter(
      (list) => list.boardId === boardId
    );
    const boardCardIds = boardCards.map((card) => card.id);
    const boardActivities = dataStore.cardActivities.filter((activity) =>
      boardCardIds.includes(activity.cardId)
    );
    const boardMembersToDelete = dataStore.boardMembers.filter(
      (member) => member.boardId === boardId
    );

    // Delete all card activities first
    boardActivities.forEach((activity) => {
      dataStore.hardDelete("cardActivities", activity.id);
    });

    // Delete all cards
    boardCards.forEach((card) => {
      dataStore.hardDelete("cards", card.id);
    });

    // Delete all lists
    boardLists.forEach((list) => {
      dataStore.hardDelete("lists", list.id);
    });

    // Delete board members
    boardMembersToDelete.forEach((member) => {
      dataStore.hardDelete("boardMembers", member.id);
    });

    // Finally delete the board itself
    dataStore.hardDelete("boards", boardId);

    // Show success message
    const toast = useToast();
    toast.add({
      title: "Board deleted permanently",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    console.log(`Board "${boardName}" has been permanently deleted`);
  } catch (error) {
    console.error("Error deleting board:", error);

    const toast = useToast();
    toast.add({
      title: "Failed to delete board",
      description: "Please try again",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  }
};

// Function to close a board (make it appear in closed boards)
const handleCloseBoard = async (boardId: number) => {
  try {
    console.log("Close board handler called for board:", boardId);

    // Update the board status to not_active using dataStore
    const closedBoard = dataStore.update("boards", boardId, {
      status: "not_active",
    });

    // Show success message
    const toast = useToast();
    toast.add({
      title: "Board closed successfully",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    // Navigate to boards page
    if (authStore.user?.email) {
      await navigateTo(`/user/${authStore.user.email}/boards`);
    } else {
      await navigateTo("/boards");
    }
  } catch (error) {
    console.error("Error closing board:", error);

    const toast = useToast();
    toast.add({
      title: "Failed to close board",
      description: "Please try again",
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  }
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
