const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Reemplazar el estado indForm
if (!code.includes("pmaq1: 5")) {
  code = code.replace(
    /const \[indForm, setIndForm\] = useState\(\{ admin: 10, imprevistos: 5, utilidad: 10 \}\)/,
    `const [indForm, setIndForm] = useState({ pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 })`
  );
}

// 2. Reemplazar setIndForm al abrir/cambiar presupuesto
code = code.replace(
  /setIndForm\(\{ admin: presupuesto\.porcentaje_admin \|\| 0, imprevistos: presupuesto\.porcentaje_imprevistos \|\| 0, utilidad: presupuesto\.porcentaje_utilidad \|\| 0 \}\)/g,
  `setIndForm(presupuesto.indirectos_config || { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 })`
);

// 3. Reemplazar la lgica de clculo
const mathBlockRegex = /const costoDirectoTotal = presupuestoRubros\.reduce\(\(acc, curr\) => acc \+ Number\(curr\.subtotal\), 0\)\s*const a = costoDirectoTotal \* \(\(currentPresupuesto\?\.porcentaje_admin \|\| 0\) \/ 100\)\s*const i = costoDirectoTotal \* \(\(currentPresupuesto\?\.porcentaje_imprevistos \|\| 0\) \/ 100\)\s*const u = costoDirectoTotal \* \(\(currentPresupuesto\?\.porcentaje_utilidad \|\| 0\) \/ 100\)\s*const granTotal = costoDirectoTotal \+ a \+ i \+ u/;

const newMathBlock = `let smaq = 0;
    let smob = 0;
    let smat = 0;

    presupuestoRubros.forEach(pr => {
      const q = Number(pr.cantidad || 0);
      const items = rubrosRecipes[pr.id] || [];
      items.forEach(item => {
        const ism = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
        if (!ism) return;
        const cost = Number(item.cantidad) * Number(item.precio_sin_iva_snapshot) * q;
        if (ism.tipo === 'material') smat += cost;
        else if (ism.tipo === 'mano_de_obra') smob += cost;
        else if (ism.tipo === 'equipo' || ism.tipo === 'herramienta_menor') smaq += cost;
      });
    });

    const ind = currentPresupuesto?.indirectos_config || { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 };

    const dmaq1 = smob * (ind.pmaq1 / 100);
    const cmaq = smaq + dmaq1;

    const dmob1 = smob * (ind.pmob1 / 100);
    const cmob = smob + dmob1;

    const dmat1 = smat * (ind.pmat1 / 100);
    const cmat = smat + dmat1;

    const costoDirectoTotal = cmat + cmob + cmaq;

    const sggen = costoDirectoTotal * (ind.ggen / 100);
    const sgas1 = costoDirectoTotal * (ind.pgas1 / 100);
    const sgas2 = costoDirectoTotal * (ind.pgas2 / 100);
    const sgas3 = costoDirectoTotal * (ind.pgas3 / 100);
    const totalGastosGenerales = sggen + sgas1 + sgas2 + sgas3;

    const cnet = costoDirectoTotal + totalGastosGenerales;

    const simp = costoDirectoTotal * (ind.pimp / 100);
    const sutil = costoDirectoTotal * (ind.util / 100);

    const granTotal = cnet + sutil + simp;

    // Resumen variables para UI
    const a = totalGastosGenerales;
    const i = simp;
    const u = sutil;`;

code = code.replace(mathBlockRegex, newMathBlock);

// 4. Reemplazar UI Tab Costos Indirectos (el div entero)
// Es complejo hacerlo con Regex. Usaremos indexOf para extraer el tab de indirectos y reescribirlo.

const startIndex = code.indexOf(`{activeTab === 'indirectos' && (`);
const endIndex = code.indexOf(`{activeTab === 'reportes' && (`);

