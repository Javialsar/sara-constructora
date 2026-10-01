import os
import re

filepath = 'src/app/admin/configuracion/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update logoKeys
content = content.replace(
    "const logoKeys: (keyof LogosEmpresa)[] = ['constructora', 'inmobiliaria', 'stays']",
    "const logoKeys: (keyof LogosEmpresa)[] = ['constructora', 'inmobiliaria', 'stays', 'apu']"
)

# 2. Update logoFiles state
content = content.replace(
    "constructora: File | null\n    inmobiliaria: File | null\n    stays: File | null\n  }>({",
    "constructora: File | null\n    inmobiliaria: File | null\n    stays: File | null\n    apu: File | null\n  }>({"
)
content = content.replace(
    "constructora: null,\n    inmobiliaria: null,\n    stays: null\n  })",
    "constructora: null,\n    inmobiliaria: null,\n    stays: null,\n    apu: null\n  })"
)

# 3. Update the description for Cuentas Bancarias
content = content.replace(
    "reservar en <strong>Airbnb</strong> o comprar en <strong>Inmobiliaria</strong>.",
    "reservar en <strong>Airbnb</strong>, comprar en <strong>Inmobiliaria</strong> o suscribirse a <strong>SaaS APU</strong>."
)

# 4. Update Marcas Sincronizadas text
content = content.replace(
    "3 Marcas Sincronizadas",
    "4 Marcas Sincronizadas"
)
content = content.replace(
    "de las 3 líneas de negocio",
    "de las 4 líneas de negocio"
)

# 5. Add QR to Cuentas Bancarias
qr_injection = """
                  {/* Código QR */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">URL de Código QR de Pago</label>
                    <input
                      type="text"
                      value={cta.qrUrl || ""}
                      placeholder="https://.../qr.jpg"
                      onChange={(e) => handleCuentaChange(cta.id, "qrUrl", e.target.value)}
                      className="w-full text-xs font-bold p-2 bg-white rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
"""
content = re.sub(
    r'(onChange=\{\(e\) => handleCuentaChange\(cta\.id, "correoComprobantes", e\.target\.value\)\}[\s\S]*?/>\s*</div>)',
    r'\1' + qr_injection,
    content
)

# 6. Add 4th Logo (SARA-APUs)
# Use a very precise regex to ONLY grab the SARA STAYS card div, not the closing tags of the grid.
stays_block_regex = r'({\/\*\s*3\.\s*SARA STAYS\s*\*\/\}[\s\S]*?stays: "\/sara-stays\.png"\s*\}\)\)\s*\}\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*)'
match = re.search(stays_block_regex, content)
if match:
    stays_block = match.group(1)
    
    apu_block = stays_block.replace("3. SARA STAYS", "4. SARA APUS")
    apu_block = apu_block.replace("SARA Stays", "SaaS APU")
    apu_block = apu_block.replace("SARA-STAYS", "SARA-APUS")
    apu_block = apu_block.replace("STAYS", "SaaS APU")
    apu_block = apu_block.replace("bg-amber-950", "bg-blue-950")
    apu_block = apu_block.replace("text-amber-500", "text-blue-500")
    apu_block = apu_block.replace("bg-amber-500/20", "bg-blue-500/20")
    apu_block = apu_block.replace("text-amber-900", "text-blue-900")
    apu_block = apu_block.replace("hover:file:bg-amber-500/30", "hover:file:bg-blue-500/30")
    apu_block = apu_block.replace("hover:text-amber-700", "hover:text-blue-700")
    apu_block = apu_block.replace("text-amber-700", "text-blue-700")
    apu_block = apu_block.replace("Portal Alojamientos", "Portal APUs")
    apu_block = apu_block.replace("división de Alojamientos", "plataforma SaaS")
    apu_block = apu_block.replace("/stays", "/dashboard")
    apu_block = apu_block.replace("/sara-stays.png", "/logo-hero.png") 
    apu_block = apu_block.replace("stays", "apu") 
    
    # Inject after the stays block. The match ONLY includes the card's closing `</div>` (3 of them).
    content = content.replace(stays_block, stays_block + "\n            " + apu_block)
    
    # Change grid to 4 cols if possible
    content = content.replace("grid-cols-1 md:grid-cols-3 gap-6", "grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Configuracion UI Patched")
