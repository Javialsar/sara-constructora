path = 'src/app/admin/presupuestos_reales/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

variables = ['pmaq1', 'pmob1', 'pmat1', 'ggen', 'pgas1', 'pgas2', 'pgas3', 'pimp', 'util']

for v in variables:
    # We find the <div className="flex items-center w-24"> that wraps the input
    # Oh wait! The wrapper is `<div className="flex items-center border-2 ...">` inside it.
    
    start_tag = f'setIndForm({{...indForm, {v}: String(Math.max(0, (Number(indForm.{v})||0) - 0.1).toFixed(1))}})'
    
    # Let's find the `border-2 border-brand-sage/40 rounded-lg overflow-hidden w-28 h-9 shadow-inner bg-blue-50 focus-within:border-brand-sage focus-within:bg-white transition-all`
    wrapper_start = c.find('<div className="flex items-center border-2 border-brand-sage/40 rounded-lg overflow-hidden w-28 h-9 shadow-inner bg-blue-50 focus-within:border-brand-sage focus-within:bg-white transition-all">', c.find(f'${v}</span>'))
    
    if wrapper_start != -1:
        wrapper_end = c.find('</div>', wrapper_start) + 6
        old_div = c[wrapper_start:wrapper_end]
        
        # Verify it has our variable
        if v in old_div:
            new_input = f'<input type="number" step="0.1" min="0" value={{indForm.{v}}} onChange={{(e) => setIndForm({{\x2E\x2E\x2EindForm, {v}: e.target.value}})}} className="w-24 h-9 admin-spin bg-blue-200 border-none rounded font-bold text-center text-gray-800 outline-none focus:ring-2 focus:ring-brand-sage" />'
            c = c.replace(old_div, new_input)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Replaced all inputs directly via python")
