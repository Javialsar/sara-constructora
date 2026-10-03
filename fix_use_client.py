import os

f = 'src/app/admin/ecosistema/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

if '"use client"' not in c:
    c = '"use client"\n' + c

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
