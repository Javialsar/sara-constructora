import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function Footer() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('configuracion_empresa').select('*').limit(1).single()
  const logo = config?.logo_url || "/logo-grupo-sara.png"
  const direccion = config?.direccion || "Quito - Cuenca - Loja"
  const email = config?.email_contacto || "sara.constructora593@gmail.com"
  const telefono = config?.telefono_principal || "098 180 4023"
  const phoneLink = telefono.replace(/\D/g, '')

  return (
    <footer className="bg-brand-dark text-white pt-12 pb-20 md:pb-6">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <img 
                src={logo} 
                alt="SARA Constructora" 
                className="h-16 md:h-20 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-xs text-gray-300 uppercase tracking-widest font-semibold leading-relaxed">
              Ingeniería Civil · Arquitectura<br/>Construcción · Consultoría
            </p>
            <p className="text-brand-sage text-sm font-medium italic">
              "Diseñamos ideas. Construimos futuro."
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-base font-bold tracking-wider uppercase border-b border-brand-sage/30 pb-2 inline-block">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-sage shrink-0" size={18} />
                <span>{direccion}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-brand-sage shrink-0" size={18} />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-brand-sage shrink-0" size={18} />
                <a href={`https://wa.me/${phoneLink}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  {telefono}
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-base font-bold tracking-wider uppercase border-b border-brand-sage/30 pb-2 inline-block">
              Navegación
            </h4>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-300">
              <li><Link href="/" className="hover:text-brand-sage transition-colors">Inicio</Link></li>
              <li><Link href="/nosotros" className="hover:text-brand-sage transition-colors">Nosotros</Link></li>
              <li><Link href="/servicios" className="hover:text-brand-sage transition-colors">Servicios</Link></li>
              <li><Link href="/proyectos" className="hover:text-brand-sage transition-colors">Proyectos</Link></li>
              <li><Link href="/noticias" className="hover:text-brand-sage transition-colors">Noticias</Link></li>
              <li><Link href="/clientes" className="hover:text-brand-sage transition-colors">Clientes</Link></li>
              <li><Link href="/contacto" className="hover:text-brand-sage transition-colors">Contacto</Link></li>
              <li><Link href="/portal" className="hover:text-brand-sage transition-colors">Portal</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="text-base font-bold tracking-wider uppercase border-b border-brand-sage/30 pb-2 inline-block">
              Redes Sociales
            </h4>
            <div className="flex gap-3">
              <a href="#" className="bg-white/10 p-2.5 rounded-none hover:bg-brand-sage hover:text-brand-dark transition-colors flex items-center justify-center" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="bg-white/10 p-2.5 rounded-none hover:bg-brand-sage hover:text-brand-dark transition-colors flex items-center justify-center" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="bg-white/10 p-2.5 rounded-none hover:bg-brand-sage hover:text-brand-dark transition-colors flex items-center justify-center font-bold" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
              </a>
            </div>
          </div>
          
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} SARA CONSTRUCTORA. Todos los derechos reservados.</p>
          <p className="font-bold tracking-widest uppercase text-brand-sage">Ideas que construyen realidades.</p>
        </div>
      </div>
    </footer>
  )
}
