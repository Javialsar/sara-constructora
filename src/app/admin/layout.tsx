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
  ChevronRight
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [logo, setLogo] = useState("/images/logo-sara.png")
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
    const savedTheme = localStorage.getItem('sara_theme')
    if(savedTheme) {
      document.documentElement.classList.add(savedTheme)
    }
  }, [])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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

  const navGroups = [
    {
      title: "PANEL PRINCIPAL",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/proyectos", label: "Proyectos (Obras)", icon: HardHat },
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
      title: "PORTAL WEB",
      items: [
        { href: "/admin/avances", label: "Avances de Obra", icon: ImageIcon },
        { href: "/admin/documentos", label: "Gestor Documental", icon: FileText },
        { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
        { href: "/admin/faq", label: "Preguntas FAQ", icon: HelpCircle },
        { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote },
      ]
    }
  ]

  return (
    <>
      {pathname === '/admin/login' ? (
        children
      ) : (
        <div className="flex h-screen bg-slate-100 overflow-hidden print:h-auto print:block print:bg-white">
      
      {/* Sidebar */}
      <aside className={`bg-brand-dark text-white flex flex-col h-full shadow-2xl z-20 print:hidden transition-all duration-300 ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
        <div className="p-6 border-b border-white/10 flex items-center gap-3 justify-center">
          <div className="w-8 h-8 shrink-0 bg-white rounded flex items-center justify-center p-1">
            <img src={logo} alt="SARA Logo" className="w-full h-full object-contain" />
          </div>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold tracking-wider text-sm uppercase">{userRole}</h1>
              <p className="text-[10px] text-brand-sage uppercase">SARA Constructora</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {navGroups.map((group, groupIdx) => {
            const isOpen = openGroup === group.title;
            return (
              <div key={groupIdx} className="mb-2">
                <button 
                  onClick={() => { if(isSidebarCollapsed) setIsSidebarCollapsed(false); toggleGroup(group.title); }}
                  className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"} px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                    isOpen ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {!isSidebarCollapsed && <span>{group.title}</span>}
                  {isSidebarCollapsed ? <span className="font-bold text-lg">...</span> : (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                </button>
                
                {isOpen && (
                  <div className="space-y-1 mt-1">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link 
                          key={item.href}
                          href={item.href} 
                          title={isSidebarCollapsed ? item.label : undefined}
                          className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg font-medium transition-colors ${
                            isActive 
                              ? "bg-brand-sage text-brand-dark" 
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon size={18} className="shrink-0" />
                          {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/admin/configuracion" title={isSidebarCollapsed ? "Configuración" : undefined} className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors text-sm mb-1`}>
            <Settings size={18} className="shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">Configuración</span>}
          </Link>
          <button 
            title={isSidebarCollapsed ? "Cerrar Sesión" : undefined}
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/'
            }} 
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm`}
          >
            <LogOut size={18} className="shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden print:overflow-visible print:block">
        {/* Top Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shrink-0 print:hidden">
            <h2 className="text-xl font-bold text-gray-800">Panel de Control</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 font-medium">
                Hola, {userName !== "Administrador" ? userName : ""} <span className="text-xs ml-1 px-2 py-1 bg-gray-100 rounded text-brand-dark font-bold border border-gray-200">{userRole}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-brand-sage flex items-center justify-center font-bold text-brand-dark">
                {userInitials}
              </div>
            </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 print:overflow-visible print:p-0">
          {children}
        </div>
      </main>
    </div>
      )}
    </>
  )
}
