"use client"
import React from "react"
import { usePathname } from "next/navigation"

interface PublicLayoutChromeProps {
  children: React.ReactNode
  header: React.ReactNode
  footer: React.ReactNode
  mobileActionBar: React.ReactNode
  chatbot: React.ReactNode
  splashScreen: React.ReactNode
}

export default function PublicLayoutChrome({
  children,
  header,
  footer,
  mobileActionBar,
  chatbot,
  splashScreen
}: PublicLayoutChromeProps) {
  const pathname = usePathname()

  // Ocultar cabecera de menú, pie de página, barra móvil y chatbot en la pantalla de autenticación
  const isAuthPage = pathname === "/airbnb/auth" || pathname.startsWith("/airbnb/auth/")

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full flex flex-col bg-slate-950">
        {children}
      </main>
    )
  }

  return (
    <>
      {splashScreen}
      {header}
      <main className="flex-1">
        {children}
      </main>
      {footer}
      {mobileActionBar}
      {chatbot}
    </>
  )
}
