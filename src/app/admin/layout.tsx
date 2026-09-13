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
  Newspaper
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

  useEffect(() => {
    const fetchLogo = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('configuracion_empresa').select('logo_url').limit(1).single()
      if (data?.logo_url) {
        setLogo(data.logo_url)
      }
    }
    fetchLogo()
  }, [])

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/clientes", label: "Clientes", icon: Users },
    { href: "/admin/proyectos", label: "Proyectos", icon: HardHat },
    { href: "/admin/avances", label: "Avances de Obra", icon: ImageIcon },
    { href: "/admin/documentos", label: "Gestor Documental", icon: FileText },
    { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
    { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote },
    { href: "/admin/cotizaciones", label: "Cotizaciones", icon: FileText },
  ]

  return (
    <>
      {pathname === '/admin/login' ? (
        children
      ) : (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col h-full shadow-2xl z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center p-1">
            <img src={logo} alt="SARA Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-sm">ADMINISTRADOR</h1>
            <p className="text-[10px] text-brand-sage uppercase">SARA Constructora</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? "bg-brand-sage text-brand-dark" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/admin/configuracion" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors text-sm mb-1">
            <Settings size={16} />
            <span>Configuración</span>
          </Link>
          <button 
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/'
            }} 
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Panel de Control</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 font-medium">Hola, Administrador</div>
            <div className="w-9 h-9 rounded-full bg-brand-sage flex items-center justify-center font-bold text-brand-dark">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
      )}
    </>
  )
}
