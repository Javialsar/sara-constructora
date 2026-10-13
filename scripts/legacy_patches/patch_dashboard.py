import re

with open('src/app/dashboard/layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
if 'Users' not in content:
    content = content.replace('Calculator }', 'Calculator, Users, Briefcase, Wrench }')

new_group = """title: "DIRECTORIO Y RECURSOS",
      items: [
        { href: "/dashboard/directorio/clientes", label: "Mis Clientes (CRM)", icon: Users },
        { href: "/dashboard/directorio/proveedores", label: "Mis Proveedores", icon: Briefcase },
        { href: "/dashboard/directorio/trabajadores", label: "Mi Personal de Obra", icon: Wrench }
      ]
    },
    {
      title: "CUENTA","""

if 'DIRECTORIO Y RECURSOS' not in content:
    content = content.replace('title: "CUENTA",', new_group)

with open('src/app/dashboard/layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Dashboard layout patched.")
