'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle2, User, Phone, FileText, ArrowRight, Sparkles } from 'lucide-react';

export interface CompradorSession {
  id: string;
  nombre: string;
  email: string;
  identificacionRucCedula: string;
  telefonoWhatsapp: string;
  proveedorAuth: 'GOOGLE' | 'FACEBOOK' | 'APPLE' | 'INVITADO_OBRA';
  avatarUrl?: string;
  direccionEntrega?: string;
  canton?: string;
}

interface AuthSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (comprador: CompradorSession) => void;
  onGuestContinue?: () => void;
}

export function AuthSocialModal({ isOpen, onClose, onSuccess, onGuestContinue }: AuthSocialModalProps) {
  const [tab, setTab] = useState<'social' | 'invitado'>('social');
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // Formulario rápido para invitado o completar datos
  const [nombre, setNombre] = useState('');
  const [cedulaRuc, setCedulaRuc] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSocialLogin = (provider: 'GOOGLE' | 'FACEBOOK' | 'APPLE') => {
    setLoadingProvider(provider);
    setErrorValidacion(null);

    // Simulación de autenticación OAuth de alta velocidad
    setTimeout(() => {
      let mockName = 'Ing. Fernando Carrión';
      let mockEmail = 'fernando.carrion@constructora-andina.ec';
      let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop';

      if (provider === 'GOOGLE') {
        mockName = 'Arq. Roberto Morales';
        mockEmail = 'roberto.morales.ec@gmail.com';
        avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop';
      } else if (provider === 'FACEBOOK') {
        mockName = 'Ing. Carlos Zambrano';
        mockEmail = 'carlos_zambrano_obras@fb.com';
        avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop';
      }

      const comprador: CompradorSession = {
        id: `usr-${Date.now()}`,
        nombre: mockName,
        email: mockEmail,
        identificacionRucCedula: '1104589210001',
        telefonoWhatsapp: '+593 99 874 1290',
        proveedorAuth: provider,
        avatarUrl: avatar,
        canton: 'Loja',
        direccionEntrega: 'Av. Salvador Bustamante Celi y Orillas del Zamora'
      };

      setLoadingProvider(null);
      onSuccess(comprador);
      onClose();
    }, 1200);
  };

  const handleInvitadoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !whatsapp.trim()) {
      setErrorValidacion('Por favor ingrese su nombre y teléfono WhatsApp de contacto.');
      return;
    }

    const comprador: CompradorSession = {
      id: `guest-${Date.now()}`,
      nombre: nombre.trim(),
      email: email.trim() || `${whatsapp.replace(/\D/g, '')}@compras.sara.ec`,
      identificacionRucCedula: cedulaRuc.trim() || '9999999999999', // Consumidor final por defecto
      telefonoWhatsapp: whatsapp.trim(),
      proveedorAuth: 'INVITADO_OBRA',
      canton: 'Loja'
    };

    onSuccess(comprador);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acceso 1-Clic • Sin Contraseñas</span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            Identificación de Comprador
          </h3>
          <p className="text-xs text-slate-400">
            Ingresa para gestionar pedidos de obra con precios de fábrica, flete MTOP coordinado y custodia Escrow.
          </p>
        </div>

        {/* Selector de modo */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6 text-xs font-bold">
          <button
            onClick={() => setTab('social')}
            className={`py-2.5 rounded-xl transition-all ${
              tab === 'social' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Redes Sociales (1-Clic)
          </button>
          <button
            onClick={() => setTab('invitado')}
            className={`py-2.5 rounded-xl transition-all ${
              tab === 'invitado' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Comprar como Invitado
          </button>
        </div>

        {/* CONTENIDO PESTAÑA: SOCIAL LOGIN */}
        {tab === 'social' && (
          <div className="space-y-3">
            {/* GOOGLE */}
            <button
              onClick={() => handleSocialLogin('GOOGLE')}
              disabled={loadingProvider !== null}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.01] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
              </svg>
              <span>{loadingProvider === 'GOOGLE' ? 'Conectando con Google...' : 'Continuar con Google'}</span>
            </button>

            {/* FACEBOOK */}
            <button
              onClick={() => handleSocialLogin('FACEBOOK')}
              disabled={loadingProvider !== null}
              className="w-full py-3.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.01] disabled:opacity-50"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>{loadingProvider === 'FACEBOOK' ? 'Conectando con Facebook...' : 'Continuar con Facebook'}</span>
            </button>

            {/* APPLE */}
            <button
              onClick={() => handleSocialLogin('APPLE')}
              disabled={loadingProvider !== null}
              className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 border border-slate-700 shadow-lg hover:scale-[1.01] disabled:opacity-50"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.8 1.11-1.92.99-3.04-1 .04-2.18.67-2.84 1.46-.58.68-1.09 1.77-.96 2.87 1.11.08 2.21-.57 2.81-1.29z"/>
              </svg>
              <span>{loadingProvider === 'APPLE' ? 'Conectando con Apple...' : 'Continuar con Apple'}</span>
            </button>

            <div className="pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500">
                Al continuar, tus comprobantes se vincularán automáticamente a tu número de WhatsApp.
              </span>
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA: INVITADO DE OBRA */}
        {tab === 'invitado' && (
          <form onSubmit={handleInvitadoSubmit} className="space-y-4">
            {errorValidacion && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorValidacion}
              </div>
            )}

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">
                Nombre Completo o Razón Social *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej: Ing. Marco Benítez o Constructora Austral"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">
                Teléfono WhatsApp (Para coordinar camión y entrega) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Ej: 0998765432"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Cédula / RUC (Factura SRI)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="10 o 13 dígitos"
                    value={cedulaRuc}
                    onChange={(e) => setCedulaRuc(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@obra.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
            >
              <span>Continuar al Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
