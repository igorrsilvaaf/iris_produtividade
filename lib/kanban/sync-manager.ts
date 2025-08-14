import { SyncOperation, KanbanTask, SyncStatus } from "../types/kanban";
import { toast } from "sonner";
import { deduplicatedFetch } from "../request-deduplicator";

export class KanbanSyncManager {
  private queue: SyncOperation[] = [];
  private retryQueue: SyncOperation[] = [];
  private isProcessing = false;
  private readonly maxRetries = 3;
  private readonly batchSize = 10;
  private readonly retryDelays = [1000, 2000, 4000]; // Exponential backoff
  private onStatusChange?: (status: SyncStatus) => void;
  private abortController: AbortController | null = null;
  private pendingRequests = new Map<string, AbortController>();

  constructor(onStatusChange?: (status: SyncStatus) => void) {
    this.onStatusChange = onStatusChange;
  }

  async queueOperation(
    operation: Omit<
      SyncOperation,
      "id" | "timestamp" | "retryCount" | "maxRetries"
    >
  ) {
    const syncOperation: SyncOperation = {
      ...operation,
      id: `${operation.type}_${operation.taskId}_${Date.now()}`,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.maxRetries,
    };

    this.queue.push(syncOperation);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.updateStatus("syncing");

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize);
        await this.processBatch(batch);
      }

      // Processar retry queue
      if (this.retryQueue.length > 0) {
        const retryBatch = this.retryQueue.splice(0, this.batchSize);
        await this.processBatch(retryBatch);
      }

      this.updateStatus("success");
    } catch (error) {
      console.error("Erro no processamento da queue:", error);
      this.updateStatus("error");
    } finally {
      this.isProcessing = false;

      // Se ainda há itens na queue, processar novamente
      if (this.queue.length > 0 || this.retryQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      } else {
        this.updateStatus("idle");
      }
    }
  }

  private async processBatch(batch: SyncOperation[]) {
    const promises = batch.map((operation) => this.processOperation(operation));
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      const operation = batch[index];

      if (result.status === "rejected") {
        this.handleOperationFailure(operation, result.reason);
      }
    });
  }

  private async processOperation(operation: SyncOperation): Promise<void> {
    try {
      switch (operation.type) {
        case "MOVE_TASK":
          await this.moveTask(operation);
          break;
        case "UPDATE_TASK":
          await this.updateTask(operation);
          break;
        case "CREATE_TASK":
          await this.createTask(operation);
          break;
        case "DELETE_TASK":
          await this.deleteTask(operation);
          break;
        default:
          throw new Error(`Tipo de operação não suportado: ${operation.type}`);
      }
    } catch (error) {
      throw new Error(`Falha na operação ${operation.type}: ${error}`);
    }
  }

  private async moveTask(operation: SyncOperation): Promise<void> {
    const { taskId, payload } = operation;
    const controller = new AbortController();
    const requestId = `move_${taskId}_${Date.now()}`;

    this.pendingRequests.set(requestId, controller);

    try {
      const response = await deduplicatedFetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kanban_column: (payload as any).toColumn,
          kanban_order: (payload as any).position,
          completed: (payload as { toColumn: string }).toColumn === "completed",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } finally {
      this.pendingRequests.delete(requestId);
    }
  }

  private async updateTask(operation: SyncOperation): Promise<void> {
    const { taskId, payload } = operation;
    const controller = new AbortController();
    const requestId = `update_${taskId}_${Date.now()}`;

    this.pendingRequests.set(requestId, controller);

    try {
      const response = await deduplicatedFetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } finally {
      this.pendingRequests.delete(requestId);
    }
  }

  private async createTask(operation: SyncOperation): Promise<void> {
    const { payload } = operation;
    const controller = new AbortController();
    const requestId = `create_${Date.now()}`;

    this.pendingRequests.set(requestId, controller);

    try {
      const response = await deduplicatedFetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } finally {
      this.pendingRequests.delete(requestId);
    }
  }

  private async deleteTask(operation: SyncOperation): Promise<void> {
    const { taskId } = operation;
    const controller = new AbortController();
    const requestId = `delete_${taskId}_${Date.now()}`;

    this.pendingRequests.set(requestId, controller);

    try {
      const response = await deduplicatedFetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } finally {
      this.pendingRequests.delete(requestId);
    }
  }

  private handleOperationFailure(operation: SyncOperation, error: any) {
    operation.retryCount++;

    if (operation.retryCount < operation.maxRetries) {
      // Adicionar à retry queue com delay
      const delay = this.retryDelays[operation.retryCount - 1] || 4000;

      setTimeout(() => {
        this.retryQueue.push(operation);
      }, delay);

      console.warn(
        `Operação ${operation.id} falhará, tentativa ${operation.retryCount}/${operation.maxRetries}`,
        error
      );
    } else {
      console.error(
        `Operação ${operation.id} falhou definitivamente após ${operation.maxRetries} tentativas`,
        error
      );

      toast.error("Erro na sincronização", {
        description: "Algumas alterações não puderam ser salvas",
        action: {
          label: "Tentar novamente",
          onClick: () => this.retryFailedOperation(operation),
        },
      });
    }
  }

  private retryFailedOperation(operation: SyncOperation) {
    operation.retryCount = 0;
    this.queue.push(operation);
    this.processQueue();
  }

  private updateStatus(status: SyncStatus) {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  // Método para cancelar todas as requisições pendentes
  public cancelAllRequests(): void {
    this.pendingRequests.forEach((controller, requestId) => {
      controller.abort();
      console.debug(`Requisição cancelada: ${requestId}`);
    });
    this.pendingRequests.clear();
  }

  // Método para obter estatísticas das requisições
  public getRequestStats(): {
    pending: number;
    queue: number;
    retryQueue: number;
  } {
    return {
      pending: this.pendingRequests.size,
      queue: this.queue.length,
      retryQueue: this.retryQueue.length,
    };
  }

  // Método para limpar todas as queues
  private clearQueues(): void {
    this.cancelAllRequests();
    this.queue.length = 0;
    this.retryQueue.length = 0;
    this.isProcessing = false;
    this.updateStatus("idle");
  }

  // Método para processar queue offline quando voltar online
  async processOfflineQueue() {
    if (this.queue.length > 0 || this.retryQueue.length > 0) {
      toast.info("Sincronizando alterações offline...");
      await this.processQueue();
    }
  }

  // Obter status das queues
  getQueueStatus() {
    return {
      pending: this.queue.length,
      retrying: this.retryQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}
