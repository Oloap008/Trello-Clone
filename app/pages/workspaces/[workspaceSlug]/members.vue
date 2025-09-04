<template>
  <div class="p-6">
    <!-- Loading state -->
    <div
      v-if="!dataStore.isLoaded || !authStore.isLoaded"
      class="flex items-center justify-center min-h-[50vh]"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading workspace...</p>
      </div>
    </div>

    <!-- Main content -->
    <div v-else-if="workspace">
      <!-- Workspace Header (reused from home page) -->
      <WorkspaceHeader :workspace="workspace" />

      <!-- Members Section -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Members</h2>
          <UButton
            v-if="canInviteMembers"
            color="blue"
            @click="handleInviteMembers"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
            Invite Members
          </UButton>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              {{ workspaceMembers.length }} member{{
                workspaceMembers.length !== 1 ? "s" : ""
              }}
            </h3>
          </div>

          <div
            v-for="member in workspaceMembers"
            :key="member.id"
            class="px-6 py-4 flex items-center justify-between"
          >
            <div class="flex items-center space-x-4">
              <UAvatar
                :alt="member.user.firstName + ' ' + member.user.lastName"
                size="md"
                :ui="{
                  background: 'bg-gradient-to-r from-blue-500 to-purple-500',
                }"
              >
                {{ getUserInitials(member.user) }}
              </UAvatar>
              <div>
                <h4 class="font-medium text-gray-900">
                  {{ member.user.firstName }} {{ member.user.lastName }}
                  <span
                    v-if="member.userId === currentUser?.id"
                    class="text-sm text-gray-500"
                    >(You)</span
                  >
                  <span
                    v-if="member.userId === workspace?.ownerId"
                    class="text-sm text-blue-600 font-medium"
                    >(Owner)</span
                  >
                </h4>
                <p class="text-sm text-gray-500">{{ member.user.email }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <!-- Role Badge -->
              <UBadge :color="getBadgeColor(member)" variant="subtle">
                {{ getRoleDisplay(member) }}
              </UBadge>

              <!-- Member Actions -->
              <UDropdownMenu
                v-if="canManageMember(member)"
                :items="getMemberActions(member)"
                :ui="{ content: 'w-48' }"
              >
                <UButton variant="ghost" size="sm" square>
                  <UIcon name="i-heroicons-ellipsis-horizontal" />
                </UButton>
              </UDropdownMenu>
            </div>
          </div>
        </div>

        <InviteMembersModal
          ref="inviteModal"
          :workspace-id="workspaceId"
          :workspace-name="workspace?.name || ''"
          @invited="handleMembersInvited"
        />
      </section>
    </div>

    <!-- Workspace not found -->
    <div v-else class="text-center py-12">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">
        Workspace not found
      </h2>
      <p class="text-gray-600">
        The workspace you're looking for doesn't exist.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  Workspace,
  WorkspaceMember,
  User,
  DropdownMenuItem,
} from "~/types";
import { parseWorkspaceSlug } from "~/utils/routes";

// Use the app layout and require authentication
definePageMeta({
  layout: "home",
});

// Get stores
const dataStore = useDataStore();
const authStore = useAuthStore();

// Add toast composable
const toast = useToast();

// Get route params
const route = useRoute();
const workspaceSlug = route.params.workspaceSlug as string;
const { id: workspaceId } = parseWorkspaceSlug(workspaceSlug);

// Get current user from auth store
const currentUser = computed(() => authStore.user);
const currentUserId = computed(() =>
  currentUser.value ? parseInt(currentUser.value.id) : null
);

// Find workspace
const workspace = computed(() => {
  if (!dataStore.isLoaded) return null;
  return dataStore.getById("workspaces", workspaceId);
});

// Get workspace members with user details using data store
const workspaceMembers = computed(() => {
  if (!dataStore.isLoaded || !workspace.value) return [];
  return dataStore.getWorkspaceMembers(workspaceId);
});

// Get current user's role in the workspace
const currentUserRole = computed(() => {
  if (!workspace.value || !currentUserId.value) return null;

  // Check if owner
  if (workspace.value.ownerId === currentUserId.value) return "owner";

  // Check member role
  const member = workspaceMembers.value.find(
    (m) => m.userId === currentUserId.value
  );

  return member?.role || null;
});

// Check permissions
const canInviteMembers = computed(() => {
  if (!workspace.value || !currentUserId.value) return false;

  // Owner can invite
  if (workspace.value.ownerId === currentUserId.value) return true;

  // Check member permissions
  const member = dataStore.workspaceMembers.find(
    (m) => m.workspaceId === workspaceId && m.userId === currentUserId.value
  );

  return member?.canInviteMembers ?? false;
});

const canManageMembers = computed(() => {
  if (!workspace.value || !currentUserId.value) return false;

  // Owner can manage
  if (workspace.value.ownerId === currentUserId.value) return true;

  // Check if user is admin
  const member = dataStore.workspaceMembers.find(
    (m) => m.workspaceId === workspaceId && m.userId === currentUserId.value
  );

  return member?.role === "admin";
});

