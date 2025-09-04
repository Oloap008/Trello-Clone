<template>
  <div v-if="assignedMembers.length > 0" class="mb-6">
    <div class="flex items-center gap-3 mb-3">
      <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-gray-600" />
      <h3 class="text-base font-semibold text-gray-800">Members</h3>
    </div>

    <div class="ml-8 flex items-center gap-2">
      <div
        v-for="member in displayedMembers"
        :key="member.id"
        class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
        :title="getUserFullName(member)"
      >
        {{ getUserInitials(member) }}
      </div>

      <!-- More members indicator -->
      <div
        v-if="remainingCount > 0"
        class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
        :title="`+${remainingCount} more`"
      >
        +{{ remainingCount }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  memberIds?: number[];
  boardId?: number;
  maxDisplay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  memberIds: () => [],
  maxDisplay: 4,
});

// Get stores
const dataStore = useDataStore();

// Get assigned members
const assignedMembers = computed(() => {
  if (!props.memberIds?.length) return [];

  return props.memberIds
    .map((userId) => {
      const user = dataStore.getById("users", userId);
      return user;
    })
    .filter(Boolean);
});

// Split members for display
const displayedMembers = computed(() => {
  return assignedMembers.value.slice(0, props.maxDisplay);
});

const remainingCount = computed(() => {
  return Math.max(0, assignedMembers.value.length - props.maxDisplay);
});

// Helper functions
const getUserFullName = (user: any) => {
  if (!user) return "Unknown User";
  return `${user.firstName} ${user.lastName}`;
};

const getUserInitials = (user: any) => {
  if (!user) return "U";
  return `${user.firstName[0]}${user.lastName[0]}`;
};
</script>
