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
                class="w-full"
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
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <!-- ✅ Fixed: Using items instead of options -->
              <URadioGroup
                v-model="workspaceForm.isPublic"
                :items="visibilityOptions"
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
                <!-- ✅ Fixed: UToggle → USwitch -->
                <USwitch
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
                <!-- ✅ Fixed: UToggle → USwitch -->
                <USwitch
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

    <!-- Transfer Ownership Modal -->
    <UModal v-model:open="showTransferModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Transfer Workspace Ownership
          </h3>

          <p class="text-sm text-gray-600 mb-6">
            Transfer ownership of "{{ workspace?.name }}" to another admin
            member. You will become a regular admin member after the transfer.
          </p>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select new owner
            </label>
            <!-- ✅ Fixed: Using value-key to bind to userId property -->
            <USelectMenu
              v-model="selectedNewOwner"
              :items="adminMemberOptions"
              value-key="userId"
              placeholder="Choose an admin member"
              class="w-full"
            />
          </div>

          <div
            class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6"
          >
            <div class="flex">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="text-yellow-400 w-5 h-5 mr-2 mt-0.5"
              />
              <div>
                <h4 class="text-sm font-medium text-yellow-800">Warning</h4>
                <p class="text-sm text-yellow-700 mt-1">
                  This action cannot be undone. The new owner will have full
                  control over this workspace.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <UButton variant="ghost" @click="showTransferModal = false">
              Cancel
            </UButton>
            <UButton
              color="orange"
              @click="confirmTransferOwnership"
              :disabled="!selectedNewOwner"
              :loading="transferring"
            >
              Transfer Ownership
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete Workspace Modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-red-900 mb-4">
            Delete Workspace
          </h3>

          <p class="text-sm text-gray-600 mb-4">
            This will permanently delete "{{ workspace?.name }}" and all its
            boards, lists, and cards. This action cannot be undone.
          </p>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Type the workspace name to confirm:
            </label>
            <UInput
              v-model="deleteConfirmation"
              :placeholder="workspace?.name"
              class="w-full"
            />
          </div>

          <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div class="flex">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="text-red-400 w-5 h-5 mr-2 mt-0.5"
              />
              <div>
                <h4 class="text-sm font-medium text-red-800">
                  This action cannot be undone
                </h4>
                <p class="text-sm text-red-700 mt-1">
                  All workspace data will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <UButton variant="ghost" @click="showDeleteModal = false">
              Cancel
            </UButton>
            <UButton
              color="red"
              @click="confirmDeleteWorkspace"
              :disabled="deleteConfirmation !== workspace?.name"
              :loading="deleting"
            >
              Delete Workspace
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { parseWorkspaceSlug } from "~/utils/routes";

// Use the app layout
definePageMeta({
  layout: "home",
});

const dataStore = useDataStore();
const toast = useToast();

// Get route params
const route = useRoute();
const workspaceSlug = route.params.workspaceSlug as string;
const { id: workspaceId } = parseWorkspaceSlug(workspaceSlug);

// Remove this line - don't use defaultKanbanData
// const data = ref(defaultKanbanData);

// Use the current user from auth store or your existing setup
const currentUser = ref({ id: 1, email: "demo@example.com" });

// Find workspace from the dataStore instead of local data
const workspace = computed(() => {
  return dataStore.workspaces.find((w) => w.id === workspaceId);
});

// Form states
const saving = ref(false);
const savingPermissions = ref(false);

// Modal states
const showTransferModal = ref(false);
const showDeleteModal = ref(false);
const selectedNewOwner = ref(null);
const deleteConfirmation = ref("");
const transferring = ref(false);
const deleting = ref(false);

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

// Updated options format for URadioGroup v3
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
const adminMemberOptions = computed(() => {
  if (!workspace.value) return [];

  const options = workspaceMembers.value
    .filter(
      (member) =>
        member.role === "admin" && member.userId !== workspace.value.ownerId
    )
    .map((member) => ({
      label: `${member.user.firstName} ${member.user.lastName}`,
      description: member.user.email,
      userId: member.userId,
      member: member,
    }));

  return options;
});

const isOwner = computed(() => {
  return workspace.value?.ownerId === currentUser.value.id;
});

