import re

with open('src/app/admin/configuracion/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

original_qr_block = """                  {/* Código QR */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">URL de Código QR de Pago</label>
                    <input
                      type="text"
                      value={cta.qrUrl || ""}
                      placeholder="https://.../qr.jpg"
                      onChange={(e) => handleCuentaChange(cta.id, "qrUrl", e.target.value)}
                      className="w-full text-xs font-bold p-2 bg-white rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>"""

new_qr_block = """                  {/* Código QR */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Código QR de Pago</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const { createClient } = await import("@/lib/supabase/client")
                              const supabase = createClient()
                              const fileExt = file.name.split('.').pop()
                              const fileName = `qr-${cta.id}-${Date.now()}.${fileExt}`
                              
                              // Asumimos que guardamos en sara-assets/qrs
                              const { error: uploadErr } = await supabase.storage.from('sara-assets').upload(`qrs/${fileName}`, file)
                              if (uploadErr) throw uploadErr
                              
                              const { data } = supabase.storage.from('sara-assets').getPublicUrl(`qrs/${fileName}`)
                              handleCuentaChange(cta.id, "qrUrl", data.publicUrl)
                            } catch (err) {
                              console.error("Error subiendo QR", err)
                              alert("No se pudo subir la imagen del QR.")
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-full text-xs font-bold p-2 bg-white rounded-lg border border-dashed border-amber-300 text-amber-700 flex items-center justify-center gap-2 hover:bg-amber-50 transition-colors">
                          <Upload size={14} />
                          {cta.qrUrl ? "Cambiar Imagen QR" : "Subir Imagen QR"}
                        </div>
                      </div>
                      {cta.qrUrl && (
                        <a href={cta.qrUrl} target="_blank" className="p-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600" title="Ver QR">
                          <LinkIcon size={14} />
                        </a>
                      )}
                    </div>
                  </div>"""

content = content.replace(original_qr_block, new_qr_block)

with open('src/app/admin/configuracion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("QR upload patched in Admin Configuracion.")
