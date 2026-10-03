"use client"
import { useEffect } from "react"

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
      console.warn("No se pudo registrar el service worker:", err)
    })
  }, [])

  return null
}
