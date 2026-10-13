import re

path = 'src/app/admin/apus/rubros/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the button
old_btn = """<button className="text-brand-sage hover:text-brand-dark font-bold text-xs bg-brand-sage/10 px-3 py-1.5 rounded transition-colors">
                          Modificar APU
                        </button>"""

new_btn = """<button title="Modificar Rubro" className="text-brand-sage hover:text-brand-dark font-bold bg-brand-sage/10 p-2 rounded transition-colors">
                          <Edit3 size={16} />
                        </button>"""

if old_btn in c:
    c = c.replace(old_btn, new_btn)
else:
    print("WARNING: Button not found")

# Add Edit3 to lucide-react imports if it's missing
if 'Edit3' not in c:
    c = c.replace('PenTool } from "lucide-react"', 'PenTool, Edit3 } from "lucide-react"')
    c = c.replace('Box } from "lucide-react"', 'Box, Edit3 } from "lucide-react"')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched rubros page button")
