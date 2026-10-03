import os
import re

def fix_file(f):
    with open(f, 'r', encoding='utf-8') as file:
        c = file.read()
    
    if 'import GlobalNotificationsBell' not in c:
        c = re.sub(r'("use client"\s*\n)', r'\1import GlobalNotificationsBell from "@/components/GlobalNotificationsBell"\n', c)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(c)

fix_file('src/app/(public)/stays/mis-reservas/page.tsx')
fix_file('src/app/(public)/inmobiliaria/mi-portal/page.tsx')
