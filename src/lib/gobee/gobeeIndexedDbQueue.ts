'use client';

// ============================================================================
// GOBEE — COLA GPS OFFLINE EN INDEXEDDB + SCREEN WAKE LOCK
// Garantiza persistencia de telemetría en zonas sin cobertura celular y
// evita suspensión de pantalla mientras el conductor está En Línea.
// ============================================================================

const DB_NAME = 'gobee_gps_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'gps_queue';
const MAX_QUEUE_ITEMS = 500;

export interface QueuedGpsSample {
  id?: number;
  driverId: string;
  plate: string;
  category: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmh: number;
  accuracyM: number;
  orderId?: string | null;
  recordedAt: string;
}

function openGpsDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('recordedAt', 'recordedAt', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function enqueueOfflineGpsSample(sample: Omit<QueuedGpsSample, 'id'>): Promise<number> {
  const db = await openGpsDb();
  if (!db) return 0;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(sample);

      const countReq = store.count();
      countReq.onsuccess = () => {
        const total = countReq.result;
        if (total > MAX_QUEUE_ITEMS) {
          // Recortar los registros más antiguos
          const excess = total - MAX_QUEUE_ITEMS;
          let removed = 0;
          const cursorReq = store.openCursor();
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor && removed < excess) {
              cursor.delete();
              removed += 1;
              cursor.continue();
            }
          };
        }
        resolve(Math.min(total, MAX_QUEUE_ITEMS));
      };
      tx.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

export async function getOfflineGpsQueueCount(): Promise<number> {
  const db = await openGpsDb();
  if (!db) return 0;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

export async function flushOfflineGpsQueue(
  uploader: (batch: QueuedGpsSample[]) => Promise<boolean>
): Promise<{ synced: number; remaining: number }> {
  const db = await openGpsDb();
  if (!db) return { synced: 0, remaining: 0 };

  const items: QueuedGpsSample[] = await new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve((req.result as QueuedGpsSample[]) || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });

  if (items.length === 0) return { synced: 0, remaining: 0 };

  let ok = false;
  try {
    ok = await uploader(items);
  } catch {
    ok = false;
  }

  if (!ok) {
    return { synced: 0, remaining: items.length };
  }

  // Eliminar los elementos sincronizados
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const item of items) {
        if (typeof item.id === 'number') {
          store.delete(item.id);
        }
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });

  const remaining = await getOfflineGpsQueueCount();
  return { synced: items.length, remaining };
}

export interface WakeLockController {
  acquire: () => Promise<boolean>;
  release: () => Promise<void>;
  isActive: () => boolean;
}

export function createGobeeWakeLock(): WakeLockController {
  let sentinel: WakeLockSentinel | null = null;

  return {
    async acquire(): Promise<boolean> {
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
        return false;
      }
      try {
        if (sentinel && !sentinel.released) return true;
        sentinel = await navigator.wakeLock.request('screen');
        sentinel.addEventListener('release', () => {
          sentinel = null;
        });
        return true;
      } catch {
        return false;
      }
    },
    async release(): Promise<void> {
      try {
        if (sentinel && !sentinel.released) {
          await sentinel.release();
        }
      } catch {
        // Ignorar error al liberar
      } finally {
        sentinel = null;
      }
    },
    isActive(): boolean {
      return Boolean(sentinel && !sentinel.released);
    },
  };
}
