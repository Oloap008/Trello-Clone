<template>
  <div class="flex items-center space-x-2">
    <UserDropdown @logout="$emit('logout')" @create="$emit('create')" />
  </div>
</template>

<script setup>
defineEmits(["logout", "create"]);
</script>
