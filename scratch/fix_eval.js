const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

const regex = /const evalFormula = \(formulaStr, varsObj\) => \{[\s\S]*?catch \(e\) \{\s*return 0;\s*\}\s*\};/;

const cleanEval = `const evalFormula = (formulaStr, varsObj) => {
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
    };`;

c = c.replace(regex, cleanEval);

// Wait, the file is corrupted at the end as well because of my multiple replaces?
// Let's check if the file size is ridiculous. If so, I need to git reset to the working commit, then re-apply.
fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
console.log('Fixed eval!');
