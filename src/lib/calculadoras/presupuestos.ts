export const defaultFormulas = {
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
};

export function calcularTotalesPresupuesto({
  presupuestoRubros,
  rubrosRecipes,
  currentPresupuesto,
  indForm
}: {
  presupuestoRubros: any[];
  rubrosRecipes: any;
  currentPresupuesto: any;
  indForm: any;
}) {
  let smaq = 0;
  let smob = 0;
  let smat = 0;

  let sumaSubtotales = 0; 
  presupuestoRubros.forEach(pr => sumaSubtotales += Number(pr.subtotal || 0));
  presupuestoRubros.forEach(pr => {
    const q = Number(pr.cantidad_obra || 0);
    const items = rubrosRecipes[pr.id] || [];
    items.forEach((item: any) => {
      const ism = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
      if (!ism) return;
      const cost = Number(item.cantidad) * Number(item.precio_sin_iva_snapshot) * q;
      if (ism.tipo === 'material') smat += cost;
      else if (ism.tipo === 'mano_de_obra') smob += cost;
      else if (ism.tipo === 'equipo' || ism.tipo === 'herramienta_menor') smaq += cost;
    });
  });

  if (smat === 0 && smob === 0 && smaq === 0 && sumaSubtotales > 0) {
    smat = sumaSubtotales;
  }

  const ind = { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0, ...(currentPresupuesto?.indirectos_config || {}), ...(indForm || {}) };
  const f = ind.formulas || defaultFormulas;

  const safeEvaluateArithmetic = (expression: string): number => {
    const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
    if (!sanitized) return 0;

    const tokens: (string | number)[] = [];
    let i = 0;
    while (i < sanitized.length) {
      const ch = sanitized[i];
      if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '(' || ch === ')') {
        tokens.push(ch);
        i++;
      } else if ((ch >= '0' && ch <= '9') || ch === '.') {
        let numStr = '';
        while (i < sanitized.length && ((sanitized[i] >= '0' && sanitized[i] <= '9') || sanitized[i] === '.')) {
          numStr += sanitized[i];
          i++;
        }
        tokens.push(parseFloat(numStr) || 0);
      } else {
        i++;
      }
    }

    let pos = 0;

    const parseFactor = (): number => {
      if (pos >= tokens.length) return 0;
      let sign = 1;
      if (tokens[pos] === '+') {
        pos++;
      } else if (tokens[pos] === '-') {
        sign = -1;
        pos++;
      }

      if (pos >= tokens.length) return 0;
      const token = tokens[pos];
      if (token === '(') {
        pos++;
        const val = parseExpr();
        if (pos < tokens.length && tokens[pos] === ')') {
          pos++;
        }
        return sign * val;
      } else if (typeof token === 'number') {
        pos++;
        return sign * token;
      }
      return 0;
    };

    const parseTerm = (): number => {
      let result = parseFactor();
      while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
        const op = tokens[pos++];
        const right = parseFactor();
        if (op === '*') {
          result *= right;
        } else if (op === '/') {
          result = right !== 0 ? result / right : 0;
        }
      }
      return result;
    };

    const parseExpr = (): number => {
      let result = parseTerm();
      while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
        const op = tokens[pos++];
        const right = parseTerm();
        if (op === '+') {
          result += right;
        } else if (op === '-') {
          result -= right;
        }
      }
      return result;
    };

    return parseExpr() || 0;
  };

  const evalFormula = (formulaStr: string, varsObj: any) => {
    try {
      let s = String(formulaStr || '');
      const sortedKeys = Object.keys(varsObj).sort((a, b) => b.length - a.length);
      for (const k of sortedKeys) {
        s = s.split('$' + k).join(varsObj[k]);
      }
      return safeEvaluateArithmetic(s);
    } catch (e) {
      return 0;
    }
  };

  let vars: any = {
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

  const a = totalGastosGenerales;
  const i = simp;
  const u = sutil;
  return { 
    costoDirectoTotal, a, i, u, granTotal, 
    smaq, smob, smat, 
    dmaq1, dmob1, dmat1, 
    cmaq, cmob, cmat, 
    sggen, sgas1, sgas2, sgas3, 
    totalGastosGenerales, cnet, simp, sutil
  }
}

