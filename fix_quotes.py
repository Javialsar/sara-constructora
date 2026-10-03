import re

f = 'src/app/dashboard/directorio/clientes/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

c = c.replace(r"\'id\'", "'id'")
c = c.replace(r"\'user_id\'", "'user_id'")

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
print("fixed quotes")
