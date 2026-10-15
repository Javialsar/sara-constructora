"use client"
import Link from "next/link"
import GlobalNotificationsBell from "@/components/GlobalNotificationsBell"
import Chatbot from "@/components/ui/Chatbot"
import ThemeToggle from "@/components/ThemeToggle"
import { usePathname, useRouter } from "next/navigation"
import { 
  Calculator,
  Briefcase, Users,
  Wrench,
  ChevronDown,
  ChevronRight,
  Settings, ShieldAlert, Palette,
  LogOut,
  Menu,
  Box,
  Layers,
  FileSpreadsheet,
  Database,
  Search,
  HardHat,
  Cuboid,
  Sparkles,
  FileText,
  Truck,
  Receipt,
  Cpu,
  Building2,
  ShieldCheck,
  FileCheck
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ProjectProvider } from "@/contexts/ProjectContext"
import ProjectSwitcher from "@/components/workspace/ProjectSwitcher"
import CreateProjectModal from "@/components/workspace/CreateProjectModal"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState("Usuario")
  const [userInitials, setUserInitials] = useState("U")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string>("2. ESTUDIO & PRESUPUESTACIÓN")

  const navGroups = [
    {
      title: "1. RED AGÉNTICA COLECTIVA (IA)",
      items: [
        { href: "/dashboard/agentes", label: "SARA-Ecosystem (8 Agentes)", icon: Cpu },
      ]
    },
    {
      title: "2. ESTUDIO & PRESUPUESTACIÓN",
      items: [
        { href: "/dashboard/presupuestos_reales", label: "Presupuestos de Obra & VAE", icon: FileSpreadsheet },
        { href: "/dashboard/cotizador", label: "Cotizador Paramétrico Rápido", icon: Calculator },
        { href: "/dashboard/apus/bim", label: "SARA-BIM (Cómputos 3D)", icon: Cuboid },
      ]
    },
    {
      title: "3. CONTRATACIÓN PÚBLICA (SERCOP)",
      items: [
        { href: "/dashboard/sercop/radar", label: "Radar de Licitaciones SERCOP", icon: Search },
        { href: "/dashboard/sercop/proyectos", label: "Proyectos de Contratación Pública", icon: Building2 },
        { href: "/dashboard/sercop/agente", label: "🤖 Agente SARA-SERCOP (Normativa)", icon: ShieldCheck },
        { href: "/dashboard/sercop/vae", label: "Matriz VAE & Desagregación", icon: FileCheck },
      ]
    },
    {
      title: "4. CATÁLOGOS & BANCO DE APUS",
      items: [
        { href: "/dashboard/apus/rubros", label: "Catálogo de Rubros (APUs)", icon: Layers },
        { href: "/dashboard/apus/ai-rubros", label: "SARA-AI-Rubros (Generador IA)", icon: Sparkles },
        { href: "/dashboard/apus/insumos", label: "Catálogo de Insumos (Material/MO)", icon: Box },
        { href: "/dashboard/apus/importador", label: "Importador Masivo (Excel)", icon: Database },
      ]
    },
    {
      title: "5. CONTROL & OPERACIÓN EN OBRA",
      items: [
        { href: "/dashboard/fiscaliza", label: "SARA-Fiscaliza (Parte Diario & GPS)", icon: HardHat },
        { href: "/dashboard/maquinaria", label: "SARA-Maquinaria (Logística)", icon: Truck },
      ]
    },
    {
      title: "6. FINANZAS, SRI & LEGAL",
      items: [
        { href: "/dashboard/metricas-sri", label: "Dashboard Financiero & SRI", icon: Receipt },
        { href: "/dashboard/docs", label: "SARA-Docs (Contratos & Minutas)", icon: FileText },
      ]
    },
    {
      title: "7. DIRECTORIO & CRM",
      items: [
        { href: "/dashboard/directorio/clientes", label: "Clientes (CRM)", icon: Users },
        { href: "/dashboard/directorio/proveedores", label: "Proveedores Aliados", icon: Briefcase },
        { href: "/dashboard/directorio/trabajadores", label: "Personal & Cuadrillas", icon: Wrench },
      ]
    },
    {
      title: "8. CONFIGURACIÓN & EMPRESA",
      items: [
        { href: "/dashboard/parametros", label: "Datos de Empresa & Facturación", icon: Settings },
        { href: "/dashboard/marca", label: "Membrete Oficial & PDF", icon: Palette },
        { href: "/dashboard/planes", label: "Mi Plan SARA Suite", icon: Sparkles },
        { href: "/dashboard/perfil", label: "Seguridad & Cuenta", icon: ShieldAlert },
      ]
    }
  ]

  const toggleGroup = (title: string) => {
    setOpenGroup(prev => prev === title ? "" : title)
  }

  useEffect(() => {
    if (!pathname) return
    setIsMobileMenuOpen(false)
    for (const group of navGroups) {
      if (group.items.some(i => i.href === pathname)) {
        setOpenGroup(group.title)
        break
      }
    }
  }, [pathname])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuario"
        setUserName(name)
        setUserInitials(name.substring(0, 2).toUpperCase())
      } else {
        router.push("/login")
      }
    }
    fetchData()
  }, [])

  const renderNavItems = (collapsed = false) => (
    <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-2">
      {navGroups.map((group, groupIdx) => {
        const isOpen = openGroup === group.title
        const hasActiveItem = group.items.some(i => i.href === pathname)
        return (
          <div 
            key={groupIdx} 
            className={`mb-3 transition-all duration-300 rounded-2xl ${
              hasActiveItem 
                ? "bg-gradient-to-br from-blue-950/90 via-indigo-950/80 to-slate-900 border-2 border-blue-400/60 shadow-lg shadow-blue-500/15 p-2" 
                : "bg-slate-950/30 border border-white/5 p-1"
            }`}
          >
            {!collapsed && (
              <button 
                onClick={() => toggleGroup(group.title)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  hasActiveItem 
                    ? "text-blue-200 bg-blue-500/30 border border-blue-400/40 shadow-xs" 
                    : isOpen 
                      ? "bg-white/10 text-white" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  {hasActiveItem && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-sm shadow-blue-400" />
                  )}
                  <span>{group.title}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {hasActiveItem && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-blue-400 text-slate-950">
                      En Curso
                    </span>
                  )}
                  {isOpen ? <ChevronDown size={14} className={hasActiveItem ? "text-blue-300" : ""} /> : <ChevronRight size={14} />}
                </div>
              </button>
            )}
            
            {(isOpen || collapsed) && (
              <div className={`space-y-1 mt-1.5 ${collapsed ? "" : "pl-1"}`}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      title={item.label}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center ${collapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3 py-2.5"} rounded-xl font-bold transition-all ${
                        isActive 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/50 ring-1 ring-white/20" 
                          : hasActiveItem
                            ? "text-slate-200 hover:bg-white/10 hover:text-white"
                            : "text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon size={collapsed ? 20 : 18} className="shrink-0" />
                      {!collapsed && <span className="truncate text-xs md:text-sm font-semibold">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )

  return (
    <ProjectProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
        {/* Mobile Drawer Overlay */}
        {isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs md:hidden transition-opacity"
          />
        )}

        {/* Mobile Drawer */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
                <span className="text-slate-900 font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="font-bold tracking-wider text-sm uppercase text-white">SaaS APU</h1>
                <p className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Sara Constructora</p>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <ChevronDown size={20} className="rotate-90" />
            </button>
          </div>
          {renderNavItems(false)}
          <div className="p-3 border-t border-white/10">
            <button 
              title="Cerrar Sesión"
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/')
              }} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm"
            >
              <LogOut size={18} className="shrink-0" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex ${isSidebarCollapsed ? "w-20" : "w-72"} shrink-0 bg-slate-900 text-white flex-col transition-all duration-300 z-20 print:hidden shadow-xl`}>
          {/* Header del sidebar */}
          <div className={`p-4 border-b border-white/10 flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"} gap-2`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 shrink-0 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
                <span className="text-slate-900 font-bold text-xl">S</span>
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden whitespace-nowrap">
                  <h1 className="font-bold tracking-wider text-sm uppercase text-white">SaaS APU</h1>
                  <p className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Sara Constructora</p>
                </div>
              )}
            </div>
          </div>

          {renderNavItems(isSidebarCollapsed)}

          <div className="p-3 border-t border-white/10">
            <button 
              title="Cerrar Sesión"
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/')
              }} 
              className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3 py-2"} rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm`}
            >
              <LogOut size={18} className="shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden font-medium">Cerrar Sesión</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden print:overflow-visible print:block">
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 z-10 shrink-0 print:hidden shadow-sm transition-colors gap-4">
            <div className="flex items-center gap-3 shrink-0">
              {/* Botón para abrir Drawer en Móvil o colapsar en Desktop */}
              <button 
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsMobileMenuOpen(prev => !prev)
                  } else {
                    setIsSidebarCollapsed(prev => !prev)
                  }
                }}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="Alternar menú de navegación"
              >
                <Menu size={22} />
              </button>
              <div className="hidden lg:flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">SaaS APU</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Suite 2026
                </span>
              </div>
            </div>

            {/* Selector de Obra / Workspace Switcher Central */}
            <div className="flex-1 flex justify-center max-w-xl">
              <ProjectSwitcher />
            </div>

            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <div className="hidden xl:flex text-sm text-gray-500 dark:text-gray-400 font-medium items-center gap-1.5">
                <span>Hola, {userName}</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold rounded border border-blue-200 dark:border-blue-800">Pro Plan</span>
              </div>
              <ThemeToggle />
              <GlobalNotificationsBell destinatarioTipo="cliente_apu" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white/10">
                {userInitials}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 print:overflow-visible print:p-0">
            {children}
          </div>
          <Chatbot />
        </main>
      </div>
      <CreateProjectModal />
    </ProjectProvider>
  )
}
