import re

path = 'src/app/admin/presupuestos_reales/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific double brace sequence
content = re.sub(r'    \}\);\n  \}\n\n  \}\n\n  const isBorrador', r'    });\n  }\n\n  const isBorrador', content)

# Or with carriage returns
content = re.sub(r'    \}\);\r?\n  \}\r?\n\r?\n  \}\r?\n\r?\n  const isBorrador', r'    });\n  }\n\n  const isBorrador', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed braces!")
