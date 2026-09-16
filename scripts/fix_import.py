import re

with open('src/app/admin/presupuestos_reales/page.tsx', 'r', encoding='utf8') as f:
    c = f.read()

c = re.sub(r'(import \{[^}]*)( \}\s*from\s*"lucide-react")', r'\1, Loader2\2', c)

with open('src/app/admin/presupuestos_reales/page.tsx', 'w', encoding='utf8') as f:
    f.write(c)

print("Added Loader2 import")
