import re

path = 'src/app/admin/proveedores/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add to formData state
c = c.replace(
    'email: "",\n    dias_credito: 0',
    'email: "",\n    sitio_web: "",\n    dias_credito: 0'
)

# 2. Add to openModal (for editing)
c = c.replace(
    'email: p.email || "",',
    'email: p.email || "",\n      sitio_web: p.sitio_web || "",'
)

# 3. Add to openModal (for new)
c = c.replace(
    'email: "",\n      dias_credito: 0',
    'email: "",\n      sitio_web: "",\n      dias_credito: 0'
)

# 4. Add the JSX input field right below "Correo Electrónico"
jsx_replacement = """                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="ventas@empresa.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Web (Opcional)</label>
                  <input 
                    type="url" 
                    placeholder="https://www.empresa.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none"
                    value={formData.sitio_web}
                    onChange={e => setFormData({...formData, sitio_web: e.target.value})}
                  />
                </div>"""

c = re.sub(
    r'<div className="col-span-2">\s*<label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>.*?</div>',
    jsx_replacement,
    c,
    flags=re.DOTALL
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Added sitio_web to Proveedores form")
