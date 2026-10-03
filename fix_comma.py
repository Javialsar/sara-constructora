import os

f = 'src/app/dashboard/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

c = c.replace('FileSpreadsheet\n  Database,', 'FileSpreadsheet,\n  Database,')

with open(f, 'w', encoding='utf-8') as file: file.write(c)
