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

          <div class="divide-y divide-gray-200">
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
                  </h4>
                  <p class="text-sm text-gray-500">{{ member.user.email }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <!-- Role Badge -->
                <UBadge
                  :color="member.role === 'admin' ? 'blue' : 'gray'"
                  variant="subtle"
                >
                  {{ member.role === "admin" ? "Admin" : "Member" }}
                </UBadge>

                <!-- Member Actions -->
                <UDropdown
                  v-if="canManageMembers && member.userId !== currentUser?.id"
                >
                  <UButton variant="ghost" size="sm" square>
                    <UIcon name="i-heroicons-ellipsis-horizontal" />
                  </UButton>

                  <template #panel="{ close }">
                    <div class="p-1">
                      <UButton
                        variant="ghost"
                        size="sm"
                        class="w-full justify-start"
                        @click="
                          changeMemberRole(member);
                          close();
                        "
                      >
                        <UIcon
                          name="i-heroicons-user-circle"
                          class="w-4 h-4 mr-2"
                        />
                        {{
                          member.role === "admin" ? "Make Member" : "Make Admin"
                        }}
                      </UButton>

                      <UButton
                        variant="ghost"
                        size="sm"
                        class="w-full justify-start text-red-600 hover:text-red-800"
                        @click="
                          removeMember(member);
                          close();
                        "
                      >
                        <UIcon name="i-heroicons-trash" class="w-4 h-4 mr-2" />
                        Remove from workspace
                      </UButton>
                    </div>
                  </template>
                </UDropdown>
              </div>
            </div>
          </div>
        </div>

        <!-- Member Permissions Info -->
        <div class="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-2">Permission levels</h4>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-start space-x-2">
              <UBadge color="blue" variant="subtle" size="xs">Admin</UBadge>
              <span
                >Can manage workspace settings, invite members, create boards,
                and delete the workspace.</span
              >
            </div>
            <div class="flex items-start space-x-2">
              <UBadge color="gray" variant="subtle" size="xs">Member</UBadge>
              <span
                >Can view and collaborate on boards. Additional permissions can
                be set per member.</span
              >
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
import type { Workspace, WorkspaceMember, User } from "~/types";
import { parseWorkspaceSlug } from "~/utils/routes";

// Use the app layout and require authentication
definePageMeta({
  layout: "home",
  middleware: "auth",
});

// Get stores
const dataStore = useDataStore();
const authStore = useAuthStore();

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

const changeMemberRole = (member) => {
  const newRole = member.role === "admin" ? "member" : "admin";

  dataStore.update("workspaceMembers", member.id, {
    role: newRole,
  });

  console.log(`Changed ${member.user.email} role to ${newRole}`);
};

const removeMember = (member) => {
  // Remove member from workspace
  dataStore.remove("workspaceMembers", member.id);
  console.log(`Removed ${member.user.email} from workspace`);
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
