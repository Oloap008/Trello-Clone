<template>
  <UDropdownMenu :items="userMenuItems">
    <UAvatar
      :alt="userInitials"
      :text="userInitials"
      size="sm"
      class="cursor-pointer"
    />
  </UDropdownMenu>
</template>

<script setup>
import { computed } from "vue";

const emit = defineEmits(["logout", "create"]);
const authStore = useAuthStore();

// Get user initials from the logged-in user's name
const userInitials = computed(() => {
  if (!authStore.user?.name) return "U"; // Default fallback

  const names = authStore.user.name.trim().split(" ");
  if (names.length === 1) {
    // Single name - take first letter
    return names[0].charAt(0).toUpperCase();
  } else {
    // Multiple names - take first letter of first and last name
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  }
});

const userMenuItems = computed(() => [
  [
    {
      label: "Create Workspace",
      icon: "i-heroicons-building-office-2",
      onSelect: () => emit("create"),
    },
  ],
  [
    {
      label: "Log out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      onSelect: () => emit("logout"),
    },
  ],
]);
</script>
