"use client"
import { Phone, MessageCircle, FileText } from "lucide-react"
import Link from "next/link"

export default function MobileActionBar() {
  const WHATSAPP_NUMBER = "593981804023"
  const WHATSAPP_MSG = encodeURIComponent("Hola GRUPO SARA. Me gustaría recibir información técnica sobre sus servicios y conversar sobre mi proyecto.")
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-8px_20px_rgba(0,0,0,0.5)] pb-safe">
      <div className="grid grid-cols-3 h-16">
        <a 
          href="tel:0981804023" 
          className="flex flex-col items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors active:scale-[0.98]"
        >
          <Phone size={18} className="mb-1 text-slate-400" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Llamar</span>
        </a>
        
        <a 
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black hover:from-amber-400 hover:to-amber-500 transition-colors active:scale-[0.98]"
        >
          <MessageCircle size={18} className="mb-1" />
          <span className="text-[10px] uppercase font-black tracking-wider">WhatsApp</span>
        </a>

        <Link 
          href="/contacto" 
          className="flex flex-col items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors active:scale-[0.98]"
        >
          <FileText size={18} className="mb-1 text-brand-sage" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-sage">Cotizar</span>
        </Link>
      </div>
    </div>
  )
}