// Check if current user can manage this specific member
const canManageMember = (member) => {
  // Can't manage yourself
  if (member.userId === currentUserId.value) return false;

  // Can't manage the workspace owner
  if (member.userId === workspace.value?.ownerId) return false;

  // Only owners and admins can manage members
  if (!canManageMembers.value) return false;

  return true;
};

// Generate dropdown actions based on member and current user permissions
const getMemberActions = (member): DropdownMenuItem[] => {
  const actions = [];

  // Role change action (only for non-owners)
  if (member.userId !== workspace.value?.ownerId) {
    actions.push({
      label: member.role === "admin" ? "Make Member" : "Make Admin",
      icon: "i-heroicons-user-circle",
      onSelect: () => changeMemberRole(member),
    });
  }

  // Remove action with proper permissions
  const canRemove =
    workspace.value?.ownerId === currentUserId.value ||
    (currentUserRole.value === "admin" && member.role === "member");

  if (canRemove) {
    actions.push({
      label: "Remove from workspace",
      icon: "i-heroicons-trash",
      color: "error",
      onSelect: () => removeMember(member),
    });
  }

  return actions;
};

// Get role display text
const getRoleDisplay = (member) => {
  if (member.userId === workspace.value?.ownerId) {
    return "Owner";
  }
  return member.role === "admin" ? "Admin" : "Member";
};

// Get badge color based on role
const getBadgeColor = (member) => {
  if (member.userId === workspace.value?.ownerId) {
    return "blue";
  }
  return member.role === "admin" ? "green" : "gray";
};

// Methods
const inviteModal = ref(null);

const getUserInitials = (user) => {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};

const handleInviteMembers = () => {
  console.log("Invite button clicked");
  console.log("Modal ref:", inviteModal.value);

  if (inviteModal.value) {
    inviteModal.value.openModal();
  } else {
    console.error("Modal reference not found");
  }
};

const handleMembersInvited = (invitedUsers) => {
  console.log("Members invited:", invitedUsers);
  // The workspace members list will automatically update since it's reactive
};

// Updated changeMemberRole method with toast notifications
const changeMemberRole = async (member) => {
  // Don't allow role changes for workspace owner
  if (member.userId === workspace.value?.ownerId) {
    toast.add({
      title: "Cannot Change Owner Role",
      description: "The workspace owner role cannot be changed",
      color: "warning",
      icon: "i-heroicons-exclamation-triangle",
    });
    return;
  }

  const newRole = member.role === "admin" ? "member" : "admin";

  try {
    // Use the data store to update the member role
    dataStore.update("workspaceMembers", member.id, {
      role: newRole,
    });

    toast.add({
      title: "Role Updated",
      description: `${member.user.firstName} ${member.user.lastName} is now ${
        newRole === "admin" ? "an admin" : "a member"
      }`,
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (error) {
    console.error("Role change failed:", error);
    toast.add({
      title: "Role Update Failed",
      description: "There was an error updating the member role",
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
  }
};

// Updated removeMember method with proper error handling and toasts
const removeMember = async (member) => {
  // Don't allow removal of workspace owner
  if (member.userId === workspace.value?.ownerId) {
    toast.add({
      title: "Cannot Remove Owner",
      description: "The workspace owner cannot be removed",
      color: "warning",
      icon: "i-heroicons-exclamation-triangle",
    });
    return;
  }

  // Check permissions - Fixed to use currentUserId.value consistently
  const canRemove =
    workspace.value?.ownerId === currentUserId.value ||
    (currentUserRole.value === "admin" && member.role === "member");

  if (!canRemove) {
    toast.add({
      title: "Insufficient Permissions",
      description: "You do not have permission to remove this member",
      color: "warning",
      icon: "i-heroicons-exclamation-triangle",
    });
    return;
  }

  try {
    // Show loading toast
    toast.add({
      title: "Removing Member",
      description: `Removing ${member.user.firstName} ${member.user.lastName} from workspace...`,
      color: "info",
      icon: "i-heroicons-arrow-path",
      duration: 2000,
    });

    // Use the data store to remove the member (soft delete)
    dataStore.remove("workspaceMembers", member.id);

    // Success toast
    toast.add({
      title: "Member Removed",
      description: `${member.user.firstName} ${member.user.lastName} has been removed from the workspace`,
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (error) {
    console.error("Member removal failed:", error);
    toast.add({
      title: "Removal Failed",
      description: "There was an error removing the member. Please try again.",
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
  }
};

// Auth check
watchEffect(() => {
  if (dataStore.isLoaded && workspace.value && currentUserId.value) {
    const hasAccess =
      workspace.value.ownerId === currentUserId.value ||
      dataStore.workspaceMembers.some(
        (m) => m.workspaceId === workspaceId && m.userId === currentUserId.value
      );

    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        statusMessage: "Access denied to this workspace",
      });
    }
  }
});

// SEO
useHead({
  title: `${workspace.value?.name || "Workspace"} - Members | Taskify`,
  meta: [
    {
      name: "description",
      content: `Manage members of ${workspace.value?.name || "workspace"}`,
    },
  ],
});
</script>
