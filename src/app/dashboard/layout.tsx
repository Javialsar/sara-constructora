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
  FileSpreadsheet
  Database,
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

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
  const [openGroup, setOpenGroup] = useState<string>("APU Y PRESUPUESTOS")

  const navGroups = [
    {
      title: "APU Y PRESUPUESTOS",
      items: [
        { href: "/dashboard/cotizador", label: "Cotizador Automático", icon: Calculator },
        { href: "/dashboard/presupuestos_reales", label: "Presupuestos Reales", icon: FileSpreadsheet },
        { href: "/dashboard/apus/rubros", label: "Mis Rubros (Recetas)", icon: Layers },
        { href: "/dashboard/apus/insumos", label: "Mis Insumos", icon: Box },
      ]
    },
    {
      title: "DIRECTORIO Y RECURSOS",
      items: [
        { href: "/dashboard/directorio/clientes", label: "Mis Clientes (CRM)", icon: Users },
        { href: "/dashboard/directorio/proveedores", label: "Mis Proveedores", icon: Briefcase },
        { href: "/dashboard/directorio/trabajadores", label: "Mi Personal de Obra", icon: Wrench },
        { href: "/dashboard/importador", label: "Importar Excel Masivo", icon: Database }
      ]
    },
    {
      title: "CUENTA",
      items: [
        { href: "/dashboard/planes", label: "Mi Plan / Suscripción", icon: Settings },
        { href: "/dashboard/marca", label: "Marca y Reportes", icon: Palette },
          { href: "/dashboard/perfil", label: "Seguridad y Accesos", icon: ShieldAlert },
      ]
    }
  ]

  const toggleGroup = (title: string) => {
    setOpenGroup(prev => prev === title ? "" : title)
  }

  useEffect(() => {
    if (!pathname) return
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
        // Redirigir al login si no hay sesión
        router.push("/login")
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? "w-20" : "w-64"} shrink-0 bg-slate-900 text-white flex flex-col transition-all duration-300 z-20 print:hidden shadow-xl`}>
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

        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {navGroups.map((group, groupIdx) => {
            const isOpen = openGroup === group.title;
            const hasActiveItem = group.items.some(i => i.href === pathname);
            return (
              <div key={groupIdx} className="mb-2">
                {!isSidebarCollapsed && (
                  <button 
                    onClick={() => toggleGroup(group.title)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                      hasActiveItem ? "text-blue-400 font-bold bg-white/5" : isOpen ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{group.title}</span>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
                
                {(isOpen || isSidebarCollapsed) && (
                  <div className={`space-y-1 mt-1 ${isSidebarCollapsed ? "" : "pl-1"}`}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link 
                          key={item.href}
                          href={item.href} 
                          title={item.label}
                          className={`flex items-center ${isSidebarCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3 py-2.5"} rounded-xl font-bold transition-all ${
                            isActive ? "bg-blue-600 text-white shadow-md shadow-black/30" : "text-gray-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <Icon size={isSidebarCollapsed ? 20 : 18} className="shrink-0" />
                          {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-sm">{item.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-10 shrink-0 print:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">SaaS Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 font-medium">
              Hola, {userName} <span className="text-xs ml-1 px-2 py-1 bg-blue-100 rounded text-blue-800 font-bold border border-blue-200">Pro Plan</span>
            </div>
            <ThemeToggle />
              <GlobalNotificationsBell destinatarioTipo="cliente_apu" />
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
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
  )
}
