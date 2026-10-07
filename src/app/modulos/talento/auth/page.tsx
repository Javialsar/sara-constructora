'use client';
import React, { useState } from 'react';
import { User, Lock, Mail, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TalentoAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de autenticación exitosa
    router.push('/modulos/talento/mi-perfil');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-200">
        
        {/* Panel Informativo */}
        <div className="w-full md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-center">
          <Briefcase className="w-12 h-12 text-blue-500 mb-6" />
          <h1 className="text-4xl font-bold mb-4">SARA Talento</h1>
          <p className="text-slate-300 text-lg mb-8">
            El portal exclusivo para que ingenieros, arquitectos y maestros de obra conecten con las constructoras más grandes de Ecuador.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center text-slate-300"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> Geolocalización en mapa para obras cercanas</li>
            <li className="flex items-center text-slate-300"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> Gestión de CV y certificaciones</li>
            <li className="flex items-center text-slate-300"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> Historial de contrataciones centralizado</li>
          </ul>
        </div>

        {/* Panel Formulario */}
        <div className="w-full md:w-1/2 p-12 bg-white">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta Profesional'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isLogin ? 'Accede a tu panel para gestionar tu disponibilidad.' : 'Únete a la red y recibe ofertas de trabajo directo.'}
          </p>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <input required type="text" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Javier Sarango" />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input required type="email" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="correo@ejemplo.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input required type="password" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center">
              {isLogin ? 'Ingresar a mi Portal' : 'Registrarme ahora'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-medium text-sm hover:underline">
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link href="/modulos/talento" className="text-slate-500 text-sm hover:text-slate-800 transition-colors">
              Volver al Radar Público
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
