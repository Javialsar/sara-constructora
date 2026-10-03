import os

f = 'src/app/(public)/inmobiliaria/mi-portal/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

c = c.replace(r"import { Shield } from 'lucide-react';\n", "import { Shield } from 'lucide-react';\n")

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
