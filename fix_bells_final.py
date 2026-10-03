import os

f = 'src/app/(public)/stays/mis-reservas/page.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

target = '              <div className="flex items-center gap-2">\n                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600'
bell = '              <div className="flex items-center gap-2">\n                <GlobalNotificationsBell destinatarioTipo="cliente_stays" destinatarioId={guest?.cedula || undefined} />\n                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600'

c = c.replace(target, bell)

with open(f, 'w', encoding='utf-8') as file: file.write(c)

f2 = 'src/app/(public)/inmobiliaria/mi-portal/page.tsx'
with open(f2, 'r', encoding='utf-8') as file: c2 = file.read()

target2 = '            <div className="flex items-center gap-3">\n              <Link\n                href="/inmobiliaria"'
bell2 = '            <div className="flex items-center gap-3">\n              <GlobalNotificationsBell destinatarioTipo="cliente_inmo" destinatarioId={owner.cedula || undefined} />\n              <Link\n                href="/inmobiliaria"'

if 'GlobalNotificationsBell destinatarioTipo="cliente_inmo"' not in c2:
    c2 = c2.replace(target2, bell2)
    with open(f2, 'w', encoding='utf-8') as file: file.write(c2)

