<template>
  <NuxtLink
    :to="to"
    class="flex items-center px-3 py-1.5 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-300 rounded transition"
  >
    <UIcon :name="icon" class="w-4 h-4 mr-1.5" />
    {{ label }}
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  to: string;
  icon: string;
  label: string;
  variant?: "default" | "active";
}

withDefaults(defineProps<Props>(), {
  variant: "default",
});
</script>
