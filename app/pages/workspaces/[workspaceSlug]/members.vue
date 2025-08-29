<template>
  <div class="p-6">
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
                :src="member.user.avatar || `/api/placeholder/40/40`"
                :alt="member.user.firstName + ' ' + member.user.lastName"
                size="md"
              />
              <div>
                <h4 class="font-medium text-gray-900">
                  {{ member.user.firstName }} {{ member.user.lastName }}
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
                v-if="canManageMembers && member.userId !== currentUser.id"
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
              >Can manage workspace settings, invite members, create boards, and
              delete the workspace.</span
            >
          </div>
          <div class="flex items-start space-x-2">
            <UBadge color="gray" variant="subtle" size="xs">Member</UBadge>
            <span
              >Can view and collaborate on boards. Additional permissions can be
              set per member.</span
            >
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Workspace, WorkspaceMember, User } from "~/types";
import { parseWorkspaceSlug, routes } from "~/utils/routes";
import { defaultKanbanData } from "~/utils/defaultData";

// Use the app layout
definePageMeta({
  layout: "home",
});

// Get route params
const route = useRoute();
const workspaceSlug = route.params.workspaceSlug as string;
const { id: workspaceId } = parseWorkspaceSlug(workspaceSlug);

// Data
const data = ref(defaultKanbanData);
const currentUser = ref({ id: 1, email: "demo@example.com" });

// Find workspace
const workspace = computed(() => {
  return data.value.workspaces.find((w) => w.id === workspaceId);
});

// Get workspace members with user details
const workspaceMembers = computed(() => {
  return data.value.workspaceMembers
    .filter((member) => member.workspaceId === workspaceId)
    .map((member) => {
      const user = data.value.users.find((u) => u.id === member.userId);
      return {
        ...member,
        user: user!,
      };
    })
    .filter((member) => member.user); // Filter out members without user data
});

// Check permissions
const canInviteMembers = computed(() => {
  if (!workspace.value) return false;

  // Owner can invite
  if (workspace.value.ownerId === currentUser.value.id) return true;

  // Check member permissions
  const member = data.value.workspaceMembers.find(
    (m) => m.workspaceId === workspaceId && m.userId === currentUser.value.id
  );

  return member?.canInviteMembers ?? false;
});

const canManageMembers = computed(() => {
  if (!workspace.value) return false;

  // Owner can manage
  if (workspace.value.ownerId === currentUser.value.id) return true;

  // Check if user is admin
  const member = data.value.workspaceMembers.find(
    (m) => m.workspaceId === workspaceId && m.userId === currentUser.value.id
  );

  return member?.role === "admin";
});

// Methods
const handleInviteMembers = () => {
  // Handle member invitation
  console.log("Invite members to workspace:", workspaceId);
};

const changeMemberRole = (member: WorkspaceMember & { user: User }) => {
  // Handle role change
  const newRole = member.role === "admin" ? "member" : "admin";
  console.log(`Change ${member.user.email} role to ${newRole}`);
};

const removeMember = (member: WorkspaceMember & { user: User }) => {
  // Handle member removal
  console.log(`Remove ${member.user.email} from workspace`);
};

// Auth check
if (!workspace.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Workspace not found",
  });
}

const hasAccess = computed(() => {
  if (!workspace.value) return false;
  return (
    workspace.value.ownerId === currentUser.value.id ||
    data.value.workspaceMembers.some(
      (member) =>
        member.workspaceId === workspaceId &&
        member.userId === currentUser.value.id
    )
  );
});

if (!hasAccess.value) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied",
  });
}

// SEO
useHead({
  title: `${workspace.value?.name} - Members | Trello Clone`,
  meta: [
    {
      name: "description",
      content: `Manage members of ${workspace.value?.name} workspace`,
    },
  ],
});
</script>
