/**
 * Cola Offline en IndexedDB para Telemetría Rural / Canteras (SARA FLETES v2.0).
 * Persiste coordenadas e hitos cuando cae la red 4G y los sincroniza automáticamente al reconectar.
 */

export interface OfflineTelemetryRecord {
  id?: number;
  orderId: string;
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  accuracyM: number;
  isSnapped: boolean;
  eventType: 'HEARTBEAT' | 'ARRIVED_PICKUP' | 'ARRIVED_DROPOFF' | 'OFFLINE_SYNC' | 'RIDECHECK_ANOMALY';
  recordedAt: string;
}

const DB_NAME = 'sara_fletes_telemetry_v2';
const DB_VERSION = 1;
const STORE_NAME = 'telemetry_queue';

function openTelemetryDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB no disponible en este entorno'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('orderId', 'orderId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Error abriendo IndexedDB'));
  });
}

export async function enqueueTelemetryPoint(record: Omit<OfflineTelemetryRecord, 'id'>): Promise<void> {
  const db = await openTelemetryDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(record);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error('Error encolando punto de telemetría offline'));
    };
  });
}

export async function getPendingTelemetryRecords(limit = 100): Promise<OfflineTelemetryRecord[]> {
  const db = await openTelemetryDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const results: OfflineTelemetryRecord[] = [];
    const cursorReq = store.openCursor();

    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor && results.length < limit) {
        results.push(cursor.value as OfflineTelemetryRecord);
        cursor.continue();
      } else {
        db.close();
        resolve(results);
      }
    };

    cursorReq.onerror = () => {
      db.close();
      reject(cursorReq.error ?? new Error('Error leyendo cola offline'));
    };
  });
}

export async function deleteTelemetryRecords(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openTelemetryDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const id of ids) {
      store.delete(id);
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error('Error eliminando registros sincronizados'));
    };
  });
}

export async function flushTelemetryQueue(
  sender: (batch: OfflineTelemetryRecord[]) => Promise<boolean>
): Promise<{ flushed: number; remaining: number }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const pending = await getPendingTelemetryRecords(200).catch(() => []);
    return { flushed: 0, remaining: pending.length };
  }

  const batch = await getPendingTelemetryRecords(50).catch(() => []);
  if (batch.length === 0) {
    return { flushed: 0, remaining: 0 };
  }

  const ok = await sender(batch);
  if (ok) {
    const ids = batch.map((r) => r.id).filter((id): id is number => typeof id === 'number');
    await deleteTelemetryRecords(ids);
    const remaining = (await getPendingTelemetryRecords(200).catch(() => [])).length;
    return { flushed: ids.length, remaining };
  }

  return { flushed: 0, remaining: batch.length };
}
