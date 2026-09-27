"use client"

export interface GuestProfile {
  id: string
  nombre: string
  apellido: string
  cedula: string
  email: string
  telefono: string
  ciudad?: string
  ciudadPais?: string
  avatarUrl?: string
  qrCuenta?: string
  fechaRegistro?: string
}

const GUEST_STORAGE_KEY = "sara_airbnb_guest_session"

export function getGuestSession(): GuestProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setGuestSession(profile: GuestProfile): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(profile))
    window.dispatchEvent(new Event("guest-session-change"))
  } catch (err) {
    console.error("Error guardando sesión de huésped:", err)
  }
}

export function clearGuestSession(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY)
    window.dispatchEvent(new Event("guest-session-change"))
  } catch (err) {
    console.error("Error eliminando sesión de huésped:", err)
  }
}
