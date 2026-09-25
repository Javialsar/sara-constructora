const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

const regex = /const evalFormula = \(formulaStr, varsObj\) => \{[\s\S]*?catch \(e\) \{\s*return 0;\s*\}\s*\};/g;

const newEval = `const evalFormula = (formulaStr, varsObj) => {
  try {
    let s = String(formulaStr || '');
    for (const [k, v] of Object.entries(varsObj)) {
      const rx = new RegExp('\\\\$' + k + '\\\\b', 'g');
      s = s.replace(rx, v);
    }
    s = s.replace(/[^0-9+\\-*/().]/g, '');
    if (!s) return 0;
    return new Function('return ' + s)() || 0;
  } catch (e) {
    return 0;
  }
};`;

c = c.replace(regex, newEval);

// Wait! We corrupted the string earlier, let's make sure it's actually fixing it.
// The corrupted file has:
// s = s.replace(new RegExp('\\
//          }
//          s = s.replace(/[^0-9+\-*/().]/g, '');
//          if (!s) return 0;
//          return new Function('return ' + s)() || 0;
//        } catch (e) {
//          return 0;
//        }
//      };

const corruptRegex = /const evalFormula = \(formulaStr, varsObj\) => \{[\s\S]*?return 0;\s*\}\s*\};/g;

c = c.replace(corruptRegex, newEval);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
console.log('Fixed syntax error!');
