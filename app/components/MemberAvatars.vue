<template>
  <div v-if="members.length > 0" class="flex items-center gap-1 justify-end">
    <!-- Member Avatars -->
    <div
      v-for="member in displayedMembers"
      :key="member.id"
      class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
      :title="getUserFullName(member)"
    >
      {{ getUserInitials(member) }}
    </div>

    <!-- More members indicator -->
    <div
      v-if="remainingCount > 0"
      class="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
      :title="`+${remainingCount} more`"
    >
      +{{ remainingCount }}
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
  maxDisplay: 3,
  list,
});

// Get storeslist
const dataStore = useDataStore();

// Get member details
const members = computed(() => {
  if (!props.memberIds?.length || !props.boardId) return [];

  return props.memberIds
    .map((userId) => {
      const user = dataStore.getById("users", userId);
      return user;
    })
    .filter(Boolean);
});

// Split members for display
const displayedMembers = computed(() => {
  return members.value.slice(0, props.maxDisplay);
});

const remainingCount = computed(() => {
  return Math.max(0, members.value.length - props.maxDisplay);
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