const canManageWorkspace = computed(() => {
  if (!workspace.value) return false;

  // Owner can manage
  if (workspace.value.ownerId === currentUser.value.id) return true;

  // Check if user is admin - use dataStore instead of local data
  const member = dataStore.workspaceMembers.find(
    (m) => m.workspaceId === workspaceId && m.userId === currentUser.value.id
  );

  return member?.role === "admin";
});

// Get workspace members with user details using data store
const workspaceMembers = computed(() => {
  if (!dataStore.isLoaded || !workspace.value) return [];
  return dataStore.getWorkspaceMembers(workspaceId);
});

// Methods
const handleTransferOwnership = () => {
  if (adminMemberOptions.value.length === 0) {
    toast.add({
      title: "No Admin Members Available",
      description:
        "Promote a member to admin first before transferring ownership",
      color: "warning",
      icon: "i-heroicons-exclamation-triangle",
      duration: 6000,
    });
    return;
  }

  selectedNewOwner.value = null;
  showTransferModal.value = true;
};

const confirmTransferOwnership = async () => {
  if (!selectedNewOwner.value || !workspace.value) {
    toast.add({
      title: "Transfer Failed",
      description: "Missing required information for transfer",
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
    return;
  }

  transferring.value = true;
  try {
    toast.add({
      title: "Transferring Ownership",
      description: "Please wait while we transfer the workspace ownership...",
      color: "info",
      icon: "i-heroicons-arrow-path",
      duration: 2000,
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update workspace owner using dataStore
    dataStore.update("workspaces", workspace.value.id, {
      ownerId: selectedNewOwner.value,
    });

    // Update the old owner's role to admin
    const oldOwnerMembership = dataStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUser.value.id
    );

    if (oldOwnerMembership) {
      dataStore.update("workspaceMembers", oldOwnerMembership.id, {
        role: "admin",
      });
    } else {
      // Create new membership for old owner
      dataStore.create("workspaceMembers", {
        workspaceId: workspaceId,
        userId: currentUser.value.id,
        role: "admin",
        canCreateBoards: true,
        canInviteMembers: true,
        status: "active",
      });
    }

    const newOwner = adminMemberOptions.value.find(
      (option) => option.userId === selectedNewOwner.value
    );

    toast.add({
      title: "Ownership Transferred Successfully",
      description: `${
        newOwner?.label || "New owner"
      } is now the owner of this workspace`,
      color: "success",
      icon: "i-heroicons-check-circle",
      duration: 5000,
    });

    showTransferModal.value = false;
    await navigateTo(`/workspaces/${workspaceSlug}/home`);
  } catch (error) {
    console.error("Transfer failed:", error);
    toast.add({
      title: "Transfer Failed",
      description:
        "There was an error transferring ownership. Please try again.",
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
  } finally {
    transferring.value = false;
  }
};

const handleDeleteWorkspace = () => {
  deleteConfirmation.value = "";
  showDeleteModal.value = true;
};

const confirmDeleteWorkspace = async () => {
  if (!workspace.value || deleteConfirmation.value !== workspace.value.name)
    return;

  deleting.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Set workspace status to deleted using dataStore
    dataStore.update("workspaces", workspace.value.id, {
      status: "not_active",
    });

    // Also mark related boards as deleted
    const workspaceBoards = dataStore.boards.value.filter(
      (board) => board.workspaceId === workspaceId
    );

    workspaceBoards.forEach((board) => {
      dataStore.update("boards", board.id, {
        status: "not_active",
      });
    });

    console.log(`Deleted workspace: ${workspace.value.name}`);
    showDeleteModal.value = false;

    await navigateTo("/");
  } catch (error) {
    console.error("Delete failed:", error);
  } finally {
    deleting.value = false;
  }
};

const saveWorkspaceSettings = async () => {
  saving.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update workspace using dataStore
    if (workspace.value) {
      dataStore.update("workspaces", workspace.value.id, {
        name: workspaceForm.value.name,
        description: workspaceForm.value.description,
        isPublic: workspaceForm.value.isPublic,
      });

      toast.add({
        title: "Settings Saved",
        description: "Workspace settings have been updated successfully",
        color: "success",
        icon: "i-heroicons-check-circle",
      });
    }
  } finally {
    saving.value = false;
  }
};

const savePermissionSettings = async () => {
  savingPermissions.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Save permission settings:", permissionsForm.value);

    toast.add({
      title: "Permissions Saved",
      description: "Permission settings have been updated successfully",
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } finally {
    savingPermissions.value = false;
  }
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
    dataStore.workspaceMembers.some(
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
