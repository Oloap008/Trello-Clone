// utils/routes.ts
import type { Workspace } from "~/types";

// Create workspace slug from name and ID
export const createWorkspaceSlug = (workspace: Workspace): string => {
  const nameSlug = workspace.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${nameSlug}-${workspace.id}`;
};

// Parse workspace slug to get ID
export const parseWorkspaceSlug = (
  slug: string
): { id: number; nameSlug: string } => {
  const parts = slug.split("-");
  const id = parseInt(parts[parts.length - 1]);
  const nameSlug = parts.slice(0, -1).join("-");

  return { id, nameSlug };
};

// Generate route paths
export const routes = {
  // Marketing
  home: () => "/",

  // User routes
  userBoards: (userEmail: string) =>
    `/user/${encodeURIComponent(userEmail)}/boards`,

  // Workspace routes
  workspaceHome: (workspace: Workspace) =>
    `/workspaces/${createWorkspaceSlug(workspace)}/home`,
  workspaceMembers: (workspace: Workspace) =>
    `/workspaces/${createWorkspaceSlug(workspace)}/members`,
  workspaceSettings: (workspace: Workspace) =>
    `/workspaces/${createWorkspaceSlug(workspace)}/settings`,

  // Board routes
  board: (boardId: number) => `/board/${boardId}`,
};

// Navigation items for sidebar
export const sidebarNavItems = [
  {
    name: "Boards",
    icon: "i-heroicons-squares-2x2",
    getPath: (userEmail: string) => routes.userBoards(userEmail),
  },
  {
    name: "Home",
    icon: "i-heroicons-home",
    getPath: (userEmail: string) => routes.userBoards(userEmail), // Same as boards for now
  },
];
