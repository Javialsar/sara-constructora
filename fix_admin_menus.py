import os
import re

f = 'src/app/admin/layout.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

# Replace PANEL PRINCIPAL
c = re.sub(
    r'title:\s*"PANEL PRINCIPAL",\s*items:\s*\[\s*\{\s*href:\s*"/admin",\s*label:\s*"Dashboard",\s*icon:\s*LayoutDashboard\s*\},?\s*\]',
    r'title: "PANEL PRINCIPAL",\n        items: [\n          { href: "/admin", label: "Dashboard", icon: LayoutDashboard },\n          { href: "/admin/ecosistema", label: "Salud Ecosistema", icon: Activity },\n        ]',
    c
)

# Replace PORTAL WEB
c = re.sub(
    r'title:\s*"PORTAL WEB",\s*items:\s*\[\s*\{\s*href:\s*"/admin/noticias"',
    r'title: "PORTAL WEB",\n        items: [\n          { href: "/admin/centro-notificaciones", label: "Difusión Global", icon: Send },\n          { href: "/admin/noticias"',
    c
)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
