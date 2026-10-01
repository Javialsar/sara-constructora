import os

filepath = 'src/app/dashboard/planes/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

imports_to_add = "import { X, Camera } from 'lucide-react'\nimport { getCuentasBancarias, CuentaBancariaEmpresa } from '@/lib/services/datosBancariosService'\n"
content = content.replace("import { Check, CreditCard, Building, Upload, AlertCircle, Loader2 } from \"lucide-react\"", "import { Check, CreditCard, Building, Upload, AlertCircle, Loader2, X, Camera } from \"lucide-react\"\nimport { getCuentasBancarias, CuentaBancariaEmpresa } from '@/lib/services/datosBancariosService'")

states_to_add = """
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedPlanForTransfer, setSelectedPlanForTransfer] = useState<any>(null)
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancariaEmpresa[]>([])
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)
"""
content = content.replace("const [isProcessing, setIsProcessing] = useState(false)", "const [isProcessing, setIsProcessing] = useState(false)\n" + states_to_add)

fetch_to_add = """
      const ctas = await getCuentasBancarias()
      setCuentasBancarias(ctas)
"""
content = content.replace("if (planesData) setPlanes(planesData)", "if (planesData) setPlanes(planesData)\n" + fetch_to_add)

handle_subscribe_replace = """
    } else {
      const plan = planes.find(p => p.id === planId)
      setSelectedPlanForTransfer(plan)
      setShowTransferModal(true)
      setIsProcessing(false)
    }
"""
# Replace the setTimeout block
import re
content = re.sub(
    r'setTimeout\(\(\) => \{.*?setIsProcessing\(false\).*?\}, 1500\)',
    'const plan = planes.find(p => p.id === planId);\n      setSelectedPlanForTransfer(plan);\n      setShowTransferModal(true);\n      setIsProcessing(false);',
    content,
    flags=re.DOTALL
)

# Modal component logic and render
modal_code = """
  const handleUploadReceipt = async () => {
    if (!receiptFile || !selectedPlanForTransfer) return;
    setUploadingReceipt(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // 1. Subir comprobante a Storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `comprobante-${user.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sara-assets')
        .upload(`comprobantes/${fileName}`, receiptFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('sara-assets').getPublicUrl(`comprobantes/${fileName}`);

      // 2. Crear orden_pago
      const { error: dbError } = await supabase.from('ordenes_pago').insert({
        user_id: user.id,
        modulo: 'saas',
        referencia_id: selectedPlanForTransfer.id,
        concepto: `Suscripción SaaS APU - Plan ${selectedPlanForTransfer.nombre}`,
        monto: selectedPlanForTransfer.precio,
        moneda: 'USD',
        estado: 'pendiente'
      });

      if (dbError) throw dbError;
      
      // Intentamos guardar la URL en metadata si existiese alguna forma, pero por ahora dependemos de que el admin revise
      // Lo ideal es que luego alteremos la BD para añadir comprobante_url.
      
      setTransferSuccess(true);
    } catch (err: any) {
      alert("Error al subir el comprobante: " + err.message);
    } finally {
      setUploadingReceipt(false);
    }
  };

"""

# Insert modal_code before return (
content = content.replace("return (\n    <div className=\"max-w-5xl", modal_code + "\n  return (\n    <div className=\"max-w-5xl")

modal_jsx = """
      {/* MODAL DE TRANSFERENCIA */}
      {showTransferModal && selectedPlanForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Pago por Transferencia</h3>
                <p className="text-sm text-slate-500">Plan {selectedPlanForTransfer.nombre} - ${selectedPlanForTransfer.precio}</p>
              </div>
              <button onClick={() => { setShowTransferModal(false); setTransferSuccess(false); setReceiptFile(null); }} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {transferSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900">¡Comprobante Enviado!</h4>
                  <p className="text-slate-600 max-w-md mx-auto">Hemos recibido tu comprobante. Nuestro equipo lo verificará y activará tu plan en las próximas horas.</p>
                  <button onClick={() => { setShowTransferModal(false); setTransferSuccess(false); setReceiptFile(null); }} className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">
                    Entendido
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Cuentas Disponibles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cuentasBancarias.map((cta) => (
                        <div key={cta.id} className="p-4 rounded-2xl border border-slate-200 bg-white relative overflow-hidden group">
                          {cta.qrUrl && (
                            <div className="absolute top-4 right-4 w-12 h-12 rounded bg-slate-100 p-1 border border-slate-200 cursor-pointer overflow-hidden hover:scale-[2] origin-top-right transition-transform shadow-sm">
                              <img src={cta.qrUrl} alt="QR de Pago" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <p className="text-xs font-bold text-blue-600 mb-2">{cta.banco}</p>
                          <p className="text-sm font-black text-slate-900 font-mono tracking-wider">{cta.numeroCuenta}</p>
                          <p className="text-[10px] text-slate-500 uppercase mt-1">{cta.tipoCuenta}</p>
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                            <p className="text-[11px] text-slate-600"><b>A nombre de:</b> {cta.beneficiario}</p>
                            <p className="text-[11px] text-slate-600"><b>RUC:</b> {cta.cedulaRuc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <Upload size={18} /> Adjuntar Comprobante
                    </h4>
                    
                    <label className={`w-full flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${receiptFile ? 'border-blue-500 bg-blue-100/50' : 'border-blue-300 hover:bg-blue-100/50 bg-white'}`}>
                      <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)} />
                      {receiptFile ? (
                        <div className="text-center text-blue-700">
                          <Check size={24} className="mx-auto mb-2" />
                          <span className="text-sm font-bold block">{receiptFile.name}</span>
                        </div>
                      ) : (
                        <div className="text-center text-blue-600/70">
                          <Camera size={24} className="mx-auto mb-2" />
                          <span className="text-sm font-medium block">Click para subir foto o PDF</span>
                        </div>
                      )}
                    </label>

                    <button 
                      onClick={handleUploadReceipt}
                      disabled={!receiptFile || uploadingReceipt}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
                    >
                      {uploadingReceipt ? <Loader2 size={18} className="animate-spin" /> : "Enviar para Aprobación"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
"""
content = content.replace("</div>\n    </div>\n  )\n}", "</div>\n" + modal_jsx + "    </div>\n  )\n}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Transfer Modal implemented")
