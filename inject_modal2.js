const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const modalStr = `
      {/* Modal Validar Pago */}
      {pagoAValidar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Receipt size={18} className="text-amber-500" />
                Validar Comprobante de Pago
              </h3>
              <button onClick={() => setPagoAValidar(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">Detalles del Inmueble</h4>
                <div className="flex justify-between text-sm mb-1 text-amber-800">
                  <span>Código:</span> <span className="font-bold">{pagoAValidar.codigo}</span>
                </div>
                <div className="flex justify-between text-sm mb-1 text-amber-800">
                  <span>Propietario:</span> <span className="font-bold">{pagoAValidar.propietario?.nombre}</span>
                </div>
                <div className="flex justify-between text-sm mb-1 text-amber-800">
                  <span>Plan Contratado:</span> <span className="font-bold capitalize">{pagoAValidar.promocion?.nombrePlan}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-amber-950 border-t border-amber-200 pt-2 mt-2">
                  <span>Total a Validar:</span> 
                  <span>\${((((pagoAValidar.promocion?.tarifaMensual || 0) * (pagoAValidar.mesesContratados || 1) * (1 - (pagoAValidar.descuentoPorcentaje || 0)/100)) * 1.15).toFixed(2))}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Comprobante Subido por el Cliente</h4>
                {pagoAValidar.promocion?.comprobanteUrl ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center p-2">
                    {pagoAValidar.promocion.comprobanteUrl.startsWith('data:image') || pagoAValidar.promocion.comprobanteUrl.match(/\\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={pagoAValidar.promocion.comprobanteUrl} alt="Comprobante" className="max-w-full max-h-80 object-contain rounded-lg shadow-sm" />
                    ) : (
                      <a href={pagoAValidar.promocion.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-8 text-blue-600 hover:text-blue-800">
                        <FileText size={48} />
                        <span className="font-bold text-sm">Ver Documento PDF / Archivo</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl">
                    <AlertTriangle size={32} className="text-amber-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">No se adjuntó archivo de comprobante.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-between gap-3">
              <button 
                onClick={handleRechazarPago}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <XCircle size={16} />
                Rechazar Pago
              </button>
              
              <div className="flex gap-2">
                <button onClick={() => setPagoAValidar(null)} className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button 
                  onClick={handleAprobarPago}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Aprobar y Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

const lines = content.split('\n');
const lastDivIdx = lines.findLastIndex(l => l.includes('</div>'));
lines.splice(lastDivIdx, 0, modalStr);
content = lines.join('\n');

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
