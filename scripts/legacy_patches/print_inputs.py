import re

with open('src/app/admin/presupuestos_reales/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

matches = re.findall(r'<input type="number"[^>]*pmaq1[^>]*>', code)
for m in matches:
    print(m)
