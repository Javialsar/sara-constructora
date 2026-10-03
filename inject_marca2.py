import re

f = 'src/app/dashboard/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

# Buscamos CUENTA y le metemos el botón
if 'Marca y Reportes' not in c:
    c = re.sub(
        r'(\{\s*href:\s*"/dashboard/planes"[^\}]+\},)',
        r'\1\n        { href: "/dashboard/marca", label: "Marca y Reportes", icon: Palette },',
        c
    )
    
    # Aseguramos que Palette esté importado
    if 'Palette' not in c:
        c = c.replace('ShieldAlert,', 'ShieldAlert, Palette,')

with open(f, 'w', encoding='utf-8') as file: file.write(c)
