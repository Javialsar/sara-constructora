import os
import re

f = 'src/app/admin/layout.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

c = re.sub(r'\},?\s*Activity,\s*Bell\s*from\s*"lucide-react"', r', Activity, Bell } from "lucide-react"', c)
c = re.sub(r'\}\s*,\s*Activity,\s*Bell\s*from\s*"lucide-react"', r', Activity, Bell } from "lucide-react"', c)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
