"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

const navLinks = [
  { name: "Inicio", href: "/" },
  { name: "Nosotros", href: "/nosotros" },
  { name: "Servicios", href: "/servicios" },
  { name: "Proyectos", href: "/proyectos" },
  { name: "Clientes", href: "/clientes" },
  { name: "Contacto", href: "/contacto" },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
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
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#f0f7f4 1px, transparent 1px), linear-gradient(90deg, #f0f7f4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between relative z-10">
        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3">
          <img 
            src="/images/logo-sara.png" 
            alt="SARA Constructora Logo" 
            className={cn("w-auto object-contain transition-all duration-300 hover:opacity-80 mix-blend-multiply",
              isScrolled ? "h-14 md:h-16" : "h-16 md:h-20"
            )} 
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-sage transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <Link href="/portal" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-sage transition-colors">
             Portal Clientes
          </Link>
          
          <Button variant="primary" className="hidden md:inline-flex" asChild>
            <Link href="/contacto">Solicitar Cotización</Link>
          </Button>

          {/* Mobile Menu Toggle */}
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
          "fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out flex flex-col justify-center items-center lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col items-center space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-2xl font-bold uppercase tracking-widest text-brand-dark hover:text-brand-sage transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-8">
            <Button variant="primary" size="lg" onClick={() => setMobileMenuOpen(false)}>
              Solicitar Cotización
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
