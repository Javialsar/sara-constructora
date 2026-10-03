import os
import re

f = 'src/app/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

c = re.sub(r'import PwaRegister from "@/components/PwaRegister"\n', '', c)
c = re.sub(r'<PwaRegister />\n', '', c)

with open(f, 'w', encoding='utf-8') as file: file.write(c)
