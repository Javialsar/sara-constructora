const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

const pagoModalJSX = `
      {/* MODAL DE PAGO */}
      {pagoInmueble && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <UploadCloud size={18} className="text-amber-500" />
                Enviar Comprobante de Pago
              </h3>
              <button onClick={() => { setPagoInmueble(null); setComprobantePago("") }} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                <p className="text-amber-900 mb-2"><span className="font-bold">Inmueble:</span> {pagoInmueble.codigo}</p>
                <p className="text-amber-900 mb-2"><span className="font-bold">Plan Seleccionado:</span> {pagoInmueble.planPromocion.toUpperCase()}</p>
                <p className="text-amber-900 text-xs mt-2 italic">Asegúrate de depositar o transferir a la cuenta bancaria de SARA Constructora mostrada en tu plan y adjunta el comprobante (Foto o PDF).</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Adjuntar Comprobante</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={handleUploadComprobante}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {comprobantePago && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  Comprobante adjuntado correctamente
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => { setPagoInmueble(null); setComprobantePago("") }}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarComprobante}
                disabled={!comprobantePago || isUploadingComprobante}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {isUploadingComprobante ? "Enviando..." : "Enviar Comprobante"}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  '{showPublishModal && (',
  pagoModalJSX + '\n      {showPublishModal && ('
);

fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
