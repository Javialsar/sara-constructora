import os

def fix_file(f):
    with open(f, 'r', encoding='utf-8') as file:
        c = file.read()
    c = c.replace('className="object-contain mix-blend-multiply"', 'className="h-10 w-auto max-w-[100px] object-contain mix-blend-multiply"')
    c = c.replace('className="max-w-full max-h-full object-contain mix-blend-multiply"', 'className="h-12 w-auto max-w-[100px] object-contain mix-blend-multiply"')
    with open(f, 'w', encoding='utf-8') as file:
        file.write(c)

fix_file('src/app/admin/proveedores/page.tsx')
fix_file('src/app/dashboard/directorio/proveedores/page.tsx')
print("Fixed logos")
