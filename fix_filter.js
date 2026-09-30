const fs = require('fs');

let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

// The original line likely had:
// const matchPago = filtroPago === "todos" || (inm.promocion || {}).estadoPago === filtroPago
// because of my previous mass replace `inm.promocion.` -> `(inm.promocion || {}).`
// Or it might still be `inm.promocion.estadoPago` if my replace didn't hit it.

content = content.replace(
  /const matchPago = filtroPago === \"todos\" \|\| (inm\.promocion\.estadoPago|\(inm\.promocion \|\| \{\}\)\.estadoPago) === filtroPago/g,
  'const matchPago = filtroPago === "todos" || (inm.promocion && inm.promocion.estadoPago === filtroPago)'
);

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
console.log('Fixed useMemo filter in admin/inmobiliaria/page.tsx');
