import re

path = 'src/app/admin/layout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# The original block for APU
old_apu = """    {
      title: "MÓDULO APU-SARA",
      items: [
                { href: "/admin/parametros", label: "Parámetros Globales", icon: Settings },
        { href: "/admin/apus/insumos", label: "Catálogo de Insumos", icon: FileText },
        { href: "/admin/apus/rubros", label: "Rubros", icon: Calculator },
        { href: "/admin/cotizador", label: "Cotizador Automático", icon: Calculator },
        { href: "/admin/cotizaciones", label: "Cotizaciones Recibidas", icon: FileText },
        { href: "/admin/presupuestos_reales", label: "Presupuestos Reales", icon: Calculator },
      ]
    },"""

# The new block for APU and Quick Quotes
new_blocks = """    {
      title: "MÓDULO APU-SARA",
      items: [
        { href: "/admin/parametros", label: "Parámetros Globales", icon: Settings },
        { href: "/admin/apus/insumos", label: "Catálogo de Insumos", icon: FileText },
        { href: "/admin/apus/rubros", label: "Rubros", icon: Calculator },
        { href: "/admin/presupuestos_reales", label: "Presupuestos Reales", icon: Calculator },
      ]
    },
    {
      title: "COTIZACIONES RÁPIDAS",
      items: [
        { href: "/admin/cotizador", label: "Cotizador Automático", icon: Calculator },
        { href: "/admin/cotizaciones", label: "Cotizaciones Recibidas", icon: FileText },
      ]
    },"""

c = c.replace(old_apu, new_blocks)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Split APU into APU and COTIZACIONES RÁPIDAS")
