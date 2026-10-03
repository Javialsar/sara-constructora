import os
import re

f = 'src/app/dashboard/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

target_dir = r'(\{ href: "/dashboard/directorio/trabajadores", label: "Mi Personal de Obra", icon: Wrench \})'
replacement_dir = r'\1,\n        { href: "/dashboard/importador", label: "Importar Excel Masivo", icon: Database }'

if 'Importar Excel Masivo' not in c:
    c = re.sub(target_dir, replacement_dir, c)
    if 'Database' not in c:
        c = c.replace('import { Calculator', 'import { Database, Calculator')
    
    with open(f, 'w', encoding='utf-8') as file: file.write(c)
