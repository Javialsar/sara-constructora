import os

def inject_apu():
    f = 'src/app/dashboard/layout.tsx'
    with open(f, 'r', encoding='utf-8') as file: c = file.read()
    
    target = '<div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">'
    bell = '<GlobalNotificationsBell destinatarioTipo="cliente_apu" />\n            ' + target
    
    if 'destinatarioTipo="cliente_apu"' not in c:
        c = c.replace(target, bell)
        with open(f, 'w', encoding='utf-8') as file: file.write(c)

def inject_inmo():
    f = 'src/app/(public)/inmobiliaria/mi-portal/page.tsx'
    with open(f, 'r', encoding='utf-8') as file: c = file.read()
    
    # Import
    if 'GlobalNotificationsBell' not in c:
        c = c.replace('import SecurityPanel from "@/components/SecurityPanel"', 'import SecurityPanel from "@/components/SecurityPanel"\nimport GlobalNotificationsBell from "@/components/GlobalNotificationsBell"')
    
    # Inject next to the "Cerrar Sesión" button which is `handleLogout`
    # Let's find the top right header.
    # Look for `<div className="flex items-center gap-4">`
    target = '<div className="flex items-center gap-4">'
    bell = '<div className="flex items-center gap-4">\n          <GlobalNotificationsBell destinatarioTipo="cliente_inmo" destinatarioId={ownerId || undefined} />'
    if 'destinatarioTipo="cliente_inmo"' not in c:
        c = c.replace(target, bell)
        with open(f, 'w', encoding='utf-8') as file: file.write(c)

def inject_stays():
    f = 'src/app/(public)/stays/mis-reservas/page.tsx'
    with open(f, 'r', encoding='utf-8') as file: c = file.read()
    
    if 'GlobalNotificationsBell' not in c:
        c = c.replace('import SecurityPanel from "@/components/SecurityPanel"', 'import SecurityPanel from "@/components/SecurityPanel"\nimport GlobalNotificationsBell from "@/components/GlobalNotificationsBell"')
    
    # Same, look for `<div className="flex items-center gap-4">`
    target = '<div className="flex items-center gap-4">'
    bell = '<div className="flex items-center gap-4">\n          <GlobalNotificationsBell destinatarioTipo="cliente_stays" destinatarioId={guest?.cedula || undefined} />'
    if 'destinatarioTipo="cliente_stays"' not in c:
        c = c.replace(target, bell)
        with open(f, 'w', encoding='utf-8') as file: file.write(c)

try:
    inject_apu()
    inject_inmo()
    inject_stays()
    print("Injected successfully")
except Exception as e:
    print("Error:", e)
