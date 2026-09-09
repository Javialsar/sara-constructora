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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative z-50 flex items-center gap-3">
          <img 
            src="/images/logo-sara.png" 
            alt="SARA Constructora Logo" 
            className="h-10 md:h-12 w-auto object-contain transition-opacity hover:opacity-80" 
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn("text-xs font-bold uppercase tracking-widest hover:text-brand-sage transition-colors",
                isScrolled ? "text-brand-black" : "text-gray-300"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <Link href="/portal" className={cn("hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-brand-sage transition-colors", isScrolled ? "text-brand-black" : "text-white")}>
             Portal Clientes
          </Link>
          
          <Button variant={isScrolled ? "primary" : "sage"} className="hidden md:inline-flex" asChild>
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
