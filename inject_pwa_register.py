import os
import re

f = 'src/app/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

# Add metadata for manifest
if 'manifest: "/manifest.json"' not in c:
    c = c.replace('keywords: "SARA Constructora', 'manifest: "/manifest.json",\n  keywords: "SARA Constructora')

# Add import
if 'PwaRegister' not in c:
    c = c.replace('import Providers', 'import PwaRegister from "@/components/PwaRegister"\nimport Providers')
    c = re.sub(r'(<body[^>]*>)', r'\1\n        <PwaRegister />', c)

with open(f, 'w', encoding='utf-8') as file: file.write(c)
