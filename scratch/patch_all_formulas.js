const fs = require('fs');

let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

// 1. Extend defaultFormulas
const newDefaultFormulas = `const defaultFormulas = {
  dmob1: "$smob * $pmob1 / 100",
  cmob: "$smob + $dmob1",
  dmaq1: "$cmob * $pmaq1 / 100",
  cmaq: "$smaq + $dmaq1",
  dmat1: "$smat * $pmat1 / 100",
  cmat: "$smat + $dmat1",
  cdir: "$cmat + $cmob + $cmaq",
  sggen: "$cdir * $ggen / 100",
  sgas1: "$cdir * $pgas1 / 100",
  sgas2: "$cdir * $pgas2 / 100",
  sgas3: "$cdir * $pgas3 / 100",
  cgas: "$sggen + $sgas1 + $sgas2 + $sgas3",
  cnet: "$cdir + $sggen + $sgas1 + $sgas2 + $sgas3",
  simp: "$cdir * $pimp / 100",
  cimp: "$cdir + $simp",
  sutil: "$cdir * $util / 100",
  granTotal: "$cnet + $sutil + $simp"
};`;

// Replace existing defaultFormulas block
c = c.replace(/const defaultFormulas = \{[\s\S]*?\};/, newDefaultFormulas);


// 2. Extend calcTotales block
const calcStart = c.indexOf("const ind = { pmaq1: 5");
const calcEnd = c.indexOf("// Resumen variables para UI", calcStart);

const newCalc = `const ind = { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0, ...(currentPresupuesto?.indirectos_config || {}), ...(indForm || {}) };
    const f = ind.formulas || defaultFormulas;

    const evalFormula = (formulaStr, varsObj) => {
      try {
        let s = String(formulaStr || '');
        // Sort keys by length descending to prevent partial replacements (e.g. replacing $cmat before $cmat1 if they existed)
        const sortedKeys = Object.keys(varsObj).sort((a, b) => b.length - a.length);
        for (const k of sortedKeys) {
          s = s.split('$' + k).join(varsObj[k]);
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
    const cmob = evalFormula(f.cmob, vars); vars.cmob = cmob;

    const dmaq1 = evalFormula(f.dmaq1, vars); vars.dmaq1 = dmaq1;
    const cmaq = evalFormula(f.cmaq, vars); vars.cmaq = cmaq;

    const dmat1 = evalFormula(f.dmat1, vars); vars.dmat1 = dmat1;
    const cmat = evalFormula(f.cmat, vars); vars.cmat = cmat;

    const costoDirectoTotal = evalFormula(f.cdir, vars); vars.cdir = costoDirectoTotal;

    const sggen = evalFormula(f.sggen, vars); vars.sggen = sggen;
    const sgas1 = evalFormula(f.sgas1, vars); vars.sgas1 = sgas1;
    const sgas2 = evalFormula(f.sgas2, vars); vars.sgas2 = sgas2;
    const sgas3 = evalFormula(f.sgas3, vars); vars.sgas3 = sgas3;

    const totalGastosGenerales = evalFormula(f.cgas, vars); vars.cgas = totalGastosGenerales;
    const cnet = evalFormula(f.cnet, vars); vars.cnet = cnet;

    const simp = evalFormula(f.simp, vars); vars.simp = simp;
    const cimp = evalFormula(f.cimp, vars); vars.cimp = cimp;
    const sutil = evalFormula(f.sutil, vars); vars.sutil = sutil;

    const granTotal = evalFormula(f.granTotal, vars); vars.granTotal = granTotal;

    `;

c = c.slice(0, calcStart) + newCalc + c.slice(calcEnd);

// 3. Simple replace for ALL UI text nodes
const replacements = {
  '$cmob * $pmaq1 / 100': 'dmaq1',
  '$smaq + $dmaq1': 'cmaq',
  '$smob * $pmob1 / 100': 'dmob1',
  '$smob + $dmob1': 'cmob',
  '$smat * $pmat1 / 100': 'dmat1',
  '$smat + $dmat1': 'cmat',
  '$cmat + $cmob + $cmaq': 'cdir',
  '$cdir * $ggen / 100': 'sggen',
  '$cdir * $pgas1 / 100': 'sgas1',
  '$cdir * $pgas2 / 100': 'sgas2',
  '$cdir * $pgas3 / 100': 'sgas3',
  '$sggen + $sgas1 + $sgas2 + $sgas3': 'cgas',
  '$cdir + $sggen + $sgas1 + $sgas2 + $sgas3': 'cnet',
  '$cdir * $pimp / 100': 'simp',
  '$cdir + $simp': 'cimp',
  '$cdir * $util / 100': 'sutil',
  '$cnet + $sutil + $simp': 'granTotal'
};

for (const [textStr, k] of Object.entries(replacements)) {
  const target = '<div className="flex-1 font-mono text-gray-500">' + textStr + '</div>';
  const replacement = "{showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas)." + k + "} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), " + k + ": e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas)." + k + "}</div> )}";
  
  c = c.replace(target, replacement);
}

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
console.log('Patch complete!');
