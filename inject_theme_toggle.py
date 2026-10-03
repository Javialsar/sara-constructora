import os
import re

files_to_inject = [
    'src/app/dashboard/layout.tsx',
    'src/app/(public)/inmobiliaria/mi-portal/page.tsx',
    'src/app/(public)/stays/mis-reservas/page.tsx',
    'src/app/admin/layout.tsx'
]

for f in files_to_inject:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            c = file.read()
        
        if 'import ThemeToggle' not in c:
            # Add import right after GlobalNotificationsBell import
            c = c.replace('import GlobalNotificationsBell from "@/components/GlobalNotificationsBell"',
                          'import GlobalNotificationsBell from "@/components/GlobalNotificationsBell"\nimport ThemeToggle from "@/components/ThemeToggle"')
            
            # Inject toggle before bell
            c = c.replace('<GlobalNotificationsBell', '<ThemeToggle />\n              <GlobalNotificationsBell')
            
            with open(f, 'w', encoding='utf-8') as file:
                file.write(c)
            print(f"Injected ThemeToggle in {f}")
    except Exception as e:
        print(f"Failed {f}: {e}")
