export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  status: "active" | "not_active";
}

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  status: "active" | "not_active";
}

export interface WorkspaceMember {
  id: number;
  workspaceId: number;
  userId: number;
  role: "admin" | "member";
  canCreateBoards: boolean;
  canInviteMembers: boolean;
  joinedAt: string;
}

export interface Board {
  id: number;
  name: string;
  description?: string;
  color?: string;
  backgroundImage?: string;
  workspaceId: number;
  ownerId: number;
  visibility: "private" | "workspace" | "public";
  createdAt: string;
  updatedAt?: string;
  status: "active" | "not_active";
}

export interface BoardMember {
  id: number;
  boardId: number;
  userId: number;
  role: "owner" | "member";
  canEdit: boolean;
  canInvite: boolean;
  joinedAt: string;
}

export interface List {
  id: number;
  boardId: number;
  name: string;
  position: number;
  createdAt: string;
  updatedAt?: string;
  status: "active" | "not_active";
}

export interface Card {
  id: number;
  listId: number;
  boardId: number;
  title: string;
  description?: string;
  position: number;
  dueDate?: string;
  isComplete: boolean;
  createdById: number;
  assignedMembers?: number[];
  labels?: number[];
  attachments?: string[];
  checklistItems?: ChecklistItem[];
  createdAt: string;
  updatedAt?: string;
  status: "active" | "not_active";
}

export interface CardLabel {
  id: number;
  boardId: number;
  name: string;
  color: string;
  createdAt: string;
  status: "active" | "not_active";
}

export interface ChecklistItem {
  id: number;
  text: string;
  isComplete: boolean;
  createdAt: string;
}

export interface CardComment {
  id: number;
  cardId: number;
  userId: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  status: "active" | "not_active";
}

export interface CardActivity {
  id: number;
  cardId: number;
  userId: number;
  type:
    | "create"
    | "update"
    | "move"
    | "comment"
    | "member_add"
    | "member_remove";
  description: string;
  createdAt: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  isComplete: boolean;
  description: string;
}

export interface KanbanList {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface DatabaseSchema {
  users: User[];
  boards: Board[];
  boardMembers: BoardMember[];
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  lists: List[];
  cards: Card[];
  cardLabels: CardLabel[];
  cardComments: CardComment[];
  cardActivities: CardActivity[];
}

type TableName = keyof DatabaseSchema;
type TableRecord<T extends TableName> = DatabaseSchema[T][number];
