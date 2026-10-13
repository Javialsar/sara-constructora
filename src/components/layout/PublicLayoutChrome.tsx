"use client"
import React from "react"
import { usePathname } from "next/navigation"
import HeaderConstructora from "./HeaderConstructora"

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

  // Ocultar cabecera corporativa en portales independientes (stays, airbnb, inmobiliaria)
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

  // En el portal de clientes (tanto pantalla de login como dashboard privado), 
  // retirar el menú superior corporativo y footer para una experiencia limpia y privada sin opciones externas
  const isPortal = pathname.startsWith("/portal")
  if (isPortal) {
    return (
      <main className="min-h-screen w-full flex flex-col bg-[#090e11]">
        {children}
        {chatbot}
      </main>
    )
  }

  // En todas las páginas del módulo Constructora (catálogo /proyectos y detalle de cada obra /proyectos/[id]),
  // mostrar el menú y logotipo oficial del módulo Constructora (HeaderConstructora)
  const isConstructoraProyectos = pathname.startsWith("/proyectos")

  return (
    <>
      {splashScreen}
      {isConstructoraProyectos ? <HeaderConstructora /> : header}
      <main className="flex-1">
        {children}
      </main>
      {footer}
      {mobileActionBar}
      {chatbot}
    </>
  )
}
