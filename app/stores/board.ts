export const useBoardStore = defineStore("board", () => {
  const dataStore = useDataStore();
  const authStore = useAuthStore();

  // State
  const currentBoardId = ref<number | null>(null);
  const selectedCard = ref<Card | null>(null);
  const selectedCardListId = ref<number | null>(null);
  const isModalOpen = ref(false);
  const isEditingCardTitle = ref(false);

  // Computed properties
  const currentBoard = computed(() => {
    if (!currentBoardId.value) return null;
    return dataStore.getById("boards", currentBoardId.value);
  });

  const currentUser = computed(() => authStore.user);

  const canEditBoard = computed(() => {
    if (!currentUser.value || !currentBoardId.value) return false;
    return dataStore.canUserEditBoard(
      parseInt(currentUser.value.id),
      currentBoardId.value
    );
  });

  const currentBoardLists = computed(() => {
    if (!currentBoardId.value) return [];
    return dataStore.getListsForBoard(currentBoardId.value);
  });

  // Helper functions
  const requireEditPermission = () => {
    if (!canEditBoard.value) {
      console.warn("User does not have edit permissions for this board");
      return false;
    }
    return true;
  };

  const requireBoardAndUser = () => {
    return currentBoardId.value && currentUser.value;
  };

  const getNextPosition = (items: { position: number }[]) => {
    return items.length > 0
      ? Math.max(...items.map((item) => item.position)) + 1
      : 1;
  };

  const logActivity = (cardId: number, action: string, description: string) => {
    if (currentUser.value) {
      dataStore.logCardActivity(
        cardId,
        parseInt(currentUser.value.id),
        action as CardActivity["type"],
        description
      );
    }
  };

  const updateSelectedCard = (cardId: number, updates: Partial<Card>) => {
    if (selectedCard.value && selectedCard.value.id === cardId) {
      Object.assign(selectedCard.value, updates);
    }
  };

  // Board operations
  const setBoardId = (boardId: number) => {
    currentBoardId.value = boardId;
    closeCardModal(); // Reset modal state
  };

  // List operations
  const createList = (name: string) => {
    if (!requireBoardAndUser() || !requireEditPermission()) return null;

    const position = getNextPosition(currentBoardLists.value);
    return dataStore.create("lists", {
      boardId: currentBoardId.value!,
      name: name.trim(),
      position,
      status: "active",
    });
  };

  const updateList = (
    listId: number,
    updates: { name?: string; position?: number }
  ) => {
    if (!requireEditPermission()) return null;
    return dataStore.update("lists", listId, updates);
  };

  const deleteList = (listId: number) => {
    if (!requireEditPermission()) return null;

    // Delete all cards in the list first
    const cardsInList = dataStore.getCardsForList(listId);
    cardsInList.forEach((card) => dataStore.remove("cards", card.id));

    return dataStore.remove("lists", listId);
  };

  const reorderList = (sourceListId: number, targetListId: number) => {
    if (!requireEditPermission()) return null;

    const lists = currentBoardLists.value;
    const sourceList = lists.find((l) => l.id === sourceListId);
    const targetList = lists.find((l) => l.id === targetListId);

    if (!sourceList || !targetList) return null;

    // Swap positions
    const tempPosition = sourceList.position;
    updateList(sourceList.id, { position: targetList.position });
    updateList(targetList.id, { position: tempPosition });

    return sourceList;
  };

  // Card operations
  const createCard = (listId: number, title: string, description?: string) => {
    if (!requireBoardAndUser() || !requireEditPermission()) return null;

    const cardsInList = dataStore.getCardsForList(listId);
    const position = getNextPosition(cardsInList);

    const newCard = dataStore.create("cards", {
      listId,
      boardId: currentBoardId.value!,
      title: title.trim(),
      description: description || "",
      position,
      isComplete: false,
      createdById: parseInt(currentUser.value!.id),
      status: "active",
    });

    logActivity(newCard.id, "create", `Created card "${title}"`);
    return newCard;
  };

  const updateCard = (cardId: number, updates: Partial<Card>) => {
    if (!requireEditPermission()) return null;

    const updatedCard = dataStore.update("cards", cardId, updates);
    updateSelectedCard(cardId, updatedCard);

    if (updates.title) {
      logActivity(cardId, "update", `Updated card title to "${updates.title}"`);
    }

    return updatedCard;
  };

  const moveCard = (
    cardId: number,
    newListId: number,
    newPosition?: number
  ) => {
    if (!requireEditPermission()) return null;

    const card = dataStore.getById("cards", cardId);
    if (!card) return null;

    const oldListId = card.listId;
    const cardsInNewList = dataStore.getCardsForList(newListId);

    let position: number;
    if (newPosition !== undefined && newPosition >= 0) {
      position = newPosition;
      // Adjust positions of other cards
      cardsInNewList.forEach((c) => {
        if (c.position >= position && c.id !== cardId) {
          dataStore.update("cards", c.id, { position: c.position + 1 });
        }
      });
    } else {
      position = getNextPosition(cardsInNewList);
    }

    const updatedCard = dataStore.update("cards", cardId, {
      listId: newListId,
      position,
    });

    // Log activity if moved to different list
    if (oldListId !== newListId) {
      const oldList = dataStore.getById("lists", oldListId);
      const newList = dataStore.getById("lists", newListId);
      logActivity(
        cardId,
        "move",
        `Moved card from "${oldList?.name}" to "${newList?.name}"`
      );
    }

    return updatedCard;
  };

  const toggleCardComplete = (cardId: number) => {
    const card = dataStore.getById("cards", cardId);
    if (!card || !requireEditPermission()) return null;

    const updatedCard = dataStore.update("cards", cardId, {
      isComplete: !card.isComplete,
    });

    updateSelectedCard(cardId, { isComplete: updatedCard.isComplete });

    const status = updatedCard.isComplete ? "completed" : "reopened";
    logActivity(cardId, "update", `Card ${status}`);

    return updatedCard;
  };

  const deleteCard = (cardId: number) => {
    if (!requireEditPermission()) return null;

    // Log activity before deletion
    const card = dataStore.getById("cards", cardId);
    if (card) {
      logActivity(cardId, "delete", `Deleted card "${card.title}"`);
    }

    return dataStore.remove("cards", cardId);
  };

  // Modal operations
  const openCardModal = (card: KanbanCard) => {
    const cardId = typeof card.id === "string" ? parseInt(card.id) : card.id;
    const dbCard = dataStore.getById("cards", cardId);

    if (dbCard) {
      selectedCard.value = { ...dbCard };
      selectedCardListId.value = dbCard.listId;
      isModalOpen.value = true;
      isEditingCardTitle.value = false;
    }
  };

  const closeCardModal = () => {
    isModalOpen.value = false;
    selectedCard.value = null;
    selectedCardListId.value = null;
    isEditingCardTitle.value = false;
  };

  const getCurrentListTitle = () => {
    if (!selectedCardListId.value) return "Unknown List";
    const list = dataStore.getById("lists", selectedCardListId.value);
    return list?.name || "Unknown List";
  };

  const startEditingCardTitle = () => {
    if (selectedCard.value) {
      isEditingCardTitle.value = true;
    }
  };

  const saveCardTitle = () => {
    if (selectedCard.value?.title?.trim()) {
      updateCard(selectedCard.value.id, {
        title: selectedCard.value.title.trim(),
      });
      isEditingCardTitle.value = false;
    }
  };

  const cancelCardTitleEdit = () => {
    if (selectedCard.value && selectedCardListId.value) {
      const originalCard = dataStore.getById("cards", selectedCard.value.id);
      if (originalCard) {
        selectedCard.value.title = originalCard.title;
      }
    }
    isEditingCardTitle.value = false;
  };

  // Activity operations
  const getCardActivities = (cardId: number) => {
    if (!dataStore.cardActivities?.value) return [];

    return dataStore.cardActivities.value
      .filter((activity) => activity.cardId === cardId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  };

  // Archive operations
  const archiveCard = (cardId: number) => {
    if (!requireEditPermission()) return null;

    const card = dataStore.getById("cards", cardId);
    if (!card) return null;

    console.log("Before archive - card status:", card.status); // Debug log

    // Update card status to archived (not_active)
    const archivedCard = dataStore.update("cards", cardId, {
      status: "not_active",
    });

    console.log("After archive - card status:", archivedCard.status); // Debug log

    // Update the selected card if it's currently open in modal
    updateSelectedCard(cardId, { status: "not_active" });

    // Log activity
    logActivity(cardId, "update", `Archived card "${card.title}"`);

    return archivedCard;
  };

  const restoreCard = (cardId: number) => {
    if (!requireEditPermission()) return null;

    const card = dataStore.getById("cards", cardId);
    if (!card) return null;

    // Update card status to active
    const restoredCard = dataStore.update("cards", cardId, {
      status: "active",
    });

    // Update the selected card if it's currently open in modal
    updateSelectedCard(cardId, { status: "active" });

    // Log activity
    logActivity(cardId, "update", `Restored card "${card.title}"`);

    return restoredCard;
  };

  const archiveList = (listId: number, archiveCards = true) => {
    if (!requireEditPermission()) return null;

    const list = dataStore.getById("lists", listId);
    if (!list) return null;

    // Archive the list
    const archivedList = dataStore.update("lists", listId, {
      status: "not_active",
    });

    // Optionally archive all cards in the list
    if (archiveCards) {
      const cardsInList = dataStore.getCardsForList(listId);
      cardsInList.forEach((card) => {
        dataStore.update("cards", card.id, { status: "not_active" });
        logActivity(
          card.id,
          "update",
          `Archived card "${card.title}" (list archived)`
        );
      });
    }

    return archivedList;
  };

  const restoreList = (listId: number, restoreCards = false) => {
    if (!requireEditPermission()) return null;

    const list = dataStore.getById("lists", listId);
    if (!list) return null;

    // Restore the list
    const restoredList = dataStore.update("lists", listId, {
      status: "active",
    });

    // Optionally restore all cards in the list
    if (restoreCards) {
      const allCards = dataStore.cards.value;
      const cardsInList = allCards.filter((card) => card.listId === listId);

      cardsInList.forEach((card) => {
        dataStore.update("cards", card.id, { status: "active" });
        logActivity(
          card.id,
          "update",
          `Restored card "${card.title}" (list restored)`
        );
      });
    }

    return restoredList;
  };

  // Get archived items for a board
  const getArchivedCards = (boardId: number) => {
    // Use dataStore.cards directly instead of dataStore.cards.value
    const cards = dataStore.cards || [];
    console.log("Direct cards access:", cards);

    return cards.filter(
      (card) => card.boardId === boardId && card.status === "not_active"
    );
  };

  const getArchivedLists = (boardId: number) => {
    // Use dataStore.lists directly instead of dataStore.lists.value
    const lists = dataStore.lists || [];
    console.log("Direct lists access:", lists);

    return lists.filter(
      (list) => list.boardId === boardId && list.status === "not_active"
    );
  };

  const closeBoard = (boardId: number) => {
    if (!requireEditPermission()) return null;

    return dataStore.update("boards", boardId, {
      status: "not_active",
    });
  };

  return {
    // State
    currentBoardId: readonly(currentBoardId),
    selectedCard: readonly(selectedCard),
    selectedCardListId: readonly(selectedCardListId),
    isModalOpen: readonly(isModalOpen),
    isEditingCardTitle: readonly(isEditingCardTitle),

    // Computed
    currentBoard,
    canEditBoard,
    currentBoardLists,

    // Board operations
    setBoardId,
    closeBoard,

    // List operations
    createList,
    updateList,
    deleteList,
    reorderList,

    // Card operations
    createCard,
    updateCard,
    moveCard,
    toggleCardComplete,
    deleteCard,

    // Modal operations
    openCardModal,
    closeCardModal,
    getCurrentListTitle,
    startEditingCardTitle,
    saveCardTitle,
    cancelCardTitleEdit,

    // Activity operations
    getCardActivities,

    // Archive operations
    archiveCard,
    restoreCard,
    archiveList,
    restoreList,
    getArchivedCards,
    getArchivedLists,
  };
});
