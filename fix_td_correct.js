const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');
const startIdx = content.indexOf('{/* Estado de Pago */}');
if (startIdx !== -1) {
  const endIdx = content.indexOf('</td>', startIdx) + 5;
  const oldText = content.substring(startIdx, endIdx);
  
  const newTd = `{/* Verificación & Estado de Pago */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {/* 1. Verificación */}
                          {inm.estado === "en_verificacion" || !inm.estado ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 w-full justify-center">
                              <ShieldCheck size={12} className="text-amber-600" />
                              Verificando
                            </span>
                          ) : inm.estado === "rechazado" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 w-full justify-center">
                              <AlertTriangle size={12} className="text-red-600" />
                              Rechazado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 w-full justify-center">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              Aprobado
                            </span>
                          )}

                          {/* 2. Pago */}
                          {(inm.promocion || {}).estadoPago === "al_dia" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={11} className="text-emerald-600" />
                              Pago al Día
                            </span>
                          )}
                          {(inm.promocion || {}).estadoPago === "por_vencer" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                              <Clock size={11} className="text-amber-600" />
                              Pago Vence
                            </span>
                          )}
                          {(inm.promocion || {}).estadoPago === "vencido" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              <AlertTriangle size={11} className="text-red-600" />
                              Cuota Vencida
                            </span>
                          )}
                          {(inm.promocion || {}).estadoPago === "pendiente" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
                              <Clock size={11} className="text-gray-500" />
                              Pago Pendiente
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1.5">
                          Cobrado: \${(inm.promocion || {}).totalRecaudado || 0}
                        </p>
                      </td>`;

  content = content.replace(oldText, newTd);
  fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
  console.log('Successfully replaced substring by index!');
} else {
  console.log('Not found');
}
