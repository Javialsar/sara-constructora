"use client"

import { useEffect } from "react"
import { pingSession } from "@/app/actions/tracker"

export default function SessionTracker() {
  useEffect(() => {
    // Ping immediately on mount
    pingSession()

    // Ping every 2 minutes while the user keeps the app open
    const interval = setInterval(() => {
      pingSession()
    }, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null // Invisible tracker
}
