import { ReadableStreamDefaultController } from "stream/web";

interface UpdateListener {
  controller: ReadableStreamDefaultController;
  lastPing: number;
}

const updateListeners = new Map<string, Set<UpdateListener>>();
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const HEARTBEAT_INTERVAL = 30000;

setInterval(() => {
  const now = Date.now();
  updateListeners.forEach((listeners, workspaceId) => {
    listeners.forEach((listener) => {
      if (now - listener.lastPing > HEARTBEAT_INTERVAL) {
        try {
          listener.controller.enqueue(`: heartbeat\n\n`);
          listener.lastPing = now;
        } catch (error) {
          listeners.delete(listener);
          if (listeners.size === 0) {
            updateListeners.delete(workspaceId);
          }
        }
      }
    });
  });
}, HEARTBEAT_INTERVAL);

export function addListener(workspaceId: string, listener: UpdateListener) {
  if (!updateListeners.has(workspaceId)) {
    updateListeners.set(workspaceId, new Set());
  }
  updateListeners.get(workspaceId)?.add(listener);
}

export function removeListener(workspaceId: string, listener: UpdateListener) {
  updateListeners.get(workspaceId)?.delete(listener);
  if (updateListeners.get(workspaceId)?.size === 0) {
    updateListeners.delete(workspaceId);
  }
}

export async function broadcastUpdate(workspaceId: string, data: any) {
  const listeners = updateListeners.get(workspaceId);
  if (!listeners) return;

  const message = `data: ${JSON.stringify(data)}\n\n`;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      listeners.forEach((listener) => {
        try {
          listener.controller.enqueue(message);
          listener.lastPing = Date.now();
        } catch (error) {
          listeners.delete(listener);
        }
      });

      if (listeners.size === 0) {
        updateListeners.delete(workspaceId);
      }

      break;
    } catch (error) {
      retries++;
      if (retries < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error("Failed to broadcast update after retries:", error);
      }
    }
  }
}
