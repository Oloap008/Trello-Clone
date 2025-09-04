import type { TableName, TableRecord } from "~~/shared/types/globals";

export const useDataStore = defineStore("data", () => {
  // Using store-compatible localStorage composable
  const { value: data, isLoaded } = useLocalStorage(
    "kanban_data",
    defaultKanbanData
  );

  // Rest of your store stays exactly the same...
  // Computed getters for easy access
  const users = computed(() => data.value.users);
  const workspaces = computed(() => data.value.workspaces);
  const workspaceMembers = computed(() => data.value.workspaceMembers);
  const boards = computed(() => data.value.boards);
  const boardMembers = computed(() => data.value.boardMembers);
  const lists = computed(() => data.value.lists);
  const cards = computed(() => data.value.cards);
  const cardLabels = computed(() => data.value.cardLabels);
  const cardComments = computed(() => data.value.cardComments);
  const cardActivities = computed(() => data.value.cardActivities);

  // Helper functions
  const getNextId = (tableName: TableName): number => {
    const items = data.value[tableName];
    return items.length > 0
      ? Math.max(...items.map((item: any) => item.id)) + 1
      : 1;
  };

  const findItemIndex = (tableName: TableName, id: number): number => {
    return data.value[tableName].findIndex((item: any) => item.id === id);
  };

  const createTimestamps = () => {
    const now = new Date().toISOString();
    return { createdAt: now, updatedAt: now };
  };

  // CRUD Operations
  const create = <T extends TableName>(
    tableName: T,
    item: Omit<TableRecord<T>, "id" | "createdAt" | "updatedAt">
  ): TableRecord<T> => {
    const newItem = {
      ...item,
      id: getNextId(tableName),
      ...createTimestamps(),
      status: (item as any).status || "active",
    } as TableRecord<T>;

    (data.value[tableName] as any[]).push(newItem);
    return newItem;
  };

  const getAll = <T extends TableName>(tableName: T): TableRecord<T>[] => {
    return data.value[tableName] as TableRecord<T>[];
  };

  const getById = <T extends TableName>(
    tableName: T,
    id: number
  ): TableRecord<T> | null => {
    return (
      (data.value[tableName] as any[]).find((item) => item.id === id) || null
    );
  };

  const update = <T extends TableName>(
    tableName: T,
    id: number,
    updates: Partial<TableRecord<T>>
  ): TableRecord<T> => {
    const index = findItemIndex(tableName, id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${tableName}`);
    }

    const updatedItem = {
      ...(data.value[tableName][index] as any),
      ...updates,
      updatedAt: new Date().toISOString(),
    } as TableRecord<T>;

    (data.value[tableName] as any[])[index] = updatedItem;
    return updatedItem;
  };

  const remove = <T extends TableName>(
    tableName: T,
    id: number
  ): TableRecord<T> => {
    const index = findItemIndex(tableName, id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${tableName}`);
    }

    return update(tableName, id, {
      status: "not_active",
    } as Partial<TableRecord<T>>);
  };

  // Generic membership helpers
  const getMembership = (
    membersArray: any[],
    userIdKey: string,
    entityIdKey: string,
    userId: number,
    entityId: number
  ) => {
    return membersArray.find(
      (member) =>
        member[userIdKey] === userId && member[entityIdKey] === entityId
    );
  };

  const getUserEntitiesFromMembership = <T>(
    membersArray: any[],
    entitiesArray: T[],
    userIdKey: string,
    entityIdKey: string,
    userId: number,
    statusFilter = true
  ): T[] => {
    return membersArray
      .filter((member) => member[userIdKey] === userId)
      .map((member) =>
        entitiesArray.find((entity: any) => entity.id === member[entityIdKey])
      )
      .filter(Boolean)
      .filter(
        (entity: any) => !statusFilter || entity.status === "active"
      ) as T[];
  };

  // Board-specific helpers
  const getBoardsForUser = (userId: number): Board[] => {
    return getUserEntitiesFromMembership(
      boardMembers.value,
      boards.value,
      "userId",
      "boardId",
      userId
    );
  };

  const getBoardMembers = (boardId: number) => {
    return boardMembers.value
      .filter((member) => member.boardId === boardId)
      .map((member) => ({
        ...member,
        user: getById("users", member.userId),
      }));
  };

  const canUserEditBoard = (userId: number, boardId: number): boolean => {
    const membership = getMembership(
      boardMembers.value,
      "userId",
      "boardId",
      userId,
      boardId
    );
    return membership ? membership.canEdit : false;
  };

  const isUserBoardOwner = (userId: number, boardId: number): boolean => {
    const membership = getMembership(
      boardMembers.value,
      "userId",
      "boardId",
      userId,
      boardId
    );
    return membership ? membership.role === "owner" : false;
  };

  // Workspace-specific helpers
  // Fixed method for your data store
  const getWorkspacesForUser = (userId: number) => {
    // Convert userId to number if it's a string (for auth store compatibility)
    const numericUserId =
      typeof userId === "string" ? parseInt(userId) : userId;

    return workspaces.value.filter((workspace) => {
      // Only include active workspaces
      if (workspace.status !== "active") return false;

      // Include if user is the owner
      if (workspace.ownerId === numericUserId) return true;

      // Include if user is a member
      return workspaceMembers.value.some(
        (member) =>
          member.workspaceId === workspace.id && member.userId === numericUserId
      );
    });
  };

  const getWorkspaceMembers = (workspaceId: number) => {
    return workspaceMembers.value
      .filter(
        (member) =>
          member.workspaceId === workspaceId && member.status === "active" // 👈 Add this line
      )
      .map((member) => ({
        ...member,
        user: getById("users", member.userId),
      }));
  };

  const getBoardsForWorkspace = (workspaceId: number) => {
    return boards.value.filter(
      (board) => board.workspaceId === workspaceId && board.status === "active"
    );
  };

  // Generic filtered and sorted collection helpers
  const getActiveItemsForParent = <T extends { status: string }>(
    items: T[],
    parentIdKey: keyof T,
    parentId: number,
    sortKey?: keyof T
  ): T[] => {
    const filtered = items.filter(
      (item) => item[parentIdKey] === parentId && item.status === "active"
    );

    return sortKey
      ? filtered.sort((a, b) => (a[sortKey] as number) - (b[sortKey] as number))
      : filtered;
  };

  // List helpers for specific board
  const getListsForBoard = (boardId: number) => {
    return getActiveItemsForParent(lists.value, "boardId", boardId, "position");
  };

  // Card helpers for specific board/list
  const getCardsForList = (listId: number) => {
    return getActiveItemsForParent(cards.value, "listId", listId, "position");
  };

  // Kanban structure for a specific board
  const getBoardKanbanData = (boardId: number): KanbanList[] => {
    const boardLists = getListsForBoard(boardId);

    return boardLists.map((list) => ({
      id: list.id.toString(),
      title: list.name,
      cards: getCardsForList(list.id).map((card) => ({
        id: card.id.toString(),
        title: card.title,
        isComplete: card.isComplete,
        description: card.description || "",
      })),
    }));
  };

  // Activity logging
  const logCardActivity = (
    cardId: number,
    userId: number,
    type: CardActivity["type"],
    description: string
  ) => {
    create("cardActivities", {
      cardId,
      userId,
      type,
      description,
    });
  };

  // Utility functions
  const getStorageInfo = () => {
    const dataString = JSON.stringify(data.value);
    const sizeInBytes = new Blob([dataString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

    return {
      sizeInBytes,
      sizeInKB: `${sizeInKB} KB`,
      sizeInMB: `${sizeInMB} MB`,
    };
  };

  const resetData = () => {
    data.value = { ...defaultKanbanData };
  };

  const exportData = (): string => {
    return JSON.stringify(data.value, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsedData = JSON.parse(jsonData) as DatabaseSchema;
      data.value = parsedData;
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  };

  const hardDelete = <T extends TableName>(
    tableName: T,
    id: number
  ): boolean => {
    const index = findItemIndex(tableName, id);
    if (index === -1) {
      return false;
    }

    (data.value[tableName] as any[]).splice(index, 1);
    return true;
  };

  return {
    // Raw data (reactive)
    data,
    isLoaded,

    // Computed getters
    users,
    workspaces,
    workspaceMembers,
    boards,
    boardMembers,
    lists,
    cards,
    cardLabels,
    cardComments,
    cardActivities,

    // CRUD operations
    create,
    getAll,
    getById,
    update,
    remove,
    hardDelete,

    // Board-specific helpers
    getBoardsForUser,
    getBoardMembers,
    canUserEditBoard,
    isUserBoardOwner,
    getListsForBoard,
    getCardsForList,
    getBoardKanbanData,
    logCardActivity,

    // Workspace-specific helpers
    getWorkspacesForUser,
    getWorkspaceMembers,
    getBoardsForWorkspace,

    // Utility functions
    getStorageInfo,
    resetData,
    exportData,
    importData,
  };
});
