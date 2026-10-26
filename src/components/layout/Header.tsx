"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navLinks: { name: string; href: string; isFeatured?: boolean }[] = [
  { name: "Inicio", href: "/" },
  { name: "Factura & Firma", href: "/facturacion-electronica", isFeatured: true },
  { name: "Fletes & Renta", href: "/modulos/fletes", isFeatured: true },
  { name: "Nosotros", href: "/nosotros" },
  { name: "Noticias", href: "/noticias" },
  { name: "FAQ", href: "/#faq" },
  { name: "Clientes", href: "/clientes" },
]

import { getLogosEmpresa } from "@/lib/services/logosService"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logo, setLogo] = useState("/logo-hero.png")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    getLogosEmpresa().then(logos => {
      if (logos?.grupo_sara) {
        setLogo(logos.grupo_sara)
      } else {
        setLogo("/logo-hero.png")
      }
    })
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.08] ring-1 ring-black/[0.05]",
        isScrolled ? "py-2.5 shadow-lg shadow-black/30" : "py-3.5 md:py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between relative z-10">
        {/* Logo Corporativo Grupo SARA */}
        <Link href="/" className="relative flex items-center gap-3 group focus:outline-none">
          <img 
            src={logo} 
            alt="Grupo SARA Logo" 
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
              if (!target.src.endsWith('/logo-hero.png')) {
                target.src = '/logo-hero.png'
              }
            }}
            className={cn("w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-105 filter drop-shadow-[0_4px_16px_rgba(251,191,36,0.20)]",
              isScrolled ? "h-10 md:h-12" : "h-11 md:h-13"
            )} 
          />
          <div className="hidden sm:flex flex-col">
            <span className="font-display text-sm font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors duration-200 uppercase">
              GRUPO SARA
            </span>
            <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-brand-sage uppercase">
              Ingeniería & Tecnología
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              onClick={(e) => {
                if (link.href.startsWith('/#')) {
                  const targetId = link.href.replace('/#', '');
                  const target = document.getElementById(targetId);
                  if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className={cn(
                "min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ease-out flex items-center active:scale-[0.98]",
                link.isFeatured 
                  ? "text-brand-sage hover:text-white bg-brand-sage/10 border border-brand-sage/30 shadow-xs" 
                  : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle (44px target) */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden relative z-50 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 hover:text-white active:scale-[0.95] transition-all duration-200 ease-out"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay con pb-safe y ergonomía */}
      <div
        className={cn(
          "fixed inset-0 min-h-screen bg-slate-950/95 backdrop-blur-2xl z-40 transition-all duration-300 ease-out flex flex-col justify-between p-6 pb-safe lg:hidden",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between pt-2 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Grupo SARA" className="h-10 w-auto object-contain filter drop-shadow-md" />
            <div className="flex flex-col">
              <span className="font-display text-sm font-extrabold tracking-tight text-white uppercase">GRUPO SARA</span>
              <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-brand-sage uppercase">Holding Matriz</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-col space-y-2 py-8 my-auto w-full">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="min-h-[52px] px-5 rounded-2xl flex items-center text-lg font-bold uppercase tracking-wider text-slate-200 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] active:scale-[0.98] transition-all duration-200 ease-out"
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (link.href.startsWith('/#')) {
                  const targetId = link.href.replace('/#', '');
                  setTimeout(() => {
                    const target = document.getElementById(targetId);
                    if (target) {
                      e.preventDefault();
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }
              }}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/[0.08] text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
            GRUPO SARA · INGENIERÍA & ARQUITECTURA
          </p>
        </div>
      </div>
    </header>
  )
}