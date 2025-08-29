export const useModal = () => {
  const isOpen = ref(false);
  const selectedItem = ref<any | null>(null);

  const open = (item: any) => {
    selectedItem.value = item;
    isOpen.value = true;
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    isOpen.value = false;
    selectedItem.value = null;
    document.body.style.overflow = "auto";
  };

  return {
    isOpen,
    selectedItem,
    open,
    close,
  };
};
