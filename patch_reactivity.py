import re

with open('src/app/admin/presupuestos_reales/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update calcTotales to use indForm
# Find: const ind = currentPresupuesto?.indirectos_config || { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 };
# Replace with: const ind = indForm || currentPresupuesto?.indirectos_config || { ... }
code = re.sub(
    r"const ind = currentPresupuesto\?.indirectos_config \|\|",
    r"const ind = indForm || currentPresupuesto?.indirectos_config ||",
    code
)

# 2. Make the input boxes larger and centered
# Find: className="w-full border rounded p-1 text-right bg-blue-100"
# Replace with: className="w-20 h-9 text-base border-2 border-brand-sage/40 rounded-lg p-1 text-center bg-blue-50 focus:border-brand-sage focus:bg-white font-bold transition-all shadow-inner"
code = code.replace(
    'className="w-full border rounded p-1 text-right bg-blue-100"',
    'className="w-20 h-9 text-base border-2 border-brand-sage/40 rounded-lg p-1 text-center bg-blue-50 focus:border-brand-sage focus:bg-white font-bold transition-all shadow-inner"'
)

with open('src/app/admin/presupuestos_reales/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Presupuestos reales patched for reactivity and larger inputs!")
