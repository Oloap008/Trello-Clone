<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <AppLogo />

      <div class="flex items-center space-x-4">
        <AppSearchBar />
        <HeaderActions @logout="$emit('logout')" @create="$emit('create')" />
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(["create", "logout"]);
</script>
