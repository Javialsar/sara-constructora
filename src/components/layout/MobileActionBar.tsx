"use client"
import { Phone, MessageCircle, FileText } from "lucide-react"
import Link from "next/link"

export default function MobileActionBar() {
  const WHATSAPP_NUMBER = "593981804023"
  const WHATSAPP_MSG = encodeURIComponent("Hola SARA CONSTRUCTORA. Me gustaría recibir información sobre sus servicios y conversar sobre mi proyecto.")
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
      <div className="grid grid-cols-3 h-16">
        <a 
          href="tel:0981804023" 
          className="flex flex-col items-center justify-center text-brand-dark hover:bg-gray-50 transition-colors"
        >
          <Phone size={20} className="mb-1" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Llamar</span>
        </a>
        
        <a 
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center bg-brand-sage text-brand-dark hover:bg-brand-sage/90 transition-colors"
        >
          <MessageCircle size={20} className="mb-1" />
          <span className="text-[10px] uppercase font-bold tracking-wider">WhatsApp</span>
        </a>

        <Link 
          href="/contacto" 
          className="flex flex-col items-center justify-center text-brand-dark hover:bg-gray-50 transition-colors"
        >
          <FileText size={20} className="mb-1" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Cotizar</span>
        </Link>
      </div>
    </div>
  )
}
