import os

def inject_bell(file_path, dest_tipo):
    with open(file_path, 'r', encoding='utf-8') as f:
        c = f.read()

    if 'GlobalNotificationsBell' not in c:
        # Import the component
        c = c.replace('import Link from "next/link"', 'import Link from "next/link"\nimport GlobalNotificationsBell from "@/components/GlobalNotificationsBell"')
        # Inject next to the "Cerrar Sesión" or profile button
        # In SARA APU: it's in layout.tsx.
        
        if 'admin' in dest_tipo:
            pass # already handled
        elif dest_tipo == 'cliente_apu':
            # src/app/dashboard/layout.tsx
            target = '<div className="w-9 h-9 rounded-full bg-brand-sage flex items-center justify-center font-bold text-white shadow-sm">'
            bell_html = f'<GlobalNotificationsBell destinatarioTipo="{dest_tipo}" />\n            ' + target
            c = c.replace(target, bell_html)
            
        elif dest_tipo == 'cliente_inmo':
            # src/app/(public)/inmobiliaria/mi-portal/page.tsx
            target = '<button\n              onClick={handleLogout}'
            bell_html = f'<div className="mr-4"><GlobalNotificationsBell destinatarioTipo="{dest_tipo}" destinatarioId={{ownerId || undefined}} /></div>\n            ' + target
            c = c.replace(target, bell_html)

        elif dest_tipo == 'cliente_stays':
            # src/app/(public)/stays/mis-reservas/page.tsx
            target = '<button\n              onClick={handleLogout}'
            bell_html = f'<div className="mr-4"><GlobalNotificationsBell destinatarioTipo="{dest_tipo}" destinatarioId={{guest?.cedula || undefined}} /></div>\n            ' + target
            c = c.replace(target, bell_html)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(c)

inject_bell('src/app/dashboard/layout.tsx', 'cliente_apu')
# inject_bell('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'cliente_inmo')
# inject_bell('src/app/(public)/stays/mis-reservas/page.tsx', 'cliente_stays')
