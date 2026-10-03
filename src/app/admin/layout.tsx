"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  HardHat, 
  Image as ImageIcon, 
  MessageSquareQuote,
  FileText,
  Settings,
  LogOut,
  Newspaper,
  HelpCircle,
  Menu,
  X,
  Calculator,
  Briefcase,
  Wrench,
  ChevronDown,
  ChevronRight,
  History,
  Key,
  Building2,
  Sparkles,
  CreditCard, DollarSign
, ShieldAlert, Trash2 , Activity, Bell } , Send } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [logo, setLogo] = useState("/logo-hero.png")
  const [userName, setUserName] = useState("Administrador")
  const [userInitials, setUserInitials] = useState("A")
  
  // Guardamos solo el nombre de la categoría abierta para que las demás se cierren solas
  const [openGroup, setOpenGroup] = useState<string>("PANEL PRINCIPAL")

  const toggleGroup = (title: string) => {
    // Si la categoría ya está abierta y le damos clic, la cerramos (queda todo colapsado). 
    // Si estaba cerrada, la abrimos (y automáticamente se cierra cualquier otra).
    setOpenGroup(prev => prev === title ? "" : title)
  }

  const [userRole, setUserRole] = useState("Administrador")
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('sara_theme') || ''
    document.documentElement.classList.remove('theme-ocean', 'theme-gold', 'theme-apucons', 'theme-sunset', 'theme-nordic', 'theme-ruby')
    if (savedTheme) {
      document.documentElement.classList.add(savedTheme)
    }
  }, [])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Auto-expandir el grupo correspondiente a la ruta activa
  useEffect(() => {
    if (!pathname) return
    for (const group of allNavGroups) {
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
        if (user.user_metadata?.full_name) {
            const name = user.user_metadata.full_name
            setUserName(name)
            const parts = name.split(' ')
            setUserInitials(parts.length > 1 ? parts[0][0] + parts[1][0] : name.substring(0, 2).toUpperCase())
        }
        
        if (user.user_metadata?.role) {
            if (user.user_metadata.role === 'tecnico') {
                setUserRole('Técnico')
            } else if (user.user_metadata.role === 'admin') {
                setUserRole('Administrador')
            }
        }
      }

      const { data } = await supabase.from('configuracion_empresa').select('logo_url').limit(1).single()
      if (data?.logo_url) {
        setLogo(data.logo_url)
      }
    }
    fetchData()
  }, [])

  const allNavGroups = [
    {
      title: "PANEL PRINCIPAL",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      title: "MIS PROYECTOS",
      items: [
        { href: "/admin/proyectos", label: "Proyectos (Obras)", icon: HardHat },
        { href: "/admin/avances", label: "Avances de Obra", icon: ImageIcon },
        { href: "/admin/documentos", label: "Gestor Documental", icon: FileText },
      ]
    },
    {
      title: "DIRECTORIO Y RECURSOS",
      items: [
        { href: "/admin/clientes", label: "Clientes (CRM)", icon: Users },
        { href: "/admin/proveedores", label: "Proveedores", icon: Briefcase },
        { href: "/admin/trabajadores", label: "Personal de Obra", icon: Wrench },
      ]
    },
    {
      title: "MÓDULO APU-SARA",
      items: [
        { href: "/admin/parametros", label: "Parámetros Globales", icon: Settings },
        { href: "/admin/apus/insumos", label: "Catálogo de Insumos", icon: FileText },
        { href: "/admin/apus/rubros", label: "Rubros", icon: Calculator },
        { href: "/admin/presupuestos_reales", label: "Presupuestos Reales", icon: Calculator },
        { href: "/admin/apus/planes", label: "Planes de Suscripción", icon: CreditCard },
        { href: "/admin/pagos", label: "Aprobación de Pagos", icon: DollarSign },
      ]
    },
    {
      title: "COTIZACIONES RÁPIDAS",
      items: [
        { href: "/admin/cotizador", label: "Cotizador Automático", icon: Calculator },
        { href: "/admin/cotizaciones", label: "Cotizaciones Recibidas", icon: FileText },
      ]
    },
    {
      title: "GESTIÓN INMOBILIARIA",
      items: [
        { href: "/admin/inmobiliaria", label: "Gestión Inmobiliaria", icon: Building2 },
      ]
    },
    {
      title: "GESTIÓN STAYS (HOSPÉDATE)",
      items: [
        { href: "/admin/airbnb", label: "Gestión Stays (Hospédate)", icon: Sparkles },
      ]
    },
    {
      title: "PORTAL WEB",
      items: [
        { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
        { href: "/admin/faq", label: "Preguntas FAQ", icon: HelpCircle },
        { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote },
      ]
    },
    {
      title: "AUDITORÍA",
      items: [
        { href: "/admin/auditoria", label: "Ojo de Dios", icon: ShieldAlert },
          { href: "/admin/papelera", label: "Papelera", icon: Trash2 },
          { href: "/admin/historial", label: "Historial", icon: History },
        { href: "/admin/accesos", label: "Accesos", icon: Key },
      ]
    }
  ]
    
    // RBAC FRONTEND: Filtrar menú según el rol
    const navGroups = allNavGroups.map(cat => {
        if (userRole === 'tecnico' || userRole === 'Técnico') {
            // Técnicos no ven parámetros, maestros de APUs ni configuraciones web
            return {
                ...cat,
                items: cat.items.filter(i => 
                    i.href !== '/admin/parametros' &&
                    i.href !== '/admin/apus/insumos' &&
                    i.href !== '/admin/apus/rubros' &&
                    i.href !== '/admin/pagos' &&
                    i.href !== '/admin/cotizador'
                )
            }
        }
        return cat;
    }).filter(cat => cat.items.length > 0);

  return (
    <>
      {pathname === '/admin/login' ? (
        children
      ) : (
        <div className="flex h-screen bg-slate-100 overflow-hidden print:h-auto print:block print:bg-white">
      
      {/* Sidebar */}
      <aside className={`bg-brand-dark text-white flex flex-col h-full shadow-2xl z-20 print:hidden transition-all duration-300 ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
        {/* Header del sidebar */}
        <div className={`p-4 border-b border-white/10 flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"} gap-2`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 shrink-0 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
              <img src={logo} alt="SARA Logo" className="w-full h-full object-contain" />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="font-bold tracking-wider text-sm uppercase text-white">{userRole}</h1>
                <p className="text-[10px] text-brand-sage uppercase font-bold tracking-wider">SARA Constructora</p>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button 
              onClick={() => setIsSidebarCollapsed(true)} 
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              title="Colapsar menú (modo compacto)"
            >
              <ChevronRight className="rotate-180" size={16} />
            </button>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {/* MODO COLAPSADO (Solo Iconos en columna vertical, idéntico a la Imagen 2) */}
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-1">
              {navGroups.map((group, gIdx) => (
                <div key={gIdx} className="w-full">
                  {gIdx > 0 && <div className="border-t border-white/10 my-2 mx-2" />}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className={`w-11 h-11 mx-auto flex items-center justify-center rounded-xl transition-all my-1 ${
                          isActive 
                            ? "bg-brand-sage text-white shadow-lg ring-2 ring-brand-sage/40" 
                            : "text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Icon size={20} />
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            /* MODO EXPANDIDO (Con categorías y nombres de opción) */
            navGroups.map((group, groupIdx) => {
              const isOpen = openGroup === group.title;
              const hasActiveItem = group.items.some(i => i.href === pathname);
              return (
                <div key={groupIdx} className="mb-2">
                  <button 
                    onClick={() => toggleGroup(group.title)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                      hasActiveItem
                        ? "text-brand-sage font-bold bg-white/5"
                        : isOpen 
                          ? "bg-white/10 text-white" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{group.title}</span>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  
                  {isOpen && (
                    <div className="space-y-1 mt-1 pl-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link 
                            key={item.href}
                            href={item.href} 
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                              isActive 
                                ? "bg-brand-sage text-white shadow-md shadow-black/30 ring-1 ring-white/20" 
                                : "text-gray-300 hover:bg-white/10 hover:text-white font-medium"
                            }`}
                          >
                            <Icon size={18} className="shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-sm">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link 
            href="/admin/configuracion" 
            title="Configuración" 
            className={`flex items-center ${isSidebarCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3 py-2"} rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm mb-1`}
          >
            <Settings size={18} className="shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden font-medium">Configuración</span>}
          </Link>
          <button 
            title="Cerrar Sesión"
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/'
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
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-10 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            {/* Botón Menú Hamburguesa */}
            <button 
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="p-2 rounded-lg text-gray-600 hover:text-brand-dark hover:bg-gray-100 transition-colors focus:outline-none"
              title={isSidebarCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral (más espacio)"}
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Panel de Control</h2>
          </div>
                    <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-brand-dark transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div className="text-sm text-gray-500 font-medium">
              Hola, {userName !== "Administrador" ? userName : ""} <span className="text-xs ml-1 px-2 py-1 bg-gray-100 rounded text-brand-dark font-bold border border-gray-200">{userRole}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-sage flex items-center justify-center font-bold text-white shadow-sm">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 print:overflow-visible print:p-0">
          {children}
        </div>
      </main>
    </div>
      )}
    </>
  )
}
