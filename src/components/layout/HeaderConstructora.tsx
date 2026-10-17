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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.08] ring-1 ring-black/[0.05]",
        isScrolled ? "py-2.5 shadow-lg shadow-black/30" : "py-3.5 md:py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between relative z-10">
        
        {/* Logo Oficial SARA-CONSTRUCTORA */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link 
            href="/" 
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-400 hover:text-white transition-colors duration-200 ease-out uppercase tracking-widest pr-3.5 border-r border-white/10"
            title="Volver a Grupo SARA Matriz"
          >
            <ChevronLeft size={14} className="text-slate-400" />
            <span>Grupo SARA</span>
          </Link>

          <Link href="/constructora" className="relative flex items-center gap-3 group focus:outline-none">
            <img 
              src={logo} 
              alt="SARA Constructora Logo" 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement
                if (!target.src.endsWith('/sara-constructora.png')) {
                  target.src = '/images/sara-constructora.png'
                }
              }}
              className={cn("w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-105 filter drop-shadow-[0_4px_16px_rgba(60,122,82,0.30)]",
                isScrolled ? "h-10 md:h-11" : "h-11 md:h-13"
              )} 
            />
            <div className="flex flex-col">
              <span className="font-display text-sm font-extrabold tracking-tight text-white group-hover:text-brand-sage transition-colors duration-200 uppercase">
                SARA CONSTRUCTORA
              </span>
              <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-brand-sage uppercase">
                Obras & Arquitectura
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
          
          {/* 1. Nuestros Proyectos */}
          <Link 
            href="/proyectos"
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all duration-200 ease-out active:scale-[0.98] flex items-center gap-2"
          >
            <Building2 size={15} className="text-brand-sage shrink-0" />
            <span>Nuestros Proyectos</span>
          </Link>

          {/* 2. Portal Clientes */}
          <Link 
            href="/portal"
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all duration-200 ease-out active:scale-[0.98] flex items-center gap-2"
          >
            <User size={15} className="text-amber-400 shrink-0" />
            <span>Portal Clientes</span>
          </Link>

          {/* 3. ¿Tienes un proyecto? (Botón Destacado) */}
          <a
            href="#cotizacion"
            onClick={(e) => handleSmoothScroll(e, "cotizacion")}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm ring-1 ring-amber-400/30 hover:shadow-md hover:shadow-amber-500/20 active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer ml-2"
          >
            <Sparkles size={14} className="shrink-0" />
            <span>¿Tienes un proyecto?</span>
            <ArrowRight size={14} className="shrink-0" />
          </a>
        </nav>

        {/* Mobile Hamburger Toggle (44px target) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white bg-white/[0.04] border border-white/[0.08] active:scale-[0.95] transition-all duration-200 ease-out"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer con Ergonomía Táctil y pb-safe */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-white/[0.08] px-5 py-5 space-y-2.5 backdrop-blur-2xl animate-in slide-in-from-top-3 duration-200 pb-safe">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center min-h-[44px] px-3 text-xs font-mono font-semibold text-slate-400 hover:text-white uppercase tracking-wider rounded-lg transition-colors"
          >
            ← Volver a Grupo SARA Matriz
          </Link>

          <Link
            href="/proyectos"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-[48px] px-4 rounded-xl flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-200 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] active:scale-[0.98] transition-all duration-200 ease-out"
          >
            <Building2 size={17} className="text-brand-sage shrink-0" />
            <span>Nuestros Proyectos</span>
          </Link>

          <Link
            href="/portal"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-[48px] px-4 rounded-xl flex items-center gap-3 text-sm font-semibold tracking-wide text-slate-200 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] active:scale-[0.98] transition-all duration-200 ease-out"
          >
            <User size={17} className="text-amber-400 shrink-0" />
            <span>Portal Clientes</span>
          </Link>

          <div className="pt-2">
            <a
              href="#cotizacion"
              onClick={(e) => handleSmoothScroll(e, "cotizacion")}
              className="flex items-center justify-center gap-2 w-full min-h-[48px] py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all duration-200 ease-out"
            >
              <Sparkles size={15} />
              <span>¿Tienes un proyecto?</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
