"use client";

import { useState } from "react";
import { 
  Building, 
  Settings, 
  MessageSquare, 
  LogOut, 
  ChevronDown, 
  Plus, 
  AlertTriangle,
  Home,
  Users,
  Eye,
  MapPin,
  Clock,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<"propiedades" | "mensajes" | "configuracion">("propiedades");
  
  // Mock data for properties
  const properties: any[] = [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sub-Header for Dashboard */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-bold text-slate-800">SARA Portal</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">
                  JP
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">Juan Pérez</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
                  <Link href="/inmobiliaria/auth" className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">¡Hola, Juan! 👋</h1>
          <p className="text-slate-600">Bienvenido a tu panel de gestión inmobiliaria.</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold block mb-1">Aviso importante</span>
            Tus inmuebles pasarán por un proceso de verificación legal por SARA antes de ser publicados y requerir el pago del plan. Esto garantiza la seguridad y confianza para todos nuestros usuarios.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Mis Inmuebles</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Solicitudes Pendientes</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Visualizaciones Totales</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>

        {/* Tabs and Main Content */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("propiedades")}
                className={`py-4 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "propiedades"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Building className="h-4 w-4" />
                Mis Propiedades
              </button>
              <button
                onClick={() => setActiveTab("mensajes")}
                className={`py-4 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "mensajes"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Mensajes/Preguntas
              </button>
              <button
                onClick={() => setActiveTab("configuracion")}
                className={`py-4 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "configuracion"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Settings className="h-4 w-4" />
                Configuración
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "propiedades" && (
              <div className="animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Tus Inmuebles Registrados</h2>
                  <button className="flex w-full sm:w-auto items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    Publicar Nuevo Inmueble
                  </button>
                </div>

                {properties.length === 0 ? (
                  <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <Building className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Aún no tienes propiedades</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                      Comienza a monetizar tus inmuebles subiéndolos a la plataforma de SARA. Llegarás a clientes verificados al instante.
                    </p>
                    <button className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                      <Plus className="h-5 w-5" />
                      Publicar Nuevo Inmueble
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placeholder for properties if any */}
                  </div>
                )}
              </div>
            )}

            {activeTab === "mensajes" && (
              <div className="animate-in fade-in duration-300 py-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Bandeja de entrada vacía</h3>
                <p className="text-slate-500">No tienes mensajes nuevos de interesados por el momento.</p>
              </div>
            )}

            {activeTab === "configuracion" && (
              <div className="animate-in fade-in duration-300 max-w-2xl">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Detalles de la cuenta</h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-slate-500">Nombre</p>
                    <p className="text-slate-900">Juan Pérez</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-slate-500">Correo Electrónico</p>
                    <p className="text-slate-900">juan.perez@example.com</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-slate-500">Plan Actual</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        Básico (Gratis)
                      </span>
                      <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium ml-2">
                        Mejorar Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
