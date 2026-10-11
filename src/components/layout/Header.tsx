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
  { name: "Nosotros", href: "/nosotros" },
  { name: "Noticias", href: "/noticias" },
  { name: "FAQ", href: "/#faq" },
  { name: "Clientes", href: "/clientes" },
]

import { getLogosEmpresa } from "@/lib/services/logosService"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logo, setLogo] = useState("/logo-grupo-sara.png")

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
      } else if (logos?.constructora) {
        setLogo(logos.constructora)
      }
    })
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80",
        isScrolled ? "py-2.5 shadow-2xl shadow-black/40" : "py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between relative z-10">
        {/* Logo Corporativo Grupo SARA */}
        <Link href="/" className="relative flex items-center gap-3 group">
          <img 
            src={logo} 
            alt="Grupo SARA Logo" 
            className={cn("w-auto object-contain transition-all duration-300 group-hover:scale-105 filter drop-shadow-lg",
              isScrolled ? "h-12 md:h-14" : "h-14 md:h-16"
            )} 
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
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
                "text-xs font-bold uppercase tracking-widest transition-all",
                link.isFeatured 
                  ? "text-brand-sage hover:text-white px-3 py-1.5 rounded-lg bg-brand-sage/10 border border-brand-sage/30 shadow-sm" 
                  : "text-slate-300 hover:text-brand-sage hover:translate-y-[-1px]"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden relative z-50 p-2 text-slate-200 hover:text-brand-sage transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div
        className={cn(
          "fixed inset-0 min-h-screen bg-slate-950/98 backdrop-blur-2xl z-40 transition-transform duration-300 ease-in-out flex flex-col justify-center items-center lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col items-center space-y-6 w-full px-6">
          <div className="mb-4">
            <img src={logo} alt="Grupo SARA" className="h-16 w-auto object-contain filter drop-shadow-md" />
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-2xl font-black uppercase tracking-widest text-slate-200 hover:text-brand-sage transition-all"
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
      </div>
    </header>
  )
}
