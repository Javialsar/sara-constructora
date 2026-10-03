import re

f = 'src/app/dashboard/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

if 'Database,' not in c:
    c = c.replace('} from "lucide-react"', '  Database,\n} from "lucide-react"')

with open(f, 'w', encoding='utf-8') as file: file.write(c)
