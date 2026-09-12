import { Settings, Shield, Bell, Key } from "lucide-react"

export default function ConfiguracionPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
        <p className="text-gray-500">Administra las preferencias generales del sistema y seguridad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seguridad */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center">
              <Shield className="text-brand-sage" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Seguridad</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Opciones relacionadas a la seguridad de tu cuenta de administrador.
          </p>
          <button className="flex items-center gap-2 text-brand-dark hover:text-brand-sage font-medium text-sm transition-colors">
            <Key size={16} />
            Cambiar Contraseña
          </button>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center">
              <Bell className="text-brand-sage" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Notificaciones</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Recibe alertas cuando un cliente apruebe una cotización o deje un testimonio.
          </p>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" defaultChecked />
              <div className="block bg-brand-sage w-10 h-6 rounded-full"></div>
              <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium text-sm">
              Alertas por Correo
            </div>
          </label>
        </div>

        {/* Ajustes del Sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center">
              <Settings className="text-brand-sage" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Preferencias del Sistema</h2>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Configuración global de la plataforma SARA Constructora.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
              <input type="text" defaultValue="SARA Constructora" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico de Contacto (Público)</label>
              <input type="email" defaultValue="contacto@saraconstructora.com" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none" />
            </div>
            <div className="pt-2">
              <button className="bg-brand-dark text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark/90 transition-colors">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
