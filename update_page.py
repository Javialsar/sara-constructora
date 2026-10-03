import re

f = 'src/app/dashboard/directorio/clientes/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

# Add user fetching for context
c = c.replace(
    'const { data, error } = await supabase.from(\'clientes\').select(\'*\').order(\'created_at\', { ascending: false })',
    'const { data: { user } } = await supabase.auth.getUser()\n      if (!user) throw new Error("No autenticado");\n      const { data, error } = await supabase.from(\'clientes\').select(\'*\').eq(\'user_id\', user.id).order(\'created_at\', { ascending: false })'
)

# Pass userId to createClientAccount
# First we need to get user in the submit handler
c = c.replace(
    'const res = await createClientAccount({',
    'const { data: { user } } = await supabase.auth.getUser()\n              const res = await createClientAccount({\n                userId: user?.id || "",'
)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)

print("page updated")
