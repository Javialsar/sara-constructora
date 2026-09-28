"use client"

export interface OwnerProfile {
  id: string
  nombre: string
  apellido: string
  cedula: string
  email: string
  telefono: string
  ciudad?: string
  avatarUrl?: string
  fechaRegistro?: string
}

const OWNER_STORAGE_KEY = "sara_inmobiliaria_owner_session"

export function getOwnerSession(): OwnerProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(OWNER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setOwnerSession(profile: OwnerProfile): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(profile))
    window.dispatchEvent(new Event("owner-session-change"))
  } catch (err) {
    console.error("Error guardando sesión de propietario:", err)
  }
}

export function clearOwnerSession(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(OWNER_STORAGE_KEY)
    window.dispatchEvent(new Event("owner-session-change"))
  } catch (err) {
    console.error("Error eliminando sesión de propietario:", err)
  }
}
