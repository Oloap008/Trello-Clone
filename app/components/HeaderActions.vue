<template>
  <div class="flex items-center space-x-2">
    <UButton variant="ghost" size="sm" square>
      <UIcon name="i-heroicons-bell" />
    </UButton>

    <UButton variant="ghost" size="sm" square>
      <UIcon name="i-heroicons-question-mark-circle" />
    </UButton>

    <UserDropdown @logout="$emit('logout')" @create="$emit('create')" />
  </div>
</template>

<script setup>
defineEmits(["logout", "create"]);
</script>
