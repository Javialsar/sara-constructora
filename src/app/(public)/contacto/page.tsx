import { Button } from "@/components/ui/Button"
import { MapPin, Phone, Mail } from "lucide-react"

export default function ContactoPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark tracking-tight mb-4 uppercase">
            ¿TIENES UN PROYECTO EN MENTE?
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            HAGÁMOSLO REALIDAD.
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-brand-dark text-white p-8 space-y-8">
              <h3 className="text-xl font-bold uppercase tracking-wider border-b border-white/20 pb-4">
                Información de Contacto
              </h3>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <MapPin className="text-brand-sage shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold mb-1">Ubicación</h4>
                    <p className="text-gray-300 text-sm">Cariamanga – Loja – Ecuador</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Phone className="text-brand-sage shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold mb-1">Teléfono / WhatsApp</h4>
                    <a href="tel:0981804023" className="text-gray-300 text-sm hover:text-white transition-colors">098 180 4023</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Mail className="text-brand-sage shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold mb-1">Email</h4>
                    <a href="mailto:sara.constructora593@gmail.com" className="text-gray-300 text-sm hover:text-white transition-colors">sara.constructora593@gmail.com</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Registration / Request Portal Form */}
          <div className="lg:col-span-8 bg-white p-8 md:p-12 border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-brand-black mb-8 border-b border-gray-100 pb-4">
              Portal de Solicitudes y Cotización
            </h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-bold text-brand-dark uppercase tracking-wider">Nombre *</label>
                  <input type="text" id="nombre" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="apellido" className="text-sm font-bold text-brand-dark uppercase tracking-wider">Apellido *</label>
                  <input type="text" id="apellido" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="telefono" className="text-sm font-bold text-brand-dark uppercase tracking-wider">Teléfono / WhatsApp *</label>
                  <input type="tel" id="telefono" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-brand-dark uppercase tracking-wider">Email *</label>
                  <input type="email" id="email" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="tipo" className="text-sm font-bold text-brand-dark uppercase tracking-wider">Tipo de Proyecto *</label>
                  <select id="tipo" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all appearance-none" required>
                    <option value="">Selecciona una opción</option>
                    <option value="vivienda">Vivienda</option>
                    <option value="edificio">Edificio</option>
                    <option value="local">Local comercial</option>
                    <option value="diseno">Diseño arquitectónico</option>
                    <option value="construccion">Construcción</option>
                    <option value="remodelacion">Remodelación</option>
                    <option value="ingenieria">Ingeniería estructural</option>
                    <option value="topografia">Topografía</option>
                    <option value="consultoria">Consultoría</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="etapa" className="text-sm font-bold text-brand-dark uppercase tracking-wider">Etapa del Proyecto</label>
                  <select id="etapa" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all appearance-none">
                    <option value="idea">Solo tengo una idea</option>
                    <option value="planos">Ya tengo planos</option>
                    <option value="terreno">Tengo terreno</option>
                    <option value="construccion">En construcción / Obra parada</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="ubicacion" className="text-sm font-bold text-brand-dark uppercase tracking-wider">Ubicación (Ciudad / Sector)</label>
                <input type="text" id="ubicacion" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all" />
              </div>

              <div className="space-y-2">
                <label htmlFor="mensaje" className="text-sm font-bold text-brand-dark uppercase tracking-wider">Mensaje / Detalles Adicionales *</label>
                <textarea id="mensaje" rows={5} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all resize-none" required></textarea>
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" id="privacidad" className="mt-1" required />
                <label htmlFor="privacidad" className="text-sm text-gray-600">
                  Acepto la política de privacidad y el tratamiento de mis datos para ser contactado por SARA Constructora.
                </label>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto">
                  ENVIAR SOLICITUD DE COTIZACIÓN
                </Button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  )
}
