export const useDragAndDrop = () => {
  const draggedCard = ref<{ card: any; sourceListId: number } | null>(null);
  const draggedList = ref<List | null>(null);
  const placeholderListId = ref<string | null>(null);
  const placeholderIndex = ref<number | null>(null);
  const closestListId = ref<string | null>(null);

  const resetDragState = () => {
    draggedCard.value = null;
    draggedList.value = null;
    placeholderListId.value = null;
    placeholderIndex.value = null;
    closestListId.value = null;
  };

  const detectClosestListForList = (
    x: number,
    y: number,
    listRefs: Record<string, HTMLElement | null>
  ) => {
    let minDistance = Infinity;
    let closestId: string | null = null;

    for (const [id, el] of Object.entries(listRefs)) {
      if (el && id !== draggedList.value?.id.toString()) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestId = id;
        }
      }
    }

    closestListId.value = closestId;
  };

  const detectClosestListForCard = (
    x: number,
    y: number,
    listRefs: Record<string, HTMLElement | null>
  ) => {
    let minDistance = Infinity;
    let closest: { id: string; element: HTMLElement } | null = null;

    for (const [id, el] of Object.entries(listRefs)) {
      if (el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closest = { id, element: el };
        }
      }
    }
    return closest;
  };

  return {
    draggedCard,
    draggedList,
    placeholderListId,
    placeholderIndex,
    closestListId,
    resetDragState,
    detectClosestListForList,
    detectClosestListForCard,
  };
};
