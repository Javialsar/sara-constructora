import re

f = 'src/app/dashboard/directorio/clientes/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

c = re.sub(
    r'\.from\("clientes"\)\s*\.select\("\*"\)\s*\.order\(\'created_at\', \{ ascending: false \}\)',
    r'.from("clientes").select("*").eq("user_id", (await supabase.auth.getUser()).data.user?.id).order(\'created_at\', { ascending: false })',
    c
)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
print("fetch fixed")
