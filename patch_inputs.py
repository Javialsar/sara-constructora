import re

path = 'src/app/admin/presupuestos_reales/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

def replacer(m):
    var_name = m.group(1)
    return f'<input type="number" step="0.1" min="0" value={{indForm.{var_name}}} onChange={{(e) => setIndForm({{\x2E\x2E\x2EindForm, {var_name}: e.target.value}})}} className="w-20 h-8 admin-spin bg-blue-100 border border-blue-300 rounded font-bold text-center text-gray-800 outline-none focus:ring-2 focus:ring-brand-sage" />'

# <div className="flex items-center border-2 border-brand-sage/40 rounded-lg overflow-hidden w-28 h-9 shadow-inner bg-blue-50 focus-within:border-brand-sage focus-within:bg-white transition-all">
pattern = r'<div className="flex items-center border-[^>]*>\s*<button[^>]*>.*?</button>\s*<input type="text" value=\{indForm\.([a-zA-Z0-9_]+)\}[^>]*>\s*<button[^>]*>.*?</button>\s*</div>'

c = re.sub(pattern, replacer, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched inputs")
