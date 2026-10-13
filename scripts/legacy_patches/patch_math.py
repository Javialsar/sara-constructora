import re

path = 'src/app/admin/presupuestos_reales/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Fix the math calculation order
calc_totales_old = """    const dmaq1 = smob * ((Number(ind.pmaq1) || 0) / 100);
    const cmaq = smaq + dmaq1;

    const dmob1 = smob * ((Number(ind.pmob1) || 0) / 100);
    const cmob = smob + dmob1;

    const dmat1 = smat * ((Number(ind.pmat1) || 0) / 100);
    const cmat = smat + dmat1;"""

calc_totales_new = """    const dmob1 = smob * ((Number(ind.pmob1) || 0) / 100);
    const cmob = smob + dmob1;

    const dmaq1 = cmob * ((Number(ind.pmaq1) || 0) / 100);
    const cmaq = smaq + dmaq1;

    const dmat1 = smat * ((Number(ind.pmat1) || 0) / 100);
    const cmat = smat + dmat1;"""
c = c.replace(calc_totales_old, calc_totales_new)

# Fix the widget HTML using a regex
def replacer(m):
    var_name = m.group(1)
    return f'<input type="number" step="0.1" min="0" value={{indForm.{var_name}}} onChange={{(e) => setIndForm({{\x2E\x2E\x2EindForm, {var_name}: e.target.value}})}} className="w-24 h-8 admin-spin bg-blue-200 border-none rounded font-medium text-center outline-none focus:ring-2 focus:ring-brand-sage" />'

# The complex div
pattern = r'<div className="flex items-center border-2 border-brand-sage/40 rounded-lg overflow-hidden w-28 h-9 shadow-inner bg-blue-50 focus-within:border-brand-sage focus-within:bg-white transition-all">\s*<button[^>]*>.*?</button>\s*<input type="text" value=\{indForm\.([a-zA-Z0-9_]+)\}[^>]*>\s*<button[^>]*>.*?</button>\s*</div>'

c = re.sub(pattern, replacer, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched math and inputs")
