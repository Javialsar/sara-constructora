import os
f = 'src/app/dashboard/directorio/clientes/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()
c = c.replace("\\'", "'")
with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
print("Fixed syntax")
