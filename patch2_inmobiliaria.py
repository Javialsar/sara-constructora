import re

with open('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove handleUploadComprobante
content = re.sub(
    r'const handleUploadComprobante = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?reader\.readAsDataURL\(e\.target\.files\[0\]\)\n    \}\n  \}',
    '',
    content
)

# 2. Replace UI Modal
ui_regex = r'<div className="space-y-4 mb-6">\s*<h4 className="text-sm font-bold text-slate-900">Opciones de Pago</h4>[\s\S]*?</button>\s*</div>'

ui_new = """<div className="space-y-4 mb-6">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={16} className="text-amber-500" />
                  Cuentas Disponibles
                </h4>
                
                {cuentasBancarias.length > 0 ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div className="flex bg-gray-50 border-b border-gray-200 p-1 gap-1">
                      {cuentasBancarias.map((cta, idx) => (
                        <button
                          key={cta.id}
                          onClick={() => setSelectedBankTab(idx)}
                          className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                            selectedBankTab === idx
                              ? 'bg-white text-emerald-700 shadow-sm border border-gray-200'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 border border-transparent'
                          }`}
                        >
                          {cta.banco}
                        </button>
                      ))}
                    </div>
                    
                    <div className="p-4 bg-white text-xs">
                      {cuentasBancarias[selectedBankTab] && (
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 items-baseline">
                              <span className="text-gray-500 font-medium">Banco:</span>
                              <span className="font-bold text-gray-900">{cuentasBancarias[selectedBankTab].banco}</span>
                              
                              <span className="text-gray-500 font-medium">Cuenta:</span>
                              <span className="font-bold text-gray-900">{cuentasBancarias[selectedBankTab].tipoCuenta}</span>
                              
                              <span className="text-gray-500 font-medium">Número:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-gray-900 font-mono text-sm">{cuentasBancarias[selectedBankTab].numeroCuenta}</span>
                              </div>
                              
                              <span className="text-gray-500 font-medium">Titular:</span>
                              <span className="font-bold text-gray-900">{cuentasBancarias[selectedBankTab].beneficiario}</span>
                              
                              <span className="text-gray-500 font-medium">Céd/RUC:</span>
                              <span className="font-bold text-gray-900">{cuentasBancarias[selectedBankTab].cedulaRuc}</span>
                            </div>
                          </div>
                          
                          {cuentasBancarias[selectedBankTab].qrUrl && (
                            <div className="shrink-0 w-28 h-28 mx-auto sm:mx-0 p-1 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center relative group">
                              <img src={cuentasBancarias[selectedBankTab].qrUrl} alt="QR Pago" className="w-full h-full object-contain rounded-lg" />
                              <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <a href={cuentasBancarias[selectedBankTab].qrUrl} target="_blank" className="text-[9px] font-bold text-white uppercase bg-emerald-500 px-2 py-1 rounded-md">Ver QR</a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                   <p className="text-sm text-gray-500">No hay cuentas bancarias configuradas.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <UploadCloud size={16} className="text-amber-500" />
                  Sube tu Comprobante <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${receiptFile ? 'border-amber-500 bg-amber-50' : 'border-slate-300 hover:border-amber-400 bg-slate-50'}`}>
                    {receiptFile ? (
                      <>
                        <CheckCircle2 className="text-amber-600" size={32} />
                        <span className="font-bold text-amber-900 text-sm text-center">{receiptFile.name}</span>
                        <span className="text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wider relative z-10 cursor-pointer" onClick={(e) => { e.preventDefault(); setReceiptFile(null); }}>Cambiar Archivo</span>
                      </>
                    ) : (
                      <>
                        <div className="bg-white p-3 rounded-full shadow-sm">
                          <UploadCloud size={24} className="text-slate-400" />
                        </div>
                        <span className="font-bold text-slate-600 text-sm text-center">Haz clic para subir o arrastra tu comprobante</span>
                        <span className="text-[11px] text-slate-400 text-center">Formatos: JPG, PNG o PDF (Máx. 5MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between gap-4">
                <button onClick={() => { setPagoInmueble(null); setReceiptFile(null); }} className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleEnviarComprobante} disabled={!receiptFile || isUploadingComprobante} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isUploadingComprobante ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Enviar Comprobante
                    </>
                  )}
                </button>
              </div>"""

content = re.sub(ui_regex, ui_new, content)

with open('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Inmobiliaria portal patched successfully.")
