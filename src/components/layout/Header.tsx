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
      if (logos?.constructora) {
        setLogo(logos.constructora)
      }
    })
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-100",
        isScrolled ? "py-3 shadow-md" : "py-5"
      )}
    >
      {/* Cuadrícula sutil del header */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(60, 122, 82, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(60, 122, 82, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between relative z-10">
        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3">
          <img 
            src={logo} 
            alt="SARA Constructora Logo" 
            className={cn("w-auto object-contain transition-all duration-300 hover:opacity-80 mix-blend-multiply",
              isScrolled ? "h-14 md:h-16" : "h-16 md:h-20"
            )} 
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
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
                "text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-colors",
                link.isFeatured 
                  ? "text-brand-sage hover:text-brand-dark px-2 py-1 rounded bg-brand-sage/10 border border-brand-sage/20" 
                  : "text-brand-black hover:text-brand-sage"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden relative z-50 p-2 text-brand-black"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div
        className={cn(
          "fixed inset-0 min-h-screen bg-white/95 backdrop-blur-md z-40 transition-transform duration-300 ease-in-out flex flex-col justify-center items-center lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col items-center space-y-8 w-full px-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-3xl font-extrabold uppercase tracking-widest text-brand-dark hover:text-brand-sage transition-all hover:scale-105"
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
          <div className="pt-10 w-full max-w-xs">
            <Link href="/constructora#cotizacion" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="primary" size="lg" className="w-full shadow-lg">
                Solicitar Cotización
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
