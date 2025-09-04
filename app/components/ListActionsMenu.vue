<template>
  <div class="relative">
    <UButton
      variant="ghost"
      size="xs"
      icon="i-heroicons-ellipsis-horizontal"
      class="text-gray-600 hover:bg-gray-300"
      @click="toggleMenu"
    />

    <!-- Menu Dropdown -->
    <div
      v-if="isOpen"
      ref="menuRef"
      class="absolute top-8 right-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
      @click.stop
    >
      <!-- Archive this list -->
      <button
        @click="$emit('archive-list', listId)"
        class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
      >
        <UIcon
          name="i-heroicons-inbox-arrow-down"
          class="w-4 h-4 mr-3 text-gray-500"
        />
        Archive this list
      </button>

      <!-- Archive all cards in this list -->
      <button
        @click="$emit('archive-all-cards', listId)"
        class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
      >
        <UIcon
          name="i-heroicons-inbox-stack"
          class="w-4 h-4 mr-3 text-gray-500"
        />
        Archive all cards in this list
      </button>
    </div>

    <!-- Backdrop to close menu -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="closeMenu"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  listId: number;
}

defineProps<Props>();

defineEmits<{
  "archive-list": [listId: number];
  "archive-all-cards": [listId: number];
}>();

const isOpen = ref(false);
const menuRef = ref<HTMLElement>();

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

// Close menu when clicking outside
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    if (
      isOpen.value &&
      menuRef.value &&
      !menuRef.value.contains(event.target as Node)
    ) {
      closeMenu();
    }
  };

  document.addEventListener("click", handleClickOutside);

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
});
</script>
