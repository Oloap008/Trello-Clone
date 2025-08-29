export const useEditableTitle = () => {
  const editingId = ref<number | null>(null);
  const editingTitle = ref("");
  const inputRefs = ref<Record<string, HTMLInputElement | null>>({});

  const startEditing = (id: number, currentTitle: string) => {
    editingId.value = id;
    editingTitle.value = currentTitle;
    nextTick(() => {
      const input = inputRefs.value[id.toString()];
      if (input) {
        input.focus();
        input.select();
      }
    });
  };

  const cancelEdit = () => {
    editingId.value = null;
    editingTitle.value = "";
  };

  const setInputRef = (el: HTMLInputElement | null, id: string) => {
    inputRefs.value[id] = el;
  };

  return {
    editingId,
    editingTitle,
    inputRefs,
    startEditing,
    cancelEdit,
    setInputRef,
  };
};
