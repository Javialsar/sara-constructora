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
    <footer className="bg-slate-950 text-white pt-20 pb-24 md:pb-12 border-t border-white/[0.08] relative overflow-hidden pb-safe">
      {/* Luz ambiental sutil arquitectónica */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-brand-sage/10 to-transparent blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
          
          {/* Brand Info */}
          <div className="space-y-5">
            <Link 
              href="/" 
              className="inline-block bg-white/[0.04] p-3.5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all duration-200 ease-out group"
            >
              <img 
                src={logo} 
                alt="Grupo SARA" 
                className="h-16 md:h-18 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 ease-out"
              />
            </Link>
            <div className="space-y-1.5">
              <p className="font-display text-sm font-extrabold uppercase tracking-tight text-white">
                GRUPO SARA
              </p>
              <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">
                Ingeniería · Arquitectura · Tecnología Integral
              </p>
            </div>
            <p className="text-brand-sage text-xs font-medium italic border-l-2 border-brand-sage/40 pl-3">
              "Diseñamos ideas. Construimos futuro."
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold tracking-tight uppercase text-white pb-2 border-b border-white/[0.08] inline-block">
              Contacto Oficial
            </h4>
            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-sage shrink-0 mt-0.5" size={16} />
                <span className="leading-relaxed">{direccion}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-brand-sage shrink-0" size={16} />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors duration-200 py-1">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-brand-sage shrink-0" size={16} />
                <a href={`https://wa.me/${phoneLink}`} target="_blank" rel="noreferrer" className="hover:text-white tabular-nums transition-colors duration-200 py-1">
                  {telefono}
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold tracking-tight uppercase text-white pb-2 border-b border-white/[0.08] inline-block">
              Navegación
            </h4>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-slate-300">
              <li><Link href="/" className="hover:text-brand-sage transition-colors duration-200 py-1 inline-block">Inicio</Link></li>
              <li><Link href="/nosotros" className="hover:text-brand-sage transition-colors duration-200 py-1 inline-block">Nosotros</Link></li>
              <li><Link href="/servicios" className="hover:text-brand-sage transition-colors duration-200 py-1 inline-block">Servicios</Link></li>
              <li><Link href="/proyectos" className="hover:text-brand-sage transition-colors duration-200 py-1 inline-block">Proyectos</Link></li>
              <li><Link href="/noticias" className="hover:text-brand-sage transition-colors duration-200 py-1 inline-block">Noticias</Link></li>
              <li><Link href="/clientes" className="hover:text-brand-sage transition-colors duration-200 py-1 inline-block">Clientes</Link></li>
              <li><Link href="/contacto" className="hover:text-brand-sage transition-colors duration-200 py-1 inline-block">Contacto</Link></li>
              <li><Link href="/portal" className="hover:text-brand-sage transition-colors duration-200 py-1 inline-block">Portal</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold tracking-tight uppercase text-white pb-2 border-b border-white/[0.08] inline-block">
              Redes Institucionales
            </h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-brand-sage/40 hover:bg-brand-sage/10 hover:text-brand-sage transition-all duration-200 ease-out flex items-center justify-center text-slate-300 active:scale-[0.95]" 
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a 
                href="#" 
                className="min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-brand-sage/40 hover:bg-brand-sage/10 hover:text-brand-sage transition-all duration-200 ease-out flex items-center justify-center text-slate-300 active:scale-[0.95]" 
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a 
                href="#" 
                className="min-h-[44px] min-w-[44px] rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-brand-sage/40 hover:bg-brand-sage/10 hover:text-brand-sage transition-all duration-200 ease-out flex items-center justify-center text-slate-300 active:scale-[0.95]" 
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
              </a>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p className="tabular-nums">
            © {new Date().getFullYear()} GRUPO SARA. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-sage" />
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-sage">
              Ingeniería & Vanguardia Arquitectónica
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
