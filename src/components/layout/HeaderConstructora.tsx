"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight, Building2, User, Sparkles, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLogosEmpresa } from "@/lib/services/logosService"

export default function HeaderConstructora() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logo, setLogo] = useState("/images/sara-constructora.png")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    getLogosEmpresa().then((logos) => {
      if (logos?.constructora) {
        setLogo(logos.constructora)
      } else {
        setLogo("/images/sara-constructora.png")
      }
    })
  }, [])

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80",
        isScrolled ? "py-2.5 shadow-2xl shadow-black/40" : "py-3.5"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between relative z-10">
        
        {/* Logo Oficial SARA-CONSTRUCTORA */}
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-400 hover:text-amber-400 transition-colors uppercase tracking-wider pr-3 border-r border-slate-800"
            title="Volver a Grupo SARA Matriz"
          >
            <ChevronLeft size={14} />
            <span>Grupo SARA</span>
          </Link>

          <Link href="/constructora" className="relative flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="SARA Constructora Logo" 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement
                if (!target.src.endsWith('/sara-constructora.png')) {
                  target.src = '/images/sara-constructora.png'
                }
              }}
              className={cn("w-auto object-contain transition-all duration-300 group-hover:scale-105 filter drop-shadow-[0_4px_14px_rgba(60,122,82,0.35)]",
                isScrolled ? "h-11 md:h-12" : "h-12 md:h-14"
              )} 
            />
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-widest text-white group-hover:text-brand-sage transition-colors uppercase">
                SARA CONSTRUCTORA
              </span>
              <span className="text-[10px] font-bold tracking-widest text-brand-sage uppercase">
                Obras & Arquitectura
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          
          {/* 1. Nuestros Proyectos */}
          <Link 
            href="/proyectos"
            className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-brand-sage transition-all hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 size={15} className="text-brand-sage" />
            <span>Nuestros Proyectos</span>
          </Link>

          {/* 2. Portal Clientes */}
          <Link 
            href="/portal"
            className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-brand-sage transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
          >
            <User size={15} className="text-amber-400" />
            <span>Portal Clientes</span>
          </Link>

          {/* 3. ¿Tienes un proyecto? (Botón Destacado) */}
          <a
            href="#cotizacion"
            onClick={(e) => handleSmoothScroll(e, "cotizacion")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>¿Tienes un proyecto?</span>
            <ArrowRight size={14} />
          </a>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-6 py-6 space-y-4 backdrop-blur-xl animate-in slide-in-from-top-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-mono font-bold text-slate-400 hover:text-amber-400 uppercase tracking-wider py-1"
          >
            ← Volver a Grupo SARA
          </Link>

          <Link
            href="/proyectos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-200 hover:text-brand-sage py-2 border-b border-slate-900"
          >
            <Building2 size={16} className="text-brand-sage" />
            <span>Nuestros Proyectos</span>
          </Link>

          <Link
            href="/portal"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-200 hover:text-brand-sage py-2 border-b border-slate-900"
          >
            <User size={16} className="text-amber-400" />
            <span>Portal Clientes</span>
          </Link>

          <a
            href="#cotizacion"
            onClick={(e) => handleSmoothScroll(e, "cotizacion")}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
          >
            <Sparkles size={14} />
            <span>¿Tienes un proyecto?</span>
            <ArrowRight size={14} />
          </a>
        </div>
      )}
    </header>
  )
}
