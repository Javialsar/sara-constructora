import re
import os

files = [
    'src/app/admin/apus/insumos/page.tsx', 
    'src/app/admin/noticias/page.tsx', 
    'src/app/admin/proveedores/page.tsx', 
    'src/app/admin/trabajadores/page.tsx'
]

for p in files:
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()
    c = re.sub(r'<thead[^>]*>', r'<thead className="bg-slate-100 text-slate-700 border-b border-gray-200 uppercase text-xs">', c, count=1)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)

# presupuestos theads
p = 'src/app/admin/presupuestos_reales/page.tsx'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('<thead className="bg-[#4b8fb4] text-white font-bold">', '<thead className="bg-brand-sage text-white font-bold border-b border-gray-200">')
c = c.replace('<thead className="bg-gray-100 text-gray-900 font-bold uppercase text-[10px] border-b border-gray-800">', '<thead className="bg-slate-200 text-slate-800 font-bold uppercase text-[10px] border-b border-gray-300">')
with open(p, 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed theads")
