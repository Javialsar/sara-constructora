const fs = require('fs');

function patchAll() {
  let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

  // 1. Add defaultFormulas definition at the top of the file
  if (!c.includes('const defaultFormulas = {')) {
    const importSpot = c.indexOf('export default function PresupuestosRealesPage() {');
    const df = `
const defaultFormulas = {
  dmob1: "$smob * $pmob1 / 100",
  dmaq1: "$cmob * $pmaq1 / 100",
  dmat1: "$smat * $pmat1 / 100",
  sggen: "$cdir * $ggen / 100",
  sgas1: "$cdir * $pgas1 / 100",
  sgas2: "$cdir * $pgas2 / 100",
  sgas3: "$cdir * $pgas3 / 100",
  simp: "$cdir * $pimp / 100",
  sutil: "$cdir * $util / 100"
};
`;
    c = c.slice(0, importSpot) + df + c.slice(importSpot);
  }

  // 2. Fix openEditor empty initialization
  c = c.replace(
    /setIndForm\(presupuesto\.indirectos_config \|\| \{ pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 \}\)/g,
    "setIndForm({ pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0, ...(presupuesto.indirectos_config || {}) })"
  );

  // 3. Replace calcTotales logic safely
  const calcStart = c.indexOf("const ind = indForm || currentPresupuesto?.indirectos_config");
  const calcEnd = c.indexOf("// Resumen variables para UI", calcStart);
  
  if (calcStart > -1 && calcEnd > -1) {
    const newCalc = `const ind = { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0, ...(currentPresupuesto?.indirectos_config || {}), ...(indForm || {}) };
    const f = ind.formulas || defaultFormulas;

    const evalFormula = (formulaStr, varsObj) => {
      try {
        let s = String(formulaStr || '');
        for (const [k, v] of Object.entries(varsObj)) {
          s = s.split('$' + k).join(v);
        }
        s = s.replace(/[^0-9+\\-*/().]/g, '');
        if (!s) return 0;
        return new Function('return ' + s)() || 0;
      } catch (e) {
        return 0;
      }
    };

    let vars = {
       smob, smaq, smat,
       pmob1: Number(ind.pmob1)||0, pmaq1: Number(ind.pmaq1)||0, pmat1: Number(ind.pmat1)||0,
       ggen: Number(ind.ggen)||0, pgas1: Number(ind.pgas1)||0, pgas2: Number(ind.pgas2)||0, pgas3: Number(ind.pgas3)||0,
       pimp: Number(ind.pimp)||0, util: Number(ind.util)||0
    };

    const dmob1 = evalFormula(f.dmob1, vars); vars.dmob1 = dmob1;
    const cmob = smob + dmob1; vars.cmob = cmob;

    const dmaq1 = evalFormula(f.dmaq1, vars); vars.dmaq1 = dmaq1;
    const cmaq = smaq + dmaq1; vars.cmaq = cmaq;

    const dmat1 = evalFormula(f.dmat1, vars); vars.dmat1 = dmat1;
    const cmat = smat + dmat1; vars.cmat = cmat;

    const costoDirectoTotal = cmat + cmob + cmaq; vars.cdir = costoDirectoTotal;

    const sggen = evalFormula(f.sggen, vars); vars.sggen = sggen;
    const sgas1 = evalFormula(f.sgas1, vars); vars.sgas1 = sgas1;
    const sgas2 = evalFormula(f.sgas2, vars); vars.sgas2 = sgas2;
    const sgas3 = evalFormula(f.sgas3, vars); vars.sgas3 = sgas3;

    const totalGastosGenerales = sggen + sgas1 + sgas2 + sgas3;
    const cnet = costoDirectoTotal + totalGastosGenerales; vars.cnet = cnet;

    const simp = evalFormula(f.simp, vars); vars.simp = simp;
    const sutil = evalFormula(f.sutil, vars); vars.sutil = sutil;

    const granTotal = cnet + sutil + simp; vars.granTotal = granTotal;

    `;
    c = c.slice(0, calcStart) + newCalc + c.slice(calcEnd);
  }

  // 4. Replace formulas in UI
  const keys = ['dmaq1', 'dmob1', 'dmat1', 'sggen', 'sgas1', 'sgas2', 'sgas3', 'simp', 'sutil'];
  const hardcodedMap = {
    'dmaq1': '\\\\$cmob \\\\* \\\\$pmaq1 \\\\/ 100',
    'dmob1': '\\\\$smob \\\\* \\\\$pmob1 \\\\/ 100',
    'dmat1': '\\\\$smat \\\\* \\\\$pmat1 \\\\/ 100',
    'sggen': '\\\\$cdir \\\\* \\\\$ggen \\\\/ 100',
    'sgas1': '\\\\$cdir \\\\* \\\\$pgas1 \\\\/ 100',
    'sgas2': '\\\\$cdir \\\\* \\\\$pgas2 \\\\/ 100',
    'sgas3': '\\\\$cdir \\\\* \\\\$pgas3 \\\\/ 100',
    'simp': '\\\\$cdir \\\\* \\\\$pimp \\\\/ 100',
    'sutil': '\\\\$cdir \\\\* \\\\$util \\\\/ 100'
  };

  for (const k of keys) {
    const rx = new RegExp('<div className="flex-1 font-mono text-gray-500">' + hardcodedMap[k] + '<\\/div>', 'g');
    const replacement = "{showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas)." + k + "} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), " + k + ": e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas)." + k + "}</div> )}";
    c = c.replace(rx, replacement);
  }

  // 5. Button fixes
  c = c.replace(/<button className="px-4 py-2 text-sm font-bold bg-white border rounded text-gray-700 shadow-sm">% Porcentajes por defecto<\/button>/g,
    "<button onClick={() => setIndForm({...indForm, pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0})} className='px-4 py-2 text-sm font-bold bg-white border rounded text-gray-700 shadow-sm hover:bg-gray-50'>% Porcentajes por defecto</button>"
  );

  c = c.replace(/<button className="px-4 py-2 text-sm font-bold bg-gray-200 border rounded text-gray-500 hover:bg-gray-300">Sumatoria Formulas por defecto<\/button>/g,
    "<button onClick={() => setIndForm({...indForm, formulas: defaultFormulas})} className='px-4 py-2 text-sm font-bold bg-gray-200 border rounded text-gray-500 hover:bg-gray-300'>Restaurar Fórmulas por defecto</button>"
  );

  fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
  console.log('All patches applied cleanly!');
}

patchAll();
