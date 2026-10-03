import os

f = 'src/app/dashboard/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

target = """      title: "CUENTA",
      items: [
        { href: "/dashboard/planes", label: "Mi Plan / Suscripción", icon: Settings },
        { href: "/dashboard/perfil", label: "Seguridad y Accesos", icon: ShieldAlert },"""

replacement = """      title: "CUENTA",
      items: [
        { href: "/dashboard/planes", label: "Mi Plan / Suscripción", icon: Settings },
        { href: "/dashboard/marca", label: "Marca y Reportes", icon: Palette },
        { href: "/dashboard/perfil", label: "Seguridad y Accesos", icon: ShieldAlert },"""

if 'Marca y Reportes' not in c:
    c = c.replace(target, replacement)
    # add import if needed
    if 'Palette' not in c:
        c = c.replace('ShieldAlert,', 'ShieldAlert, Palette,')
    with open(f, 'w', encoding='utf-8') as file: file.write(c)

