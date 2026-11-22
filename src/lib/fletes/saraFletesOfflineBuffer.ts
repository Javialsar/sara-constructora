'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

export const LAST_GPS_STORAGE_KEY = 'sara_fletes_last_gps_v1';
export const OFFLINE_QUEUE_STORAGE_KEY = 'sara_fletes_offline_queue_v1';
export const SARA_OFFLINE_BUFFER_EVENT = 'sara:fletes:offline-buffer-updated';

const MAX_OFFLINE_QUEUE_SIZE = 200;

export interface LastKnownPosition {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

export interface OfflineTelemetryEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  attempts: number;
}

export interface FlushOfflineResult {
  synced: number;
  remaining: number;
}

export type OfflineSyncFn = (event: OfflineTelemetryEvent) => Promise<boolean>;

export interface UseSaraNetworkResilienceOptions {
  /** Custom async uploader invoked for each queued event during flush. */
  syncFn?: OfflineSyncFn;
  /** Automatically flush queued events when the browser transitions back online. Defaults to true when syncFn is provided. */
  autoFlushOnReconnect?: boolean;
}

export interface SaraNetworkResilienceState {
  isOnline: boolean;
  pendingCount: number;
  lastGpsAgeSec: number | null;
  isSyncing: boolean;
  flushNow: () => Promise<void>;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function notifyBufferUpdated(): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(SARA_OFFLINE_BUFFER_EVENT));
  } catch {
    // Ignore dispatch errors in restricted environments
  }
}

function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeSetItem(key: string, value: string): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    // QuotaExceededError or SecurityError in private browsing — fail silently
    return false;
  }
}

function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Persists the last known GPS coordinates for Dead Reckoning fallback when signal drops.
 */
export function saveLastKnownPosition(
  lat: number,
  lng: number,
  accuracy?: number
): LastKnownPosition | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const record: LastKnownPosition = {
    lat,
    lng,
    timestamp: Date.now(),
    ...(typeof accuracy === 'number' && Number.isFinite(accuracy) ? { accuracy } : {}),
  };

  if (safeSetItem(LAST_GPS_STORAGE_KEY, JSON.stringify(record))) {
    notifyBufferUpdated();
    return record;
  }
  return null;
}

/**
 * Reads the last persisted GPS position from localStorage (SSR-safe).
 */
export function getLastKnownPosition(): LastKnownPosition | null {
  const raw = safeGetItem(LAST_GPS_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const candidate = parsed as Record<string, unknown>;
    if (
      typeof candidate.lat !== 'number' ||
      !Number.isFinite(candidate.lat) ||
      typeof candidate.lng !== 'number' ||
      !Number.isFinite(candidate.lng) ||
      typeof candidate.timestamp !== 'number' ||
      !Number.isFinite(candidate.timestamp)
    ) {
      return null;
    }

    const result: LastKnownPosition = {
      lat: candidate.lat,
      lng: candidate.lng,
      timestamp: candidate.timestamp,
    };

    if (typeof candidate.accuracy === 'number' && Number.isFinite(candidate.accuracy)) {
      result.accuracy = candidate.accuracy;
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * Returns all pending offline telemetry events currently buffered in localStorage (SSR-safe).
 */
export function getPendingOfflineEvents(): OfflineTelemetryEvent[] {
  const raw = safeGetItem(OFFLINE_QUEUE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is OfflineTelemetryEvent => {
      if (typeof item !== 'object' || item === null) return false;
      const evt = item as Record<string, unknown>;
      return (
        typeof evt.id === 'string' &&
        typeof evt.type === 'string' &&
        typeof evt.timestamp === 'number' &&
        Number.isFinite(evt.timestamp) &&
        typeof evt.payload === 'object' &&
        evt.payload !== null &&
        !Array.isArray(evt.payload) &&
        typeof evt.attempts === 'number' &&
        Number.isFinite(evt.attempts)
      );
    });
  } catch {
    return [];
  }
}

function writeOfflineQueue(events: OfflineTelemetryEvent[]): boolean {
  const trimmed =
    events.length > MAX_OFFLINE_QUEUE_SIZE
      ? events.slice(events.length - MAX_OFFLINE_QUEUE_SIZE)
      : events;

  if (safeSetItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(trimmed))) {
    notifyBufferUpdated();
    return true;
  }

  // If storage quota is full, attempt to retain the most recent half of events
  if (trimmed.length > 1) {
    const reduced = trimmed.slice(Math.floor(trimmed.length / 2));
    if (safeSetItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(reduced))) {
      notifyBufferUpdated();
      return true;
    }
  }

  return false;
}

/**
 * Enqueues a telemetry event into the local offline buffer (SSR-safe).
 */
export function enqueueOfflineEvent(
  type: string,
  payload: Record<string, unknown>
): OfflineTelemetryEvent | null {
  if (!isBrowser() || !type.trim()) return null;

  const event: OfflineTelemetryEvent = {
    id: generateEventId(),
    type: type.trim(),
    payload,
    timestamp: Date.now(),
    attempts: 0,
  };

  const current = getPendingOfflineEvents();
  const saved = writeOfflineQueue([...current, event]);
  return saved ? event : null;
}

