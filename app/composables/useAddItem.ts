export const useAddItem = () => {
  const isAdding = ref(false);
  const newItemTitle = ref("");
  const inputRef = ref<HTMLTextAreaElement>();

  const startAdding = () => {
    isAdding.value = true;
    nextTick(() => {
      inputRef.value?.focus();
    });
  };

  const cancel = () => {
    isAdding.value = false;
    newItemTitle.value = "";
  };

  const handleEnterKey = (event: KeyboardEvent, onSubmit: () => void) => {
    if (!event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return {
    isAdding,
    newItemTitle,
    inputRef,
    startAdding,
    cancel,
    handleEnterKey,
  };
};
