import re

filepath = 'src/app/admin/proveedores/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Zod Schema
if 'logo_url: z.string().optional()' not in content:
    content = re.sub(
        r'sitio_web:(.+)\n\}\);',
        r'sitio_web:\1\n  logo_url: z.string().optional(),\n});',
        content
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Schema patched")
