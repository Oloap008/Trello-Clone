<template>
  <div class="min-h-screen flex flex-col overflow-x-hidden">
    <AppHeader @create="openCreateModal" @logout="handleLogout" />

    <!-- Board Header - only show on board pages -->
    <BoardHeader
      v-if="showBoardHeader"
      :board="currentBoard"
      :board-members="boardMembers"
      :current-user-id="currentUserId"
      :is-filter-active="isFilterActive"
      @show-archive="handleShowArchive"
      @update-board-name="handleUpdateBoardName"
      @update-board-visibility="handleUpdateBoardVisibility"
      @invite-members="handleInviteMembers"
      @toggle-filter="handleToggleFilter"
      @filter-change="handleFilterChange"
      @export-board="handleExportBoard"
      @close-board="handleCloseBoard"
      @go-to-boards="handleGoToBoards"
    />

    <!-- Common container for sidebar and main content -->
    <div class="flex-1 flex overflow-x-hidden">
      <!-- Sidebar and Main Content Wrapper -->
      <div class="flex w-full overflow-x-hidden">
        <AppSidebar v-if="showSidebar" class="flex-shrink-0" />

        <!-- Main content - conditional overflow behavior -->
        <main
          class="flex-1 bg-white"
          :class="{
            'overflow-hidden': isBoardPage,
            'overflow-x-hidden': !isBoardPage,
          }"
        >
          <slot />
        </main>
      </div>
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

// Board detection
const isBoardPage = computed(() => {
  return route.name && route.name.includes("board") && route.params.boardId;
});

// Board header logic
const showBoardHeader = computed(() => {
  return isBoardPage.value;
});

// Board state - you'll need to get this from your stores
const boardStore = useBoardStore();
const dataStore = useDataStore();
const authStore = useAuthStore();
const filterStore = useFilterStore();

const currentBoard = computed(() => {
  if (!route.params.boardId || !dataStore.isLoaded) return null;
  const boardId = parseInt(route.params.boardId);
  return dataStore.getById("boards", boardId) || null;
});

const boardMembers = computed(() => {
  if (!route.params.boardId) return [];
  const boardId = parseInt(route.params.boardId);
  return dataStore.getBoardMembers(boardId);
});

const currentUserId = computed(() => {
  const userId = authStore.user?.id;
  return userId ? parseInt(userId) : 1;
});

const isFilterActive = computed(() => filterStore.isFilterActive);

// Board header event handlers
const handleShowArchive = () => {
  console.log("Layout: Show archive clicked");
  console.log("boardStore:", boardStore);
  console.log("boardStore methods:", Object.keys(boardStore));
  console.log("openArchiveModal exists?", typeof boardStore.openArchiveModal);

  if (boardStore.openArchiveModal) {
    boardStore.openArchiveModal();
  } else {
    console.error("openArchiveModal method not found!");
  }
};

const handleUpdateBoardName = (name) => {
  if (boardStore.updateBoard && route.params.boardId) {
    boardStore.updateBoard(parseInt(route.params.boardId), { name });
  }
};

const handleUpdateBoardVisibility = (isPublic) => {
  if (boardStore.updateBoard && route.params.boardId) {
    boardStore.updateBoard(parseInt(route.params.boardId), { isPublic });
  }
};

const handleInviteMembers = () => {
  console.log("Invite members");
};

const handleToggleFilter = () => {
  console.log("Filter toggled");
};

const handleFilterChange = (filters) => {
  console.log("📡 Layout: Filter changed:", filters);
  filterStore.updateFilters(filters); // Use the store instead of just logging
};

const handleExportBoard = () => {
  console.log("Export board");
};

const handleCloseBoard = async () => {
  if (!route.params.boardId) return;

  const boardId = parseInt(route.params.boardId);
  const navigationUrl = authStore.user?.email
    ? `/user/${encodeURIComponent(authStore.user.email)}/boards`
    : "/boards";

  // Update the board status
  dataStore.update("boards", boardId, { status: "not_active" });

  // Navigate away
  await navigateTo(navigationUrl, { replace: true });
};

const handleGoToBoards = () => {
  const authStore = useAuthStore();
  if (authStore.user?.email) {
    navigateTo(`/user/${authStore.user.email}/boards`);
  } else {
    navigateTo("/boards");
  }
};

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
};
</script>
