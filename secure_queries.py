import re

f = 'src/app/dashboard/directorio/clientes/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

c = re.sub(
    r'\.delete\(\)\.eq\(\'id\', c\.id\)',
    r'.delete().eq(\'id\', c.id).eq(\'user_id\', (await supabase.auth.getUser()).data.user?.id)',
    c
)

c = re.sub(
    r'\.update\(\{(.*?)\}\)\.eq\(\'id\', editId\)',
    r'.update({\1}).eq(\'id\', editId).eq(\'user_id\', (await supabase.auth.getUser()).data.user?.id)',
    c, flags=re.DOTALL
)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
print("queries secured")
