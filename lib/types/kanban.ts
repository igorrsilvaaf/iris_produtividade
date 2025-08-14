// Tipos para o sistema Kanban
export type KanbanColumnId = string;

export interface KanbanColumnData {
  id: KanbanColumnId;
  title: string;
  taskIds: number[];
  order: number;
  color?: string;
  isDefault?: boolean;
  lastUpdated?: Date;
}

export interface KanbanState {
  columns: Record<string, KanbanColumnData>;
  columnOrder: KanbanColumnId[];
  tasks: Record<number, KanbanTask>;
  syncStatus?: {
    pending: number[];
    syncing: number[];
    failed: number[];
  };
  lastSync?: number;
}

export interface KanbanTask {
  id: number;
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: string;
  status: KanbanColumnId;
  kanban_column: KanbanColumnId;
  order?: number;
  kanban_order: number;
  priority?: "low" | "medium" | "high";
  points?: number;
  projectId?: number;
  projectName?: string;
  projectColor?: string;
  createdAt?: string;
  updatedAt?: string;
  updated_at?: string;
  labels?: string[];
  localChanges?: Partial<KanbanTask>;
  syncStatus?: "synced" | "pending" | "syncing" | "failed";
}

export interface SyncOperation {
  id: string;
  type: "MOVE_TASK" | "UPDATE_TASK" | "CREATE_TASK" | "DELETE_TASK";
  taskId: number;
  payload: Partial<KanbanTask>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface MoveOperation {
  taskId: number;
  fromColumn: KanbanColumnId;
  toColumn: KanbanColumnId;
  position: number;
  reason?: string;
}

export interface ColumnOperation {
  type: "CREATE_COLUMN" | "UPDATE_COLUMN" | "DELETE_COLUMN" | "REORDER_COLUMNS";
  columnId: KanbanColumnId;
  payload?: Partial<KanbanColumnData>;
  newOrder?: KanbanColumnId[];
}

// Colunas padrão do sistema
export const DEFAULT_COLUMNS: KanbanColumnData[] = [
  {
    id: "backlog",
    title: "BACKLOG",
    taskIds: [],
    order: 0,
    color: "#6B7280",
    isDefault: true,
    lastUpdated: new Date(Date.now()),
  },
  {
    id: "planning",
    title: "PLANNING",
    taskIds: [],
    order: 1,
    color: "#3B82F6",
    isDefault: true,
    lastUpdated: new Date(Date.now()),
  },
  {
    id: "inProgress",
    title: "IN PROGRESS",
    taskIds: [],
    order: 2,
    color: "#F59E0B",
    isDefault: true,
    lastUpdated: new Date(Date.now()),
  },
  {
    id: "validation",
    title: "VALIDATION",
    taskIds: [],
    order: 3,
    color: "#8B5CF6",
    isDefault: true,
    lastUpdated: new Date(Date.now()),
  },
  {
    id: "completed",
    title: "COMPLETED",
    taskIds: [],
    order: 4,
    color: "#10B981",
    isDefault: true,
    lastUpdated: new Date(Date.now()),
  },
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
  priority: "high" | "medium" | "low";
}

export type SyncStatus = "syncing" | "success" | "error" | "idle";

export interface KanbanAction {
  type:
    | "MOVE_TASK_OPTIMISTIC"
    | "SYNC_TASK_MOVE"
    | "SYNC_TASK_UPDATE"
    | "SET_SYNC_STATUS"
    | "ROLLBACK_OPERATION";
  payload: unknown;
}
