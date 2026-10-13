import re

path = 'src/app/admin/proveedores/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Fix the openModal resets
c = c.replace(
    'setFormData({ razon_social: "", ruc: "", contacto_vendedor: "", telefono: "", email: "", dias_credito: 0 })',
    'setFormData({ razon_social: "", ruc: "", contacto_vendedor: "", telefono: "", email: "", sitio_web: "", dias_credito: 0 })'
)

# Fix the openEdit
c = c.replace(
    'email: prov.email || "",\n      dias_credito: prov.dias_credito || 0',
    'email: prov.email || "",\n      sitio_web: prov.sitio_web || "",\n      dias_credito: prov.dias_credito || 0'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed modal state reset for sitio_web")
