/**
 * Gestión de preferencia de perfil UX en SARA-FLETES y utilidades de ruteo/origen de autenticación.
 *
 * IMPORTANTE (SEGURIDAD ZERO-TRUST):
 * - La preferencia almacenada en localStorage es EXCLUSIVAMENTE de experiencia de usuario (UX)
 *   para recordar qué tarjeta eligió el usuario en `/fletes`.
 * - NUNCA se utiliza para decisiones de autorización ni control de acceso.
 * - El panel de conductor (`/modulos/fletes/mi-perfil`) permanece protegido del lado del servidor
 *   por `src/proxy.ts` y validación de sesión JWT en Supabase.
 * - Nunca se almacenan tokens, credenciales ni datos personales (PII) en esta clave.
 */

export type FletesPerfil = 'cliente' | 'conductor';
export type FletesAuthRole = 'transportista' | 'cliente_fletes';

export const FLETES_PERFIL_STORAGE_KEY = 'sara_fletes_perfil';
const STORAGE_VERSION = 'v1';

const ALLOWED_PERFILES: ReadonlySet<FletesPerfil> = new Set<FletesPerfil>([
  'cliente',
  'conductor',
]);

export const FLETES_PERFIL_DESTINO: Record<FletesPerfil, string> = {
  cliente: '/modulos/fletes',
  conductor: '/modulos/fletes/mi-perfil',
};

const PERFIL_CHANGE_EVENT = 'sara-fletes-perfil-change';

/**
 * Lee y valida con allowlist la preferencia de perfil desde localStorage.
 * Envuelto en try/catch para soportar navegación privada o entornos sin storage.
 */
export function getStoredFletesPerfil(): FletesPerfil | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(FLETES_PERFIL_STORAGE_KEY);
    if (!raw) return null;

    // Formato versionado compacto "v1:cliente" | "v1:conductor"
    if (raw.startsWith(`${STORAGE_VERSION}:`)) {
      const candidate = raw.slice(STORAGE_VERSION.length + 1) as FletesPerfil;
      return ALLOWED_PERFILES.has(candidate) ? candidate : null;
    }

    // Soporte para JSON versionado { v: 1, perfil: 'cliente' | 'conductor' }
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw) as { v?: number; perfil?: string };
      if (
        parsed &&
        parsed.v === 1 &&
        typeof parsed.perfil === 'string' &&
        ALLOWED_PERFILES.has(parsed.perfil as FletesPerfil)
      ) {
        return parsed.perfil as FletesPerfil;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Persiste la preferencia de perfil ('cliente' | 'conductor') en localStorage.
 */
export function setStoredFletesPerfil(perfil: FletesPerfil): void {
  if (typeof window === 'undefined') return;
  if (!ALLOWED_PERFILES.has(perfil)) return;
  try {
    window.localStorage.setItem(
      FLETES_PERFIL_STORAGE_KEY,
      `${STORAGE_VERSION}:${perfil}`
    );
    window.dispatchEvent(new Event(PERFIL_CHANGE_EVENT));
  } catch {
    // Modo incógnito / cuota excedida: degradación elegante sin bloquear navegación
  }
}

/**
 * Limpia la preferencia de perfil almacenada.
 */
export function clearStoredFletesPerfil(): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(FLETES_PERFIL_STORAGE_KEY) !== null) {
      window.localStorage.removeItem(FLETES_PERFIL_STORAGE_KEY);
      window.dispatchEvent(new Event(PERFIL_CHANGE_EVENT));
    }
  } catch {
    // Ignorar errores de acceso a storage en modo privado
  }
}

/**
 * Suscripción compatible con React 19 `useSyncExternalStore`.
 */
export function subscribeFletesPerfil(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const handleStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === FLETES_PERFIL_STORAGE_KEY) {
      onStoreChange();
    }
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(PERFIL_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(PERFIL_CHANGE_EVENT, onStoreChange);
  };
}

/**
 * Mapea el query param `?rol=cliente|conductor` al rol de registro en FletesAuth.
 * Allowlist estricta:
 * - 'cliente'   -> 'cliente_fletes'
 * - 'conductor' -> 'transportista'
 * - cualquier otro valor -> 'transportista' (por defecto del flujo de conductor)
 */
