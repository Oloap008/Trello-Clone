export const useFilterStore = defineStore("filter", () => {
  // Filter state
  const activeFilters = ref({
    keyword: "",
    noMembers: false,
    assignedToMe: false,
    members: [],
    cardStatus: "",
    activity: "",
  });

  // Computed property to check if any filters are active
  const isFilterActive = computed(() => {
    return (
      activeFilters.value.keyword.trim() !== "" ||
      activeFilters.value.noMembers ||
      activeFilters.value.assignedToMe ||
      activeFilters.value.members.length > 0 ||
      activeFilters.value.cardStatus !== "" ||
      activeFilters.value.activity !== ""
    );
  });

  // Actions
  const updateFilters = (filters) => {
    console.log("🏪 FilterStore: Updating filters:", filters);
    activeFilters.value = { ...filters };
  };

  const clearFilters = () => {
    console.log("🏪 FilterStore: Clearing filters");
    activeFilters.value = {
      keyword: "",
      noMembers: false,
      assignedToMe: false,
      members: [],
      cardStatus: "",
      activity: "",
    };
  };

  return {
    // State (readonly to prevent direct mutation)
    activeFilters: readonly(activeFilters),

    // Computed
    isFilterActive,

    // Actions
    updateFilters,
    clearFilters,
  };
});
