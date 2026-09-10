import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  HardHat, 
  Image as ImageIcon, 
  MessageSquareQuote,
  FileText,
  Settings,
  LogOut
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col h-full shadow-2xl z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center p-1">
            <img src="/images/logo-sara.png" alt="SARA Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-sm">ADMINISTRADOR</h1>
            <p className="text-[10px] text-brand-sage uppercase">SARA Constructora</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-sage text-brand-dark font-medium transition-colors">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/clientes" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            <Users size={18} />
            <span>Clientes</span>
          </Link>
          <Link href="/admin/proyectos" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            <HardHat size={18} />
            <span>Proyectos</span>
          </Link>
          <Link href="/admin/avances" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            <ImageIcon size={18} />
            <span>Avances de Obra</span>
          </Link>
          <Link href="/admin/testimonios" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            <MessageSquareQuote size={18} />
            <span>Testimonios</span>
          </Link>
          <Link href="/admin/cotizaciones" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            <FileText size={18} />
            <span>Cotizaciones</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/admin/configuracion" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors text-sm mb-1">
            <Settings size={16} />
            <span>Configuración</span>
          </Link>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm">
            <LogOut size={16} />
            <span>Salir al sitio web</span>
          </Link>
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
  )
}
