const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const regex = /\{\/\* Botón Cobrar \/ Renovar \*\/\}[\s\S]*?<\/button>/;

const replacement = `{/* Botón Cobrar / Renovar / Validar Pago */}
                          {(inm.promocion || {}).estadoPago === 'pendiente' ? (
                            <button
                              onClick={() => setPagoAValidar(inm)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg shadow-sm transition-all animate-pulse"
                              title="Validar comprobante enviado por el cliente"
                            >
                              <Receipt size={14} />
                              <span>Validar Pago</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenCobroModal(inm)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-sage hover:bg-brand-sage/90 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                              title="Registrar cobro de mensualidad o renovar promoción"
                            >
                              <CreditCard size={14} />
                              <span>Cobrar / Renovar</span>
                            </button>
                          )}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
console.log('Fixed actions');
