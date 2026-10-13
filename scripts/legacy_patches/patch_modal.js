const fs = require('fs');

let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

const stateInsert = `
  const [pagoInmueble, setPagoInmueble] = useState<InmuebleOwner | null>(null)
  const [comprobantePago, setComprobantePago] = useState<string>("")
  const [isUploadingComprobante, setIsUploadingComprobante] = useState(false)

  const handleUploadComprobante = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        setComprobantePago(evt.target?.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleEnviarComprobante = async () => {
    if (!pagoInmueble || !comprobantePago) return
    setIsUploadingComprobante(true)
    try {
      // En un caso real se guarda el comprobante en la DB y cambia el estado a algo como 'pago_revision'
      alert("Comprobante enviado exitosamente. SARA Inmobiliaria revisará el pago en breve.")
      setPagoInmueble(null)
      setComprobantePago("")
    } catch(err) {
      console.error(err)
    } finally {
      setIsUploadingComprobante(false)
    }
  }
`;

if (!content.includes('const [pagoInmueble, setPagoInmueble]')) {
  content = content.replace(
    'const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)',
    stateInsert + '\n  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)'
  );
}

content = content.replace(
  /onClick=\{\(\) \=\> alert\(\"Próximamente: Modal de Pago y Subida de Comprobante\"\)\}/g,
  'onClick={() => setPagoInmueble(inm)}'
);

const modalJsx = `
      {/* MODAL DE PAGO Y SUBIDA DE COMPROBANTE */}
      {pagoInmueble && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <DollarSign size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Proceso de Pago</h3>
                  <p className="text-xs text-slate-500 font-medium">Activa la publicación de tu inmueble</p>
                </div>
              </div>
              <button 
                onClick={() => { setPagoInmueble(null); setComprobantePago(""); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
              >
                <XCircle size={22} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Resumen Inmueble */}
              <div className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <img src={pagoInmueble.imagenUrl || "/placeholder-image.jpg"} className="w-24 h-24 object-cover rounded-xl shrink-0" alt="" />
                <div>
                  <h4 className="font-bold text-slate-900 line-clamp-2">{pagoInmueble.titulo}</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {pagoInmueble.ciudad}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 size={12} /> Aprobado por SARA
                  </div>
                </div>
              </div>

              {/* Cuentas Bancarias */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Building2 size={16} className="text-amber-500" />
                  Datos para Transferencia / Depósito
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-xs text-slate-500 mb-0.5">Banco</span>
                      <strong className="text-slate-800">Banco Pichincha</strong>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-0.5">Tipo de Cuenta</span>
                      <strong className="text-slate-800">Corriente</strong>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-0.5">Nro. de Cuenta</span>
                      <strong className="text-slate-800">2100345678</strong>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-0.5">Titular / RUC</span>
                      <strong className="text-slate-800">SARA Constructora S.A. <br/><span className="text-xs">0190123456001</span></strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subida Comprobante */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <UploadCloud size={16} className="text-amber-500" />
                  Sube tu Comprobante
                </h4>
                <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:border-amber-500 transition-colors bg-white text-center cursor-pointer overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={handleUploadComprobante}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {comprobantePago ? (
                    <div className="flex flex-col items-center gap-3">
                      {comprobantePago.startsWith('data:image/') ? (
                        <img src={comprobantePago} alt="Comprobante" className="max-h-32 rounded-lg object-contain" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <CheckCircle2 size={30} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-emerald-700">¡Comprobante cargado!</p>
                        <p className="text-xs text-slate-500 mt-1">Haz clic para cambiar el archivo</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <UploadCloud size={30} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Toca para subir la foto o PDF</p>
                        <p className="text-xs text-slate-400 mt-1">JPG, PNG o PDF (max. 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex gap-3">
              <button 
                onClick={() => { setPagoInmueble(null); setComprobantePago(""); }}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleEnviarComprobante}
                disabled={!comprobantePago || isUploadingComprobante}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black text-sm uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                {isUploadingComprobante ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                Enviar para Verificación
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace('{/* MODAL DETALLE INMUEBLE */}', modalJsx + '\n\n      {/* MODAL DETALLE INMUEBLE */}');

fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
console.log('Added payment modal to mi-portal/page.tsx');
