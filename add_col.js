const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

// Replace Header
content = content.replace(
  '<th className="px-5 py-3.5 text-center">Estado de Pago</th>',
  '<th className="px-5 py-3.5 text-center">Verificación & Pago</th>'
);

// Replace TD
const oldTd = `                      {/* Estado de Pago */}
                      <td className="px-5 py-4 text-center">
                        {(inm.promocion || {}).estadoPago === "al_dia" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            Al Día
                          </span>
                        )}
                        {(inm.promocion || {}).estadoPago === "por_vencer" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <Clock size={13} className="text-amber-600" />
                            Por Vencer
                          </span>
                        )}
                        {(inm.promocion || {}).estadoPago === "vencido" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            <AlertTriangle size={13} className="text-red-600" />
                            Cuota Vencida
                          </span>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          Total Pagado: \${(inm.promocion || {}).totalRecaudado}
                        </p>
                      </td>`;

const newTd = `                      {/* Verificación & Estado de Pago */}
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
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              Al Día
                            </span>
                          )}
                          {(inm.promocion || {}).estadoPago === "por_vencer" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                              <Clock size={13} className="text-amber-600" />
                              Por Vencer
                            </span>
                          )}
                          {(inm.promocion || {}).estadoPago === "vencido" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                              <AlertTriangle size={13} className="text-red-600" />
                              Cuota Vencida
                            </span>
                          )}
                          {(inm.promocion || {}).estadoPago === "pendiente" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
                              <Clock size={13} className="text-gray-500" />
                              Pago Pend.
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5">
                          Pagado: \${(inm.promocion || {}).totalRecaudado || 0}
                        </p>
                      </td>`;

content = content.replace(oldTd, newTd);

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