if (startIndex > -1 && endIndex > -1) {
  const newUI = `{activeTab === 'indirectos' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-bold bg-white border rounded text-gray-700 shadow-sm">% Porcentajes por defecto</button>
                    <button className="px-4 py-2 text-sm font-bold bg-gray-200 border rounded text-gray-500 hover:bg-gray-300">Sumatoria Formulas por defecto</button>
                    <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" defaultChecked className="rounded text-brand-sage focus:ring-brand-sage"/> Visualizar frmulas</label>
                  </div>
                  <button onClick={handleSavePresupuesto} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors">
                    <Save size={16} /> Grabar
                  </button>
                </div>

                <div className="w-full text-sm">
                  {/* EQUIPOS */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between">
                    <span>1.- Equipos</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center">
                      <div className="w-1/3 text-right pr-4 text-gray-600 font-medium">Subtotal Materiales y Equipos</div>
                      <div className="w-24 text-right pr-4 font-mono">{smaq.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $smaq =</div>
                      <div className="flex-1 text-gray-500">Suma de Materiales y Equipos</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Herramientas Menores % M.O.</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pmaq1</span>
                        <input type="number" step="0.1" value={indForm.pmaq1} onChange={e => setIndForm({...indForm, pmaq1: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{dmaq1.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $dmaq1 =</div>
                      <div className="flex-1 font-mono text-gray-500">$cmob * $pmaq1 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total Equipos</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{cmaq.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cmaq =</div>
                      <div className="flex-1 font-mono text-gray-500">$smaq + $dmaq1</div>
                    </div>
                  </div>

                  {/* MANO DE OBRA */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between mt-4">
                    <span>2.- Mano de Obra</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center">
                      <div className="w-1/3 text-right pr-4 text-gray-600 font-medium">Subtotal Mano de Obra</div>
                      <div className="w-24 text-right pr-4 font-mono">{smob.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $smob =</div>
                      <div className="flex-1 text-gray-500">Suma de Mano de Obra</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium"></div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pmob1</span>
                        <input type="number" step="0.1" value={indForm.pmob1} onChange={e => setIndForm({...indForm, pmob1: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{dmob1.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $dmob1 =</div>
                      <div className="flex-1 font-mono text-gray-500">$smob * $pmob1 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total Mano de Obra</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{cmob.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cmob =</div>
                      <div className="flex-1 font-mono text-gray-500">$smob + $dmob1</div>
                    </div>
                  </div>

                  {/* MATERIALES */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between mt-4">
                    <span>3.- Materiales</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center">
                      <div className="w-1/3 text-right pr-4 text-gray-600 font-medium">Subtotal Materiales</div>
                      <div className="w-24 text-right pr-4 font-mono">{smat.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $smat =</div>
                      <div className="flex-1 text-gray-500">Suma de Materiales</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium"></div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pmat1</span>
                        <input type="number" step="0.1" value={indForm.pmat1} onChange={e => setIndForm({...indForm, pmat1: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{dmat1.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $dmat1 =</div>
                      <div className="flex-1 font-mono text-gray-500">$smat * $pmat1 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total Materiales</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{cmat.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cmat =</div>
                      <div className="flex-1 font-mono text-gray-500">$smat + $dmat1</div>
                    </div>
                    <div className="flex p-2 items-center bg-white font-black py-4">
                      <div className="w-1/3 text-right pr-4 text-gray-900">Costo directo</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono text-lg">{costoDirectoTotal.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cdir =</div>
                      <div className="flex-1 font-mono text-gray-500">$cmat + $cmob + $cmaq</div>
                    </div>
                  </div>

                  {/* GASTOS GENERALES Y ADMINISTRATIVOS */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between mt-4">
                    <span>4.- Gastos generales y administrativos</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Gastos generales = (% de 1+2+3)</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$ggen</span>
                        <input type="number" step="0.1" value={indForm.ggen} onChange={e => setIndForm({...indForm, ggen: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{sggen.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $sggen =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $ggen / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Gastos de obra</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pgas1</span>
                        <input type="number" step="0.1" value={indForm.pgas1} onChange={e => setIndForm({...indForm, pgas1: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{sgas1.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $sgas1 =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $pgas1 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Financiamiento</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pgas2</span>
                        <input type="number" step="0.1" value={indForm.pgas2} onChange={e => setIndForm({...indForm, pgas2: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{sgas2.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $sgas2 =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $pgas2 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Polizas y Seguros</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pgas3</span>
                        <input type="number" step="0.1" value={indForm.pgas3} onChange={e => setIndForm({...indForm, pgas3: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{sgas3.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $sgas3 =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $pgas3 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total gastos generales y administrativos</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{totalGastosGenerales.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">=</div>
                      <div className="flex-1 font-mono text-gray-500">$sggen + $sgas1 + $sgas2 + $sgas3</div>
                    </div>
                    <div className="flex p-2 items-center bg-white font-black py-4">
                      <div className="w-1/3 text-right pr-4 text-gray-900">Costo neto</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono text-lg">{cnet.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cnet =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir + $sggen + $sgas1 + $sgas2 + $sgas3</div>
                    </div>
                  </div>

                  {/* IMPREVISTOS */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between mt-4">
                    <span>5.- Imprevistos</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Imprevistos = (% de 1+2+3)</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pimp</span>
                        <input type="number" step="0.1" value={indForm.pimp} onChange={e => setIndForm({...indForm, pimp: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{simp.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $simp =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $pimp / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total de Imprevistos</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{simp.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cimp =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir + $simp</div>
                    </div>
                  </div>

                  {/* UTILIDAD */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between mt-4">
                    <span>6.- Utilidad</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Utilidad = (% de 1+2+3)</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$util</span>
                        <input type="number" step="0.1" value={indForm.util} onChange={e => setIndForm({...indForm, util: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{sutil.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $sutil =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $util / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Precio de venta</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{pven.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $pven =</div>
                      <div className="flex-1 font-mono text-gray-500">$cnet + $sutil + $simp</div>
                    </div>
                    <div className="flex p-2 items-center bg-white font-black py-4">
                      <div className="w-1/3 text-right pr-4 text-gray-900">Total Precio Unitario</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono text-lg">{pven.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $Stotal =</div>
                      <div className="flex-1 font-mono text-gray-500">$pven</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
`;
  
  code = code.substring(0, startIndex) + newUI + code.substring(endIndex);
}

// 5. Arreglar handleSavePresupuesto para enviar la config
code = code.replace(
  /const handleSavePresupuesto = async \(\) => \{/,
  `const handleSavePresupuesto = async () => {
    // Sincronizar indForm al objeto maestro actual
    const updatedPresupuesto = { ...currentPresupuesto, indirectos_config: indForm };
    setCurrentPresupuesto(updatedPresupuesto);`
);

code = code.replace(
  /porcentaje_admin: indForm\.admin,\s*porcentaje_imprevistos: indForm\.imprevistos,\s*porcentaje_utilidad: indForm\.utilidad/,
  `indirectos_config: indForm`
);

fs.writeFileSync(path, code);
console.log("Patched indirectos con exito");
