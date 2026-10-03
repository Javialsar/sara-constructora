import os
f = 'src/app/admin/layout.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()
c = c.replace('{ href: "/admin/historial"', '{ href: "/admin/auditoria", label: "Ojo de Dios", icon: ShieldAlert },\n          { href: "/admin/papelera", label: "Papelera", icon: Trash2 },\n          { href: "/admin/historial"')
with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
