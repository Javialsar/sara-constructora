const fs = require('fs');
let c = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

const regex = /{activeTab === 'recargas' && \([\s\S]*?\)}\n\n      {\/\* TOAST NOTIFICATION \*\//;

const replacement = `{activeTab === 'recargas' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Historial de Recargas</h2>
                <p className="text-slate-500 mt-1">Verifica tus pagos y transferencias a la billetera SARA.</p>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg flex items-center gap-6 min-w-[250px]">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Disponible</p>
                  <p className="text-3xl font-black text-emerald-400">$119.00</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-full">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                      <th className="p-4">Fecha y Hora</th>
                      <th className="p-4">Referencia / Comprobante</th>
                      <th className="p-4">Forma de Pago</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Valor Recargado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-600 font-medium">12 Oct 2026, 15:30</td>
                      <td className="p-4 text-slate-500 text-sm font-mono flex items-center"><FileText className="w-4 h-4 mr-2 text-slate-400"/> TRX-99882211</td>
                      <td className="p-4">
                        <span className="flex items-center text-slate-600 text-sm">
                          <CreditCard className="w-4 h-4 mr-2 text-blue-500" /> Tarjeta Crédito
                        </span>
                      </td>
                      <td className="p-4"><span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">En Verificación</span></td>
                      <td className="p-4 font-black text-emerald-600 text-right text-lg">+$50.00</td>
                    </tr>
                    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-600 font-medium">01 Oct 2026, 09:15</td>
                      <td className="p-4 text-slate-500 text-sm font-mono flex items-center"><FileText className="w-4 h-4 mr-2 text-slate-400"/> TRX-11223344</td>
                      <td className="p-4">
                        <span className="flex items-center text-slate-600 text-sm">
                          <Building className="w-4 h-4 mr-2 text-slate-500" /> Transferencia
                        </span>
                      </td>
                      <td className="p-4"><span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">Aprobado</span></td>
                      <td className="p-4 font-black text-emerald-600 text-right text-lg">+$100.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* TOAST NOTIFICATION */}`;

c = c.replace(regex, replacement);

fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', c);