/**
 * Flushes buffered offline telemetry events sequentially using the provided sync function.
 * Events that fail to sync remain in the queue with an incremented attempt count.
 */
export async function flushOfflineEvents(
  syncFn: OfflineSyncFn
): Promise<FlushOfflineResult> {
  if (!isBrowser()) {
    return { synced: 0, remaining: 0 };
  }

  const snapshot = getPendingOfflineEvents();
  if (snapshot.length === 0) {
    return { synced: 0, remaining: 0 };
  }

  const snapshotIds = new Set(snapshot.map((evt) => evt.id));
  const failedEvents: OfflineTelemetryEvent[] = [];
  let synced = 0;

  for (const event of snapshot) {
    let ok = false;
    try {
      ok = await syncFn(event);
    } catch {
      ok = false;
    }

    if (ok) {
      synced += 1;
    } else {
      failedEvents.push({
        ...event,
        attempts: event.attempts + 1,
      });
    }
  }

  // Preserve any new events enqueued while flushing was in flight
  const latest = getPendingOfflineEvents();
  const concurrentAdditions = latest.filter((evt) => !snapshotIds.has(evt.id));
  const nextQueue = [...failedEvents, ...concurrentAdditions];

  writeOfflineQueue(nextQueue);

  return {
    synced,
    remaining: nextQueue.length,
  };
}

/**
 * Computes age in seconds of the last cached GPS fix, or null if none exists.
 */
export function getLastKnownPositionAgeSec(): number | null {
  const pos = getLastKnownPosition();
  if (!pos) return null;
  return Math.max(0, Math.floor((Date.now() - pos.timestamp) / 1000));
}

const defaultOptimisticSyncFn: OfflineSyncFn = async () => {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
};

function subscribeNetwork(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function getOnlineServerSnapshot(): boolean {
  return true;
}

function subscribeBuffer(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === LAST_GPS_STORAGE_KEY ||
      event.key === OFFLINE_QUEUE_STORAGE_KEY
    ) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(SARA_OFFLINE_BUFFER_EVENT, callback);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(SARA_OFFLINE_BUFFER_EVENT, callback);
  };
}

function getPendingCountSnapshot(): number {
  return getPendingOfflineEvents().length;
}

function getPendingCountServerSnapshot(): number {
  return 0;
}

function getLastGpsTimestampSnapshot(): number | null {
  return getLastKnownPosition()?.timestamp ?? null;
}

function getLastGpsTimestampServerSnapshot(): number | null {
  return null;
}

/**
 * React hook that tracks browser network connectivity, offline telemetry buffer depth,
 * and Dead Reckoning GPS cache age without blocking UI rendering.
 */
export function useSaraNetworkResilience(
  options?: UseSaraNetworkResilienceOptions
): SaraNetworkResilienceState {
  const isOnline = useSyncExternalStore(
    subscribeNetwork,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  );
  const pendingCount = useSyncExternalStore(
    subscribeBuffer,
    getPendingCountSnapshot,
    getPendingCountServerSnapshot
  );
  const lastGpsTimestamp = useSyncExternalStore(
    subscribeBuffer,
    getLastGpsTimestampSnapshot,
    getLastGpsTimestampServerSnapshot
  );

  const [nowMs, setNowMs] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const syncFnRef = useRef<OfflineSyncFn | undefined>(options?.syncFn);
  const isFlushingRef = useRef<boolean>(false);

  useEffect(() => {
    syncFnRef.current = options?.syncFn;
  }, [options?.syncFn]);

  const flushNow = useCallback(async () => {
    if (!isBrowser() || isFlushingRef.current) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const currentPending = getPendingOfflineEvents().length;
    if (currentPending === 0) {
      return;
    }

    isFlushingRef.current = true;
    setIsSyncing(true);
    try {
      const handler = syncFnRef.current ?? defaultOptimisticSyncFn;
      await flushOfflineEvents(handler);
    } finally {
      isFlushingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialTick = window.setTimeout(() => {
      setNowMs(Date.now());
    }, 0);

    const ageTimer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 10000);

    const handleOnline = () => {
      const shouldAutoFlush =
        options?.autoFlushOnReconnect ?? Boolean(syncFnRef.current);
      if (shouldAutoFlush && getPendingOfflineEvents().length > 0) {
        void flushNow();
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(ageTimer);
      window.removeEventListener('online', handleOnline);
    };
  }, [flushNow, options?.autoFlushOnReconnect]);

  const lastGpsAgeSec =
    lastGpsTimestamp !== null && nowMs !== null
      ? Math.max(0, Math.floor((nowMs - lastGpsTimestamp) / 1000))
      : null;

  return {
    isOnline,
    pendingCount,
    lastGpsAgeSec,
    isSyncing,
    flushNow,
  };
}