/**
 * Calcula los coeficientes de la Fórmula Polinómica de Reajuste de Precios (LOSNCP / SERCOP / INEC)
 * Garantiza invariante matemática estricta: sum(p_i) === 1.000 y p_x <= 0.200
 */
export function calcularFormulaPolinomicaINEC(costos: {
  manoObra: number;
  cemento: number;
  acero: number;
  aridos: number;
  equipos: number;
  otros: number;
}): {
  coeficientes: Record<string, number>;
  sumaCoeficientes: number;
  cumpleNormaSercop: boolean;
} {
  const total =
    Math.max(0, costos.manoObra) +
    Math.max(0, costos.cemento) +
    Math.max(0, costos.acero) +
    Math.max(0, costos.aridos) +
    Math.max(0, costos.equipos) +
    Math.max(0, costos.otros);

  if (total <= 0) {
    return {
      coeficientes: {
        p1_mano_obra: 0.350,
        p2_acero: 0.220,
        p3_cemento: 0.160,
        p4_aridos: 0.080,
        p5_equipos: 0.070,
        px_otros: 0.120,
      },
      sumaCoeficientes: 1.000,
      cumpleNormaSercop: true,
    };
  }

  let rawP1 = Math.max(0, costos.manoObra) / total;
  let rawP2 = Math.max(0, costos.acero) / total;
  let rawP3 = Math.max(0, costos.cemento) / total;
  let rawP4 = Math.max(0, costos.aridos) / total;
  let rawP5 = Math.max(0, costos.equipos) / total;
  let rawPx = Math.max(0, costos.otros) / total;

  // Regla SERCOP: el coeficiente de residuo/varios (px) no puede superar 0.200
  if (rawPx > 0.200) {
    const exceso = rawPx - 0.200;
    rawPx = 0.200;
    const basePrincipales = rawP1 + rawP2 + rawP3 + rawP4 + rawP5;
    if (basePrincipales > 0) {
      rawP1 += exceso * (rawP1 / basePrincipales);
      rawP2 += exceso * (rawP2 / basePrincipales);
      rawP3 += exceso * (rawP3 / basePrincipales);
      rawP4 += exceso * (rawP4 / basePrincipales);
      rawP5 += exceso * (rawP5 / basePrincipales);
    } else {
      rawP1 += exceso;
    }
  }

  let p1 = Math.round(rawP1 * 1000) / 1000;
  const p2 = Math.round(rawP2 * 1000) / 1000;
  const p3 = Math.round(rawP3 * 1000) / 1000;
  const p4 = Math.round(rawP4 * 1000) / 1000;
  const p5 = Math.round(rawP5 * 1000) / 1000;
  const px = Math.min(0.200, Math.round(rawPx * 1000) / 1000);

  // Ajuste de milésima sobre p1 (mano de obra) para garantizar suma exacta = 1.000
  const sumaParcial = +(p1 + p2 + p3 + p4 + p5 + px).toFixed(3);
  const delta = +(1.000 - sumaParcial).toFixed(3);
  p1 = +(p1 + delta).toFixed(3);

  const sumaCoeficientes = +(p1 + p2 + p3 + p4 + p5 + px).toFixed(3);

  return {
    coeficientes: {
      p1_mano_obra: p1,
      p2_acero: p2,
      p3_cemento: p3,
      p4_aridos: p4,
      p5_equipos: p5,
      px_otros: px,
    },
    sumaCoeficientes,
    cumpleNormaSercop: sumaCoeficientes === 1.000 && px <= 0.200,
  };
}
