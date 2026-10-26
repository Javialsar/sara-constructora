/**
 * SARA STAYS - SMART LOCK IOT GATEWAY ADAPTER
 * Genera claves de acceso dinámicas con ventana temporal estricta y aleatoriedad criptográfica:
 * Válidas únicamente entre la hora oficial de check-in (15:00) y la hora de check-out (11:00).
 */
import crypto from "crypto"

export interface SmartLockAccess {
  stayCode: string
  reservationCode: string
  accessPin: string
  validFrom: string
  validUntil: string
  status: "activo" | "expirado" | "revocado"
  batteryLevelPct: number
  deviceModel: string
}

export function generateDynamicSmartLockPIN(
  stayCode: string,
  reservationCode: string,
  checkInDate: string,
  checkOutDate: string
): SmartLockAccess {
  // Genera un código de 6 dígitos criptográficamente seguro (#XXXXXX#)
  const randomSuffix = crypto.randomInt(100000, 999999)
  const pin = `#${randomSuffix}#`

  // Ventana temporal de acceso (Hora estándar check-in: 15:00 UTC-5 / Check-out: 11:00 UTC-5)
  const validFrom = `${checkInDate}T15:00:00-05:00`
  const validUntil = `${checkOutDate}T11:00:00-05:00`

  return {
    stayCode,
    reservationCode,
    accessPin: pin,
    validFrom,
    validUntil,
    status: "activo",
    batteryLevelPct: 94,
    deviceModel: "SARA-IoT Smart Lock Pro (Zigbee 3.0 / AES-128)"
  }
}

export function isSmartLockAccessValid(access: SmartLockAccess, atTimestamp: number = Date.now()): boolean {
  if (access.status !== "activo") return false
  const fromTime = new Date(access.validFrom).getTime()
  const untilTime = new Date(access.validUntil).getTime()
  return atTimestamp >= fromTime && atTimestamp <= untilTime
}
