const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

const modalJsx = `
      {/* Modal de Pago */}
      {pagoInmueble && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <UploadCloud size={18} className="text-amber-600" />
                Pago de Plan: {pagoInmueble.codigo}
              </h3>
              <button onClick={() => setPagoInmueble(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6">
                <h4 className="text-sm font-bold text-amber-900 mb-3">Detalle del Valor a Pagar</h4>
                <div className="flex justify-between text-sm text-amber-800 mb-2">
                  <span>Plan Seleccionado:</span>
                  <span className="font-bold capitalize">{pagoInmueble.promocion?.nombrePlan || 'Básico'}</span>
                </div>
                <div className="flex justify-between text-amber-950 font-black text-lg border-t border-amber-200 pt-2 mt-2">
                  <span>Total a Transferir:</span>
                  <span>$\{(((pagoInmueble.promocion?.tarifaMensual || 0) * ((pagoInmueble as any).mesesContratados || 1) * (1 - ((pagoInmueble as any).descuentoPorcentaje || 0)/100)) * 1.15).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-bold text-slate-900">Opciones de Pago</h4>
                <div className="p-3 border rounded-xl bg-slate-50 text-sm">
                  <p className="font-bold mb-1">Transferencia Bancaria</p>
                  <p className="text-slate-600">Banco Pichincha - Cuenta Corriente</p>
                  <p className="text-slate-600">No. 2100054321</p>
                  <p className="text-slate-600">A nombre de: SARA Constructora</p>
                  <p className="text-slate-600">RUC: 0190123456001</p>
                </div>
                <div className="p-3 border rounded-xl bg-slate-50 text-sm">
                  <p className="font-bold mb-1">Tarjeta de Débito / Crédito</p>
                  <p className="text-slate-600">Haz clic aquí para pagar mediante pasarela segura (Próximamente)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Sube tu Comprobante</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
                  {comprobantePago ? (
                    <div className="space-y-3 w-full">
                      <div className="h-32 w-full bg-slate-100 rounded-lg overflow-hidden relative">
                        <img src={comprobantePago} alt="Comprobante" className="w-full h-full object-contain" />
                      </div>
                      <button onClick={() => setComprobantePago('')} className="text-xs text-red-600 font-bold hover:underline relative z-10">Cambiar archivo</button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={32} className="text-slate-400 mb-3" />
                      <p className="text-sm font-medium text-slate-700 mb-1">Haz clic para seleccionar o arrastra una imagen</p>
                      <p className="text-xs text-slate-500">JPG, PNG o PDF (Max. 2MB)</p>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleUploadComprobante}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setPagoInmueble(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button 
                onClick={handleEnviarComprobante}
                disabled={!comprobantePago || isUploadingComprobante}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingComprobante ? 'Enviando...' : 'Enviar Comprobante'}
                <CheckCircle2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace('{owner && (', modalJsx + '\n\n      {owner && (');
fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
