import os
f = 'src/app/admin/layout.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()
c = c.replace('} from "lucide-react"', ', ShieldAlert, Trash2 } from "lucide-react"')
with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
