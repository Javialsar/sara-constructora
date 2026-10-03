import os

def fix_inmo():
    f = 'src/app/(public)/inmobiliaria/mi-portal/page.tsx'
    with open(f, 'r', encoding='utf-8') as file: c = file.read()
    
    target = '            <div className="flex items-center gap-3">\n              <Link'
    bell = '            <div className="flex items-center gap-3">\n              <GlobalNotificationsBell destinatarioTipo="cliente_inmo" destinatarioId={owner.cedula || undefined} />\n              <Link'
    
    if 'GlobalNotificationsBell destinatarioTipo="cliente_inmo"' not in c:
        c = c.replace(target, bell)
        with open(f, 'w', encoding='utf-8') as file: file.write(c)

def fix_stays():
    f = 'src/app/(public)/stays/mis-reservas/page.tsx'
    with open(f, 'r', encoding='utf-8') as file: c = file.read()
    
    target = '              {/* Perfil del Huésped / Anfitrión */}\n              <div className="flex items-center gap-2">'
    bell = '              {/* Perfil del Huésped / Anfitrión */}\n              <GlobalNotificationsBell destinatarioTipo="cliente_stays" destinatarioId={guest?.cedula || undefined} />\n              <div className="flex items-center gap-2">'
    
    if 'GlobalNotificationsBell destinatarioTipo="cliente_stays"' not in c:
        c = c.replace(target, bell)
        with open(f, 'w', encoding='utf-8') as file: file.write(c)

try:
    fix_inmo()
    fix_stays()
    print("Injected successfully")
except Exception as e:
    print("Error:", e)
