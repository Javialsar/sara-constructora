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

  // Ocultar cabecera de menú corporativo, pie de página, chatbot y barra móvil en portales dedicados
  const isStandaloneModule = 
    pathname.startsWith("/stays") ||
    pathname.startsWith("/airbnb") || 
    pathname.startsWith("/inmobiliaria")

  if (isStandaloneModule) {
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
