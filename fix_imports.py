import os

files = [
    'src/app/(public)/inmobiliaria/page.tsx',
    'src/app/(public)/stays/page.tsx'
]

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file: c = file.read()
        
        if 'import ThemeToggle' not in c:
            # inject import at top
            c = c.replace('import React,', 'import ThemeToggle from "@/components/ThemeToggle"\nimport React,')
            with open(f, 'w', encoding='utf-8') as file: file.write(c)
            print(f"Injected in {f}")
    except Exception as e:
        print(e)
