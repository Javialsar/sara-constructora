import re

path = 'src/lib/pdfGenerator.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'doc.text("EXPLOSIÓN DE INSUMOS", 14, 55)',
    'doc.text(options.title || "EXPLOSIÓN DE INSUMOS", 14, 55)'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated PDF generator")
