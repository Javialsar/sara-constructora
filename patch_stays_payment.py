import re

with open('src/app/(public)/stays/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
if 'UploadCloud' not in content:
    content = content.replace('Camera\n}', 'Camera,\n  UploadCloud,\n  Loader2\n}')

# 2. State vars
state_code = """
    const [confirmedReservationCode, setConfirmedReservationCode] = useState<string>("")
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
"""
content = re.sub(
    r'const \[confirmedReservationCode, setConfirmedReservationCode\] = useState<string>\(""\)',
    state_code.strip(),
    content
)

# 3. Handle Confirm Reservation
original_fn = """  const handleConfirmReservation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!bookingStay) return

    setIsProcessingBooking(true)
    const randomCode = `SARA-RSV-2026-${Math.floor(1000 + Math.random() * 9000)}`

    try {
      const payload = {"""

new_fn = """  const handleConfirmReservation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!bookingStay) return

    if (guestData.metodoPago === 'transferencia' && !receiptFile) {
      alert("Por favor adjunta el comprobante de pago de tu transferencia.")
      return
    }

    setIsProcessingBooking(true)
    const randomCode = `SARA-RSV-2026-${Math.floor(1000 + Math.random() * 9000)}`

    try {
      let finalReceiptUrl = ""
      if (receiptFile) {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const fileExt = receiptFile.name.split('.').pop()
        const fileName = `comprobante-stays-${Date.now()}.${fileExt}`
        const { error: uploadErr } = await supabase.storage.from('sara-assets').upload(`comprobantes/${fileName}`, receiptFile)
        if (uploadErr) {
          console.error(uploadErr)
          alert("Error al subir el comprobante. Inténtalo nuevamente.")
          setIsProcessingBooking(false)
          return
        }
        const { data: urlData } = supabase.storage.from('sara-assets').getPublicUrl(`comprobantes/${fileName}`)
        finalReceiptUrl = urlData.publicUrl
      }

      const payload = {"""

if 'let finalReceiptUrl' not in content:
    content = content.replace(original_fn, new_fn)

# 4. Payload modification
payload_peticiones = """metodoPago: guestData.metodoPago,
        peticionesEspeciales: guestData.peticiones"""
new_payload_peticiones = """metodoPago: guestData.metodoPago,
        peticionesEspeciales: guestData.peticiones,
        comprobanteUrl: typeof finalReceiptUrl !== 'undefined' ? finalReceiptUrl : "" """

if 'comprobanteUrl: typeof' not in content:
    content = content.replace(payload_peticiones, new_payload_peticiones)

# 5. UI injection
ui_original = """<p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Info size={13} className="text-amber-500 shrink-0" />
                        Al emitir tu reserva, tus fechas quedan inmediatamente aseguradas en el sistema. Puedes enviar el comprobante de transferencia al WhatsApp de atención al cliente.
                      </p>"""

ui_new = """<p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Info size={13} className="text-amber-500 shrink-0" />
                        Al emitir tu reserva, tus fechas quedan inmediatamente aseguradas en el sistema.
                      </p>

                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <label className="text-[11px] font-bold text-gray-700 uppercase block mb-2">
                          Adjuntar Comprobante (Obligatorio)
                        </label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${receiptFile ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400 bg-white'}`}>
                            {receiptFile ? (
                              <>
                                <CheckCircle2 className="text-amber-600" size={24} />
                                <span className="font-bold text-amber-900 text-xs text-center">{receiptFile.name}</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="text-gray-400" size={24} />
                                <span className="font-bold text-gray-600 text-xs text-center">Haz clic para subir o arrastra tu comprobante</span>
                                <span className="text-[10px] text-gray-400 text-center">Formatos: JPG, PNG, PDF (Máx. 5MB)</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>"""

content = content.replace(ui_original, ui_new)

with open('src/app/(public)/stays/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied to Stays.")
