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
  FileCheck,
  Ruler,
  Crown
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
  const [userPlan, setUserPlan] = useState("Pro Plan")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string>("1. ESTUDIO & PRESUPUESTACIÓN PRIVADA")

  const navGroups = [
    {
      title: "1. ESTUDIO & PRESUPUESTACIÓN PRIVADA",
      items: [
        { href: "/dashboard/presupuestos_reales", label: "Mesa de Presupuestos Reales", icon: FileSpreadsheet },
        { href: "/dashboard/takeoff", label: "SARA Take-Off (Planos 2D)", icon: Ruler },
        { href: "/dashboard/cotizador", label: "Cotizador Paramétrico Rápido", icon: Calculator },
        { href: "/dashboard/apus/bim", label: "SARA-BIM (Cómputos 3D)", icon: Cuboid },
      ]
    },
    {
      title: "2. CONTRATACIÓN PÚBLICA (SERCOP)",
      items: [
        { href: "/dashboard/sercop/radar", label: "Radar de Licitaciones SERCOP", icon: Search },
        { href: "/dashboard/sercop/proyectos", label: "Proyectos de Contratación Pública", icon: Building2 },
        { href: "/dashboard/sercop/agente", label: "🤖 Agente SARA-SERCOP (Normativa)", icon: ShieldCheck },
        { href: "/dashboard/sercop/vae", label: "Matriz VAE & Desagregación", icon: FileCheck },
      ]
    },
    {
      title: "3. CATÁLOGOS & BANCO DE APUS",
      items: [
        { href: "/dashboard/apus/rubros", label: "Banco Maestro de Rubros (APUs)", icon: Layers },
        { href: "/dashboard/apus/insumos", label: "Insumos, Cuadrillas & Equipos", icon: Box },
        { href: "/dashboard/apus/importador", label: "Importador Masivo (Excel & BIM)", icon: Database },
      ]
    },
    {
      title: "4. CONTROL & OPERACIÓN EN OBRA",
      items: [
        { href: "/dashboard/fiscaliza", label: "SARA-Fiscaliza (Parte Diario & GPS)", icon: HardHat },
        { href: "/dashboard/maquinaria", label: "SARA-Maquinaria (Logística)", icon: Truck },
      ]
    },
    {
      title: "5. FINANZAS, SRI & LEGAL",
      items: [
        { href: "/dashboard/metricas-sri", label: "Dashboard Financiero & SRI", icon: Receipt },
        { href: "/dashboard/docs", label: "SARA-Docs (Contratos & Minutas)", icon: FileText },
      ]
    },
    {
      title: "6. DIRECTORIO & CRM",
      items: [
        { href: "/dashboard/directorio/clientes", label: "Clientes (CRM)", icon: Users },
        { href: "/dashboard/directorio/proveedores", label: "Proveedores Aliados", icon: Briefcase },
        { href: "/dashboard/directorio/trabajadores", label: "Personal & Cuadrillas", icon: Wrench },
      ]
    },
    {
      title: "7. CONFIGURACIÓN & EMPRESA",
      items: [
        { href: "/dashboard/parametros", label: "Datos de Empresa, Logo & Parámetros", icon: Settings },
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
      if (
        group.items.some(i => i.href === pathname) ||
        (group.title === "3. CATÁLOGOS & BANCO DE APUS" && pathname === "/dashboard/apus/ai-rubros")
      ) {
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

        try {
          const { data: sub } = await supabase
            .from('suscripciones_saas')
            .select('plan_id')
            .eq('user_id', user.id)
            .maybeSingle()

          if (sub?.plan_id) {
            const planNames: Record<string, string> = {
              gratis: "Plan Gratuito",
              basico: "Plan Básico",
              pro: "Pro Plan",
              profesional: "Plan Profesional",
              empresarial: "Plan Empresarial"
            }
            setUserPlan(planNames[sub.plan_id.toLowerCase()] || sub.plan_id)
          }
        } catch (e) {
          console.error("Error al obtener suscripción:", e)
        }
      } else {
        router.push("/login")
      }
    }
    fetchData()
  }, [])

  const renderNavItems = (collapsed = false) => (
    <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-2">
      {/* ACCESO RÁPIDO Y DESTACADO: MIS PLANES & SUSCRIPCIÓN (FUERA DE CONFIGURACIÓN) */}
      <div className="mb-3 px-0.5">
        <Link 
          href="/dashboard/planes"
          onClick={() => setIsMobileMenuOpen(false)}
          title="Mis Planes & Suscripción SARA Suite"
          className={`w-full flex items-center ${collapsed ? "justify-center w-11 h-11 mx-auto" : "justify-between px-3 py-2.5"} rounded-2xl font-bold transition-all duration-300 ${
            pathname === "/dashboard/planes"
              ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400"
              : "bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-900 border border-blue-400/40 text-blue-100 hover:border-blue-400 hover:bg-blue-900/40 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`p-1.5 rounded-xl shrink-0 transition-transform ${
              pathname === "/dashboard/planes"
                ? "bg-white/20 text-white"
                : "bg-gradient-to-br from-amber-400/20 to-blue-500/20 text-amber-300 border border-amber-400/40"
            }`}>
              <Sparkles size={collapsed ? 20 : 17} className={pathname === "/dashboard/planes" ? "" : "animate-pulse"} />
            </div>
            {!collapsed && (
              <div className="text-left overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-white">Mis Planes</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-blue-300 font-medium truncate">
                  Elegir o Cambiar Plan
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                pathname === "/dashboard/planes"
                  ? "bg-white/20 text-white"
                  : "bg-blue-500/30 text-blue-200 border border-blue-400/30"
              }`}>
                {userPlan}
              </span>
              <ChevronRight size={14} className="text-blue-300" />
            </div>
          )}
        </Link>
      </div>

      {navGroups.map((group, groupIdx) => {
        const isOpen = openGroup === group.title
        const hasActiveItem = group.items.some(i => i.href === pathname) ||
          (group.title === "4. CATÁLOGOS & BANCO DE APUS" && pathname === "/dashboard/apus/ai-rubros")
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
                  const isActive = pathname === item.href || (item.href === "/dashboard/apus/rubros" && pathname === "/dashboard/apus/ai-rubros")
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
          <div className="p-3 border-t border-white/10 space-y-2">
            <Link
              href="/dashboard/planes"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-400/30 text-xs font-bold text-white hover:border-blue-400 transition-all"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <span>Plan: <span className="text-blue-300 font-extrabold">{userPlan}</span></span>
              </div>
              <span className="text-[10px] uppercase font-bold text-blue-400">Ver Planes →</span>
            </Link>
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

          <div className="p-3 border-t border-white/10 space-y-2">
            {!isSidebarCollapsed && (
              <Link
                href="/dashboard/planes"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-400/30 text-xs font-bold text-white hover:border-blue-400 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="text-left overflow-hidden">
                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Tu Suscripción</p>
                    <p className="text-xs font-extrabold text-blue-200 truncate">{userPlan}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-blue-400 group-hover:text-blue-300 shrink-0">Mejorar →</span>
              </Link>
            )}
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
              <div className="hidden xl:flex text-sm text-gray-500 dark:text-gray-400 font-medium items-center gap-2">
                <span>Hola, {userName}</span>
                <Link
                  href="/dashboard/planes"
                  title="Administrar o Mejorar mi Plan SARA Suite"
                  className="text-xs px-2.5 py-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-lg shadow-sm border border-blue-400/40 flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Sparkles size={13} className="text-amber-300" />
                  <span>{userPlan}</span>
                </Link>
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
