import os
f = 'src/app/dashboard/layout.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()
# Add a link for "Seguridad" in the sidebar
c = c.replace('{ href: "/dashboard/planes", label: "Mi Plan / Suscripción", icon: Settings },', '{ href: "/dashboard/planes", label: "Mi Plan / Suscripción", icon: Settings },\n          { href: "/dashboard/perfil", label: "Seguridad y Accesos", icon: ShieldAlert },')
with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
