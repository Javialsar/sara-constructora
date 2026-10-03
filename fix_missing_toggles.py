import os
import re

files = [
    'src/app/admin/layout.tsx',
    'src/app/(public)/inmobiliaria/mi-portal/page.tsx',
    'src/app/(public)/stays/mis-reservas/page.tsx'
]

for f in files:
    with open(f, 'r', encoding='utf-8') as file: c = file.read()
    
    if '<ThemeToggle />' not in c:
        if 'GlobalNotificationsBell' in c:
            # Inject right before GlobalNotificationsBell
            c = re.sub(r'(<GlobalNotificationsBell)', r'<ThemeToggle />\n              \1', c)
        elif '<Bell size={20} />' in c:
            # Admin layout case
            c = re.sub(r'(<button[^>]*>\s*<Bell size=\{20\} />)', r'<ThemeToggle />\n              \1', c)
        
        with open(f, 'w', encoding='utf-8') as file: file.write(c)
        print(f"Injected in {f}")
