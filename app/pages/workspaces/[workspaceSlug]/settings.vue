<template>
  <div class="p-6">
    <!-- Workspace Header -->
    <WorkspaceHeader :workspace="workspace" />

    <!-- Settings Sections -->
    <div class="max-w-4xl">
      <!-- Workspace Details -->
      <section class="mb-8">
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Workspace Details</h3>
          </div>

          <div class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Workspace Name
              </label>
              <UInput
                v-model="workspaceForm.name"
                placeholder="Enter workspace name"
                :disabled="!canManageWorkspace"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <UTextarea
                v-model="workspaceForm.description"
                placeholder="Enter workspace description"
                :disabled="!canManageWorkspace"
                rows="3"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <URadioGroup
                v-model="workspaceForm.isPublic"
                :options="visibilityOptions"
                :disabled="!canManageWorkspace"
              />
            </div>

            <div v-if="canManageWorkspace" class="flex justify-end">
              <UButton
                color="blue"
                @click="saveWorkspaceSettings"
                :loading="saving"
              >
                Save Changes
              </UButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Member Permissions -->
      <section class="mb-8">
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Default Member Permissions
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              Set default permissions for new workspace members
            </p>
          </div>

          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">Create boards</h4>
                  <p class="text-sm text-gray-500">
                    Allow members to create new boards in this workspace
                  </p>
                </div>
                <UToggle
                  v-model="permissionsForm.canCreateBoards"
                  :disabled="!canManageWorkspace"
                />
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">Invite members</h4>
                  <p class="text-sm text-gray-500">
                    Allow members to invite new people to this workspace
                  </p>
                </div>
                <UToggle
                  v-model="permissionsForm.canInviteMembers"
                  :disabled="!canManageWorkspace"
                />
              </div>
            </div>

            <div v-if="canManageWorkspace" class="mt-6 flex justify-end">
              <UButton
                color="blue"
                @click="savePermissionSettings"
                :loading="savingPermissions"
              >
                Save Permissions
              </UButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Danger Zone -->
      <section v-if="isOwner">
        <div class="bg-white rounded-lg border border-red-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-red-200 bg-red-50">
            <h3 class="text-lg font-medium text-red-900">Danger Zone</h3>
            <p class="text-sm text-red-600 mt-1">
              Irreversible and destructive actions
            </p>
          </div>

          <div class="p-6 space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-900">
                  Transfer workspace ownership
                </h4>
                <p class="text-sm text-gray-500">
                  Transfer this workspace to another member
                </p>
              </div>
              <UButton
                color="gray"
                variant="outline"
                @click="handleTransferOwnership"
              >
                Transfer
              </UButton>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-red-900">Delete workspace</h4>
                <p class="text-sm text-red-600">
                  Permanently delete this workspace and all its boards. This
                  action cannot be undone.
                </p>
              </div>
              <UButton color="red" @click="handleDeleteWorkspace">
                Delete Workspace
              </UButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Workspace } from "~/types";
import { parseWorkspaceSlug } from "~/utils/routes";
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

// Form states
const saving = ref(false);
const savingPermissions = ref(false);

// Forms
const workspaceForm = ref({
  name: workspace.value?.name || "",
  description: workspace.value?.description || "",
  isPublic: workspace.value?.isPublic || false,
});

const permissionsForm = ref({
  canCreateBoards: true,
  canInviteMembers: false,
});

// Options
const visibilityOptions = [
  {
    value: false,
    label: "Private",
    description: "Only workspace members can see and join this workspace",
  },
  {
    value: true,
    label: "Public",
    description: "Anyone can see this workspace and request to join",
  },
];

// Permissions
const isOwner = computed(() => {
  return workspace.value?.ownerId === currentUser.value.id;
});

const canManageWorkspace = computed(() => {
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
const saveWorkspaceSettings = async () => {
  saving.value = true;
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Save workspace settings:", workspaceForm.value);

    // Update local data (in real app, this would come from API response)
    if (workspace.value) {
      workspace.value.name = workspaceForm.value.name;
      workspace.value.description = workspaceForm.value.description;
      workspace.value.isPublic = workspaceForm.value.isPublic;
    }

    // Show success message
    // You'd typically use a toast notification here
  } finally {
    saving.value = false;
  }
};

const savePermissionSettings = async () => {
  savingPermissions.value = true;
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Save permission settings:", permissionsForm.value);

    // Show success message
  } finally {
    savingPermissions.value = false;
  }
};

const handleTransferOwnership = () => {
  console.log("Transfer ownership");
  // Implement transfer ownership modal
};

const handleDeleteWorkspace = () => {
  console.log("Delete workspace");
  // Implement delete confirmation modal
};

// Initialize form values
watch(
  workspace,
  (newWorkspace) => {
    if (newWorkspace) {
      workspaceForm.value = {
        name: newWorkspace.name,
        description: newWorkspace.description || "",
        isPublic: newWorkspace.isPublic,
      };
    }
  },
  { immediate: true }
);

// Auth checks
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
  title: `${workspace.value?.name} - Settings | Trello Clone`,
  meta: [
    {
      name: "description",
      content: `Settings for ${workspace.value?.name} workspace`,
    },
  ],
});
</script>