export function resolveInitialAuthRole(
  rolParam: string | null | undefined
): FletesAuthRole {
  const normalized = (rolParam ?? '').trim().toLowerCase();
  if (normalized === 'cliente') return 'cliente_fletes';
  if (normalized === 'conductor') return 'transportista';
  return 'transportista';
}

/**
 * Valida que `redirectTo` sea una ruta relativa del mismo origen que inicie con `/modulos/fletes`.
 * Rechaza `//`, `/\`, esquemas (`http:`, `javascript:`), caracteres de control, variantes codificadas
 * (`%2f`, `%5c`, `..`) y bucles hacia `/modulos/fletes/auth`.
 */
export function sanitizeFletesRedirectTo(
  rawRedirectTo: string | null | undefined
): string | null {
  if (!rawRedirectTo || typeof rawRedirectTo !== 'string') return null;
  const trimmed = rawRedirectTo.trim();
  if (trimmed.length === 0 || trimmed.length > 512) return null;

  // Rechazar caracteres de control, espacios o barras invertidas
  if (/[\u0000-\u001f\u007f\s\\]/.test(trimmed)) return null;

  // Debe iniciar con una única `/` (rechaza `//` y rutas relativas sin `/`)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;

  // Rechazar variantes codificadas de `/`, `\` o caracteres de control y segmentos `..`
  if (/%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(trimmed)) return null;
  if (trimmed.includes('..') || trimmed.includes('://')) return null;

  try {
    const base = 'https://sara.local';
    const parsed = new URL(trimmed, base);
    if (parsed.origin !== base) return null;

    const { pathname, search, hash } = parsed;
    const isFletesPath =
      pathname === '/modulos/fletes' || pathname.startsWith('/modulos/fletes/');
    if (!isFletesPath) return null;

    // Evitar redirección circular a la página de autenticación
    if (
      pathname === '/modulos/fletes/auth' ||
      pathname.startsWith('/modulos/fletes/auth/')
    ) {
      return null;
    }

    return `${pathname}${search}${hash}`;
  } catch {
    return null;
  }
}

/**
 * Determina si el usuario autenticado tiene rol de transportista priorizando
 * `app_metadata` (controlado por servidor) sobre `user_metadata`.
 */
export function isTransportistaFromMetadata(
  appMetadata?: Record<string, unknown> | null,
  userMetadata?: Record<string, unknown> | null
): boolean {
  const appMeta = appMetadata ?? {};
  const userMeta = userMetadata ?? {};

  // Priorizar app_metadata sobre user_metadata para decisiones de rol/autorización
  const resolvedRole =
    typeof appMeta.role === 'string' && appMeta.role.trim() !== ''
      ? appMeta.role.trim()
      : typeof userMeta.role === 'string' && userMeta.role.trim() !== ''
        ? userMeta.role.trim()
        : undefined;

  if (resolvedRole === 'transportista') return true;
  if (resolvedRole === 'cliente_fletes') return false;

  const resolvedPlaca =
    typeof appMeta.placa === 'string' && appMeta.placa.trim() !== ''
      ? appMeta.placa.trim()
      : typeof userMeta.placa === 'string' && userMeta.placa.trim() !== ''
        ? userMeta.placa.trim()
        : undefined;

  return Boolean(resolvedPlaca);
}

/**
 * Calcula el destino final post-autenticación respetando `redirectTo` seguro y
 * garantizando que un cliente nunca sea redirigido a `/modulos/fletes/mi-perfil`.
 */
export function resolvePostAuthRedirect(
  rawRedirectTo: string | null | undefined,
  isTransportista: boolean
): string {
  const safeRedirect = sanitizeFletesRedirectTo(rawRedirectTo);

  if (safeRedirect) {
    const isDriverArea =
      safeRedirect === '/modulos/fletes/mi-perfil' ||
      safeRedirect.startsWith('/modulos/fletes/mi-perfil/') ||
      safeRedirect.startsWith('/modulos/fletes/mi-perfil?') ||
      safeRedirect.startsWith('/modulos/fletes/mi-perfil#');

    // Un cliente nunca debe ser redirigido al área exclusiva del conductor
    if (isDriverArea && !isTransportista) {
      return '/modulos/fletes';
    }
    return safeRedirect;
  }

  return isTransportista ? '/modulos/fletes/mi-perfil' : '/modulos/fletes';
}
