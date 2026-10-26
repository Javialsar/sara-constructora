'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  KeyRound, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  ArrowRight, 
  Lock, 
  Sparkles,
  ExternalLink,
  Laptop,
  Smartphone
} from 'lucide-react';

function DescargarFirmaContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const cedulaParam = searchParams.get('cedula') || '';

  const [solicitud, setSolicitud] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sara' | 'adobe' | 'firmaec'>('sara');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/facturacion/firmas');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.solicitudes)) {
            const found = data.solicitudes.find(
              (s: any) => s.id === id || (cedulaParam && s.cedula_ruc === cedulaParam)
            );
            if (found) {
              setSolicitud(found);
            }
          }
        }
      } catch (err) {
        console.warn('Error cargando solicitud:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, cedulaParam]);

  const claveCertificado = solicitud?.cedula_ruc || cedulaParam || 'ClaveSegura2026';

  const handleCopiarClave = () => {
    navigator.clipboard.writeText(claveCertificado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleDescargarP12 = () => {
    if (id) {
      window.location.href = `/api/facturacion/firmas/descargar?id=${id}`;
    } else {
      alert('Descargando archivo .p12 oficial...');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Certificado Acreditado ARCOTEL & SRI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Descarga de tu Firma Electrónica (.p12)
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Tu certificado digital oficial ha sido validado e insertado en la bóveda de GRUPO SARA. Puedes descargarlo para uso local o facturar directamente desde la nube.
          </p>
        </div>

        {/* Tarjeta Principal de Descarga */}
        <div className="rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Titular de la Firma:</span>
              <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{solicitud?.nombres || 'ING. DAVID SARANGO MALACATUS'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ACTIVO .P12
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Identificación / RUC: <strong className="text-amber-400">{solicitud?.cedula_ruc || cedulaParam || '1102978630'}</strong>
              </div>
            </div>

            <button
              onClick={handleDescargarP12}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Descargar Archivo .p12</span>
            </button>
          </div>

          {/* Bloque de Contraseña y Clave */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Contraseña de tu Firma (.p12):
              </span>
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-white/10 font-mono text-sm">
                <span className="font-black text-amber-400 select-all tracking-wider">{claveCertificado}</span>
                <button
                  onClick={handleCopiarClave}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Usa esta contraseña cuando Windows, Mac, Adobe Reader o FirmaEC te soliciten el PIN del certificado.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Bóveda en la Nube Activa
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                ¡Tu firma ya está cargada en el portal de <strong>Facturación SRI de Grupo SARA</strong>! No necesitas instalar ningún programa en tu computadora para facturar.
              </p>
              <Link
                href="/modulos/facturacion"
                className="inline-flex items-center gap-1 text-xs font-black text-amber-400 hover:text-amber-300 hover:underline pt-1"
              >
                <span>Ir al Portal y Emitir Factura Ahora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>

        {/* Guías de Uso Paso a Paso */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>¿Cómo usar tu archivo de Firma Electrónica?</span>
          </h2>

          <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('sara')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'sara' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              1. En Grupo SARA (Automático)
            </button>
            <button
              onClick={() => setActiveTab('adobe')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'adobe' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              2. En Adobe Reader (Contratos PDF)
            </button>
            <button
              onClick={() => setActiveTab('firmaec')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'firmaec' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              3. En FirmaEC / Quipux / SERCOP
            </button>
          </div>

          {activeTab === 'sara' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-3 text-xs text-slate-300 leading-relaxed animate-in fade-in">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Emisión sin instalación en teléfonos o computadores
              </h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Ingresa a tu portal en <Link href="/modulos/facturacion" className="text-amber-400 font-bold underline">sara-constructora.vercel.app/modulos/facturacion</Link>.</li>
                <li>Inicia sesión con tu cédula y clave provisional.</li>
                <li>Crea tu factura, ingresa el cliente y haz clic en <strong>«Firmar y Enviar al SRI»</strong>. El servidor tomará tu firma cifrada en milisegundos y enviará la factura con autorización legal automática.</li>
              </ol>
            </div>
          )}

          {activeTab === 'adobe' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-3 text-xs text-slate-300 leading-relaxed animate-in fade-in">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Firmar Contratos, Planillas y Actas en PDF
              </h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Descarga el archivo <strong>.p12</strong> a tu computador con el botón superior.</li>
                <li>Abre tu contrato en <strong>Adobe Acrobat Reader</strong>.</li>
                <li>Ve al menú <strong>Herramientas &gt; Certificados &gt; Firmar digitalmente</strong>.</li>
                <li>Dibuja el recuadro donde irá tu firma y selecciona el archivo <code>.p12</code>.</li>
                <li>Ingresa la contraseña de tu certificado (<strong className="font-mono text-amber-400">{claveCertificado}</strong>) y guarda el documento firmado.</li>
              </ol>
            </div>
          )}

          {activeTab === 'firmaec' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-3 text-xs text-slate-300 leading-relaxed animate-in fade-in">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-purple-400" />
                Uso en Quipux, Compras Públicas SERCOP y Función Judicial
              </h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Abre la aplicación oficial <strong>FirmaEC</strong> del Gobierno del Ecuador.</li>
                <li>Selecciona la pestaña <strong>«Certificado en archivo (.p12)»</strong> y examina el archivo descargado.</li>
                <li>Ingresa la contraseña de tu certificado.</li>
                <li>Selecciona el PDF o documento a firmar y pulsa <strong>«Firmar»</strong>.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer Soporte */}
        <div className="text-center pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>Entidad Emisora: <strong>ARCOTEL & GRUPO SARA INVERSIONES S.A.S.</strong></span>
          </div>
          <a
            href="https://wa.me/593998124912?text=Hola%20Grupo%20SARA,%20necesito%20ayuda%20con%20la%20descarga%20de%20mi%20firma%20electr%C3%B3nica"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Soporte Técnico WhatsApp: +593 99 812 4912</span>
          </a>
        </div>

      </div>
    </div>
  );
}

export default function DescargarFirmaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400 font-mono text-sm">
        Cargando portal seguro de certificados...
      </div>
    }>
      <DescargarFirmaContent />
    </Suspense>
  );
}
