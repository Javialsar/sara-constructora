import re

f = 'src/app/dashboard/directorio/clientes/actions.ts'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

c = c.replace(
    'export async function createClientAccount(data: {',
    'export async function createClientAccount(data: {\n  userId: string'
)

c = c.replace(
    "telefono: data.telefono,\n      estado: 'activo'",
    "telefono: data.telefono,\n      estado: 'activo',\n      user_id: data.userId"
)

c = c.replace("/admin/clientes", "/dashboard/directorio/clientes")

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)

print("action updated")
