'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, Mail, Lock, User, FileText, UploadCloud, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FletesAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/modulos/fletes/mi-perfil');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Lado Izquierdo: Branding */}
        <div className="w-full md:w-5/12 bg-amber-500 p-10 text-slate-900 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
             <Truck className="w-96 h-96" />
          </div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl mb-12">
              <div className="bg-slate-900 p-2 rounded-lg">
                <Truck className="w-6 h-6 text-amber-500" />
              </div>
              SARA Fletes
            </Link>
            
            <h2 className="text-4xl font-black mb-4 leading-tight">Únete a la Red Logística Más Grande.</h2>
            <p className="font-medium text-amber-900/80 mb-8">
              Recibe viajes directamente a tu celular. Cero intermediarios, tarifas transparentes y pagos seguros.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-amber-500 rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
              <p className="font-bold">Sube tus documentos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-amber-500 rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
              <p className="font-bold">Elige tu plan (7%, 15% o 25%)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-amber-500 rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
              <p className="font-bold">¡Empieza a facturar!</p>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="w-full md:w-7/12 p-10 bg-white">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold text-slate-800">
              {isLogin ? 'Iniciar Sesión' : 'Registro de Vehículo'}
            </h3>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-blue-600 hover:text-blue-800"
            >
              {isLogin ? 'Crear una cuenta' : 'Ya tengo cuenta'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input required type="text" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none" placeholder="Juan Pérez" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Placa del Vehículo</label>
                  <div className="relative">
                    <Truck className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input required type="text" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none uppercase font-mono" placeholder="ABC-1234" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input required type="email" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none" placeholder="correo@ejemplo.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input required type="password" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-amber-500 outline-none" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors">
              {isLogin ? 'Ingresar al Radar' : 'Registrar Vehículo y Subir Documentos'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
