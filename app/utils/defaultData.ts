// utils/defaultData.ts

import type { DatabaseSchema } from "~/types";

export const defaultKanbanData: DatabaseSchema = {
  users: [
    {
      id: 1,
      username: "demo",
      email: "demo@example.com",
      password: "password123",
      firstName: "Demo",
      lastName: "User",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 2,
      username: "john",
      email: "john@example.com",
      password: "john123",
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 3,
      username: "jane",
      email: "jane@example.com",
      password: "jane123",
      firstName: "Jane",
      lastName: "Smith",
      createdAt: new Date().toISOString(),
      status: "active",
    },
  ],

  workspaces: [
    {
      id: 1,
      name: "Demo Workspace",
      description: "A sample workspace to get started",
      ownerId: 1,
      isPublic: false,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 2,
      name: "Team Collaboration",
      description: "Workspace for team projects",
      ownerId: 2,
      isPublic: true,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 3,
      name: "Personal Projects",
      description: "My personal workspace",
      ownerId: 1,
      isPublic: false,
      createdAt: new Date().toISOString(),
      status: "active",
    },
  ],

  workspaceMembers: [
    // Demo Workspace members
    {
      id: 1,
      workspaceId: 1,
      userId: 1, // Demo (owner)
      role: "admin",
      canCreateBoards: true,
      canInviteMembers: true,
      joinedAt: new Date().toISOString(),
    },
    {
      id: 2,
      workspaceId: 1,
      userId: 2, // John
      role: "member",
      canCreateBoards: true,
      canInviteMembers: false,
      joinedAt: new Date().toISOString(),
    },
    {
      id: 3,
      workspaceId: 1,
      userId: 3, // Jane
      role: "member",
      canCreateBoards: false,
      canInviteMembers: false,
      joinedAt: new Date().toISOString(),
    },

    // Team Collaboration workspace members
    {
      id: 4,
      workspaceId: 2,
      userId: 2, // John (owner)
      role: "admin",
      canCreateBoards: true,
      canInviteMembers: true,
      joinedAt: new Date().toISOString(),
    },
    {
      id: 5,
      workspaceId: 2,
      userId: 1, // Demo
      role: "admin",
      canCreateBoards: true,
      canInviteMembers: true,
      joinedAt: new Date().toISOString(),
    },

    // Personal Projects workspace (only owner)
    {
      id: 6,
      workspaceId: 3,
      userId: 1, // Demo (owner)
      role: "admin",
      canCreateBoards: true,
      canInviteMembers: true,
      joinedAt: new Date().toISOString(),
    },
  ],

  boards: [
    {
      id: 1,
      name: "My First Board",
      description: "A sample board to get started",
      color: "#0079bf",
      workspaceId: 1, // Demo Workspace
      ownerId: 1,
      isPublic: false,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 2,
      name: "Marketing Campaign",
      description: "Q1 Marketing campaign planning",
      color: "#d29034",
      workspaceId: 2, // Team Collaboration
      ownerId: 2,
      isPublic: true,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 3,
      name: "Product Roadmap",
      description: "2024 Product development roadmap",
      color: "#519839",
      workspaceId: 2, // Team Collaboration
      ownerId: 1,
      isPublic: false,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 4,
      name: "Personal Goals",
      description: "My personal development goals",
      color: "#89609e",
      workspaceId: 3, // Personal Projects
      ownerId: 1,
      isPublic: false,
      createdAt: new Date().toISOString(),
      status: "active",
    },
  ],

  boardMembers: [
    // My First Board members
    {
      id: 1,
      boardId: 1,
      userId: 1,
      role: "owner",
      canEdit: true,
      canInvite: true,
      joinedAt: new Date().toISOString(),
    },
    {
      id: 2,
      boardId: 1,
      userId: 2,
      role: "member",
      canEdit: true,
      canInvite: false,
      joinedAt: new Date().toISOString(),
    },

    // Marketing Campaign members
    {
      id: 3,
      boardId: 2,
      userId: 2,
      role: "owner",
      canEdit: true,
      canInvite: true,
      joinedAt: new Date().toISOString(),
    },
    {
      id: 4,
      boardId: 2,
      userId: 1,
      role: "member",
      canEdit: true,
      canInvite: true,
      joinedAt: new Date().toISOString(),
    },

    // Product Roadmap members
    {
      id: 5,
      boardId: 3,
      userId: 1,
      role: "owner",
      canEdit: true,
      canInvite: true,
      joinedAt: new Date().toISOString(),
    },
    {
      id: 6,
      boardId: 3,
      userId: 2,
      role: "member",
      canEdit: true,
      canInvite: false,
      joinedAt: new Date().toISOString(),
    },

    // Personal Goals (only owner)
    {
      id: 7,
      boardId: 4,
      userId: 1,
      role: "owner",
      canEdit: true,
      canInvite: true,
      joinedAt: new Date().toISOString(),
    },
  ],

  lists: [
    // My First Board lists
    {
      id: 1,
      boardId: 1,
      name: "To Do",
      position: 1,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 2,
      boardId: 1,
      name: "In Progress",
      position: 2,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 3,
      boardId: 1,
      name: "Done",
      position: 3,
      createdAt: new Date().toISOString(),
      status: "active",
    },

    // Marketing Campaign lists
    {
      id: 4,
      boardId: 2,
      name: "Ideas",
      position: 1,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 5,
      boardId: 2,
      name: "In Review",
      position: 2,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 6,
      boardId: 2,
      name: "Approved",
      position: 3,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 7,
      boardId: 2,
      name: "Launched",
      position: 4,
      createdAt: new Date().toISOString(),
      status: "active",
    },

    // Product Roadmap lists
    {
      id: 8,
      boardId: 3,
      name: "Backlog",
      position: 1,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 9,
      boardId: 3,
      name: "Q1 2024",
      position: 2,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 10,
      boardId: 3,
      name: "Q2 2024",
      position: 3,
      createdAt: new Date().toISOString(),
      status: "active",
    },

    // Personal Goals lists
    {
      id: 11,
      boardId: 4,
      name: "Goals",
      position: 1,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 12,
      boardId: 4,
      name: "In Progress",
      position: 2,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 13,
      boardId: 4,
      name: "Completed",
      position: 3,
      createdAt: new Date().toISOString(),
      status: "active",
    },
  ],

  cards: [
    // My First Board cards
    {
      id: 1,
      listId: 1,
      boardId: 1,
      title: "Welcome to your board!",
      description:
        "This is a sample card. Click to edit and add more details, due dates, and assignments.",
      position: 1,
      isComplete: false,
      createdById: 1,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 2,
      listId: 2,
      boardId: 1,
      title: "Card in progress",
      description: "This card is being worked on by the team",
      position: 1,
      isComplete: false,
      createdById: 1,
      assignedMembers: [1, 2],
      labels: [1],
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 3,
      listId: 3,
      boardId: 1,
      title: "Completed task",
      description: "This task has been completed successfully",
      position: 1,
      isComplete: true,
      createdById: 2,
      assignedMembers: [2],
      labels: [2],
      createdAt: new Date().toISOString(),
      status: "active",
    },

    // Marketing Campaign cards
    {
      id: 4,
      listId: 4,
      boardId: 2,
      title: "Social Media Strategy",
      description: "Develop comprehensive social media strategy for Q1",
      position: 1,
      isComplete: false,
      createdById: 2,
      assignedMembers: [1, 2],
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 5,
      listId: 5,
      boardId: 2,
      title: "Content Calendar",
      description: "Create content calendar for all platforms",
      position: 1,
      isComplete: false,
      createdById: 1,
      assignedMembers: [1],
      createdAt: new Date().toISOString(),
      status: "active",
    },

    // Product Roadmap cards
    {
      id: 6,
      listId: 8,
      boardId: 3,
      title: "User Authentication System",
      description: "Implement secure user login and registration",
      position: 1,
      isComplete: false,
      createdById: 1,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 7,
      listId: 9,
      boardId: 3,
      title: "Dashboard Redesign",
      description: "Redesign main dashboard for better UX",
      position: 1,
      dueDate: "2024-03-31T23:59:59.000Z",
      isComplete: false,
      createdById: 1,
      assignedMembers: [1, 2],
      createdAt: new Date().toISOString(),
      status: "active",
    },

    // Personal Goals cards
    {
      id: 8,
      listId: 11,
      boardId: 4,
      title: "Learn Vue 3 Composition API",
      description: "Complete Vue 3 course and build a project",
      position: 1,
      isComplete: false,
      createdById: 1,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 9,
      listId: 12,
      boardId: 4,
      title: "Read 12 Books This Year",
      description: "Currently on book 3/12",
      position: 1,
      isComplete: false,
      createdById: 1,
      checklistItems: [
        {
          id: 1,
          text: "Atomic Habits",
          isComplete: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          text: "Clean Code",
          isComplete: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          text: "You Don't Know JS",
          isComplete: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 4,
          text: "Designing Data-Intensive Applications",
          isComplete: false,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      status: "active",
    },
  ],

  cardLabels: [
    // My First Board labels
    {
      id: 1,
      boardId: 1,
      name: "High Priority",
      color: "#eb5a46",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 2,
      boardId: 1,
      name: "Low Priority",
      color: "#61bd4f",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 3,
      boardId: 1,
      name: "Bug",
      color: "#f2d600",
      createdAt: new Date().toISOString(),
      status: "active",
    },

    // Marketing Campaign labels
    {
      id: 4,
      boardId: 2,
      name: "Social Media",
      color: "#0079bf",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 5,
      boardId: 2,
      name: "Content",
      color: "#89609e",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 6,
      boardId: 2,
      name: "Design",
      color: "#ff9f1a",
      createdAt: new Date().toISOString(),
      status: "active",
    },

    // Product Roadmap labels
    {
      id: 7,
      boardId: 3,
      name: "Feature",
      color: "#61bd4f",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 8,
      boardId: 3,
      name: "Enhancement",
      color: "#0079bf",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 9,
      boardId: 3,
      name: "Critical",
      color: "#eb5a46",
      createdAt: new Date().toISOString(),
      status: "active",
    },

    // Personal Goals labels
    {
      id: 10,
      boardId: 4,
      name: "Learning",
      color: "#0079bf",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: 11,
      boardId: 4,
      name: "Health",
      color: "#61bd4f",
      createdAt: new Date().toISOString(),
      status: "active",
    },
  ],

  cardComments: [
    {
      id: 1,
      cardId: 2,
      userId: 2,
      comment: "I'll start working on this today!",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      status: "active",
    },
    {
      id: 2,
      cardId: 2,
      userId: 1,
      comment: "Great! Let me know if you need any help.",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      status: "active",
    },
    {
      id: 3,
      cardId: 7,
      userId: 1,
      comment: "The mockups look great! Ready to start development.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      status: "active",
    },
  ],

  cardActivities: [
    {
      id: 1,
      cardId: 1,
      userId: 1,
      type: "create",
      description: "created this card",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      cardId: 2,
      userId: 1,
      type: "create",
      description: "created this card",
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      cardId: 2,
      userId: 1,
      type: "member_add",
      description: "added John Doe to this card",
      createdAt: new Date().toISOString(),
    },
    {
      id: 4,
      cardId: 3,
      userId: 2,
      type: "create",
      description: "created this card",
      createdAt: new Date().toISOString(),
    },
    {
      id: 5,
      cardId: 3,
      userId: 2,
      type: "update",
      description: "marked this card as complete",
      createdAt: new Date().toISOString(),
    },
  ],
};
