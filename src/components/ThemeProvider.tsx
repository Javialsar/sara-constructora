"use client"
import React, { useEffect, createContext, useContext, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export const SARA_THEMES = [
  { id: '', name: 'Sara Sage' },
  { id: 'theme-sunset', name: 'Zafiro & Naranja' },
  { id: 'theme-ocean', name: 'Constructor Ocean' },
  { id: 'theme-nordic', name: 'Nórdico Glaciar' },
  { id: 'theme-ruby', name: 'Titanio & Rubí' },
  { id: 'theme-gold', name: 'Elegante Dark' },
  { id: 'theme-apucons', name: 'APU Construcción' },
]

const ALL_THEME_CLASSES = ['theme-ocean', 'theme-gold', 'theme-apucons', 'theme-sunset', 'theme-nordic', 'theme-ruby']

interface SaraThemeContextType {
  currentTheme: string
  setThemeGlobal: (themeId: string) => Promise<void>
}

const SaraThemeContext = createContext<SaraThemeContextType>({
  currentTheme: '',
  setThemeGlobal: async () => {}
})

export const useSaraTheme = () => useContext(SaraThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>('')

  const applyThemeToDOM = (themeClass: string) => {
    if (typeof document === 'undefined') return
    
    // Remover todas las clases de tema existentes
    ALL_THEME_CLASSES.forEach(cls => {
      document.documentElement.classList.remove(cls)
      document.body.classList.remove(cls)
    })

    // Aplicar la nueva clase si existe
    if (themeClass && ALL_THEME_CLASSES.includes(themeClass)) {
      document.documentElement.classList.add(themeClass)
      document.body.classList.add(themeClass)
    }

    setCurrentTheme(themeClass)
  }

  const setThemeGlobal = async (themeId: string) => {
    const cleanId = themeId || ''
    applyThemeToDOM(cleanId)
    
    try {
      localStorage.setItem('sara_theme', cleanId)
      window.dispatchEvent(new CustomEvent('sara_theme_change', { detail: cleanId }))
    } catch {}

    // Persistir globalmente en Supabase a través del endpoint API
    try {
      await fetch('/api/configuracion/tema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: cleanId })
      })
    } catch (err) {
      console.warn('No se pudo sincronizar el tema con Supabase:', err)
    }
  }

  useEffect(() => {
    // 1. Leer inmediatamente de localStorage para respuesta instantánea
    const local = localStorage.getItem('sara_theme') || ''
    applyThemeToDOM(local)

    // 2. Consultar tema activo global en Supabase (Base de datos centralizada)
    const syncWithServer = async () => {
      try {
        const res = await fetch('/api/configuracion/tema', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data?.success && typeof data.tema === 'string') {
            const serverTheme = data.tema
            if (serverTheme !== local) {
              applyThemeToDOM(serverTheme)
              localStorage.setItem('sara_theme', serverTheme)
            }
          }
        }
      } catch (err) {
        // En caso de offline, se mantiene el de localStorage
      }
    }
    syncWithServer()

    // 3. Escuchar cambios de tema entre pestañas o disparados en la misma ventana
    const handleCustomChange = (e: any) => {
      if (typeof e.detail === 'string') {
        applyThemeToDOM(e.detail)
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sara_theme' && typeof e.newValue === 'string') {
        applyThemeToDOM(e.newValue)
      }
    }

    window.addEventListener('sara_theme_change', handleCustomChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('sara_theme_change', handleCustomChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <SaraThemeContext.Provider value={{ currentTheme, setThemeGlobal }}>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
      </NextThemesProvider>
    </SaraThemeContext.Provider>
  )
}
