"use client"

import { useEffect } from "react"
import { pingSession } from "@/app/actions/tracker"
import { createClient } from "@/lib/supabase/client"
import { clearOwnerSession } from "@/lib/services/ownerAuth"
import { clearGuestSession } from "@/lib/services/guestAuth"
import { useRouter } from "next/navigation"

export default function SessionTracker() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndPing = async () => {
      // 1. Verificar si hay un usuario autenticado real en Supabase
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // 2. Si no hay usuario en Supabase (ej: sesión cerrada remotamente),
        // DEBEMOS destruir cualquier sesión falsa/local que haya quedado viva.
        let sessionRevoked = false
        
        if (typeof window !== "undefined") {
          if (localStorage.getItem("sara_inmobiliaria_owner_session")) {
            clearOwnerSession()
            sessionRevoked = true
          }
          if (localStorage.getItem("sara_airbnb_guest_session")) {
            clearGuestSession() // O clearHostSession si existe
            sessionRevoked = true
          }
        }
        
        if (sessionRevoked) {
          // Opcional: Redirigir al inicio o forzar recarga para limpiar el estado
          router.refresh()
        }
      } else {
        // 3. Si hay usuario, hacemos ping para el Ojo de Dios
        pingSession()
      }
    }

    // Ping inmediato
    checkAuthAndPing()

    // Ping cada 2 minutos
    const interval = setInterval(checkAuthAndPing, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [router, supabase])

  return null // Tracker invisible
}
