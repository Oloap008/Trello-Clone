export const useWorkspaceCreation = () => {
  const createWorkspace = async (formData) => {
    const dataStore = useDataStore();
    const authStore = useAuthStore();

    if (!authStore.user) {
      throw new Error("User not authenticated");
    }

    const userId = parseInt(authStore.user.id);

    // Create the workspace
    const newWorkspace = dataStore.create("workspaces", {
      name: formData.name,
      description: formData.description,
      ownerId: userId,
      isPublic: false,
      status: "active",
    });

    // Add the owner as a workspace member
    const ownerMembership = dataStore.create("workspaceMembers", {
      workspaceId: newWorkspace.id,
      userId: userId,
      role: "admin",
      canCreateBoards: true,
      canInviteMembers: true,
      joinedAt: new Date().toISOString(),
    });

    console.log("Created workspace:", newWorkspace);
    console.log("Created owner membership:", ownerMembership);

    return newWorkspace;
  };

  return {
    createWorkspace,
  };
};
