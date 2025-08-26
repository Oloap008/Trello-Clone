<template>
  <div>
    <UButton
      class="block md:hidden mr-2"
      variant="ghost"
      size="sm"
      square
      @click="isOpen = true"
    >
      <UIcon name="i-heroicons-bars-3" class="h-4 w-4" />
    </UButton>

    <USlideover v-model="isOpen" side="left">
      <div class="p-4 pt-10">
        <AppSidebar storage-key="t-sidebar-mobile-state" />
      </div>
    </USlideover>
  </div>
</template>

<script setup>
const route = useRoute();
const isOpen = ref(false);

// Close sidebar when route changes
watch(
  () => route.path,
  () => {
    isOpen.value = false;
  }
);
</script>
