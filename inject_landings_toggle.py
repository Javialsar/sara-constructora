import os

files = [
    ('src/app/(public)/inmobiliaria/page.tsx', '{/* Botón Publicar Propiedad */}'),
    ('src/app/(public)/stays/page.tsx', '{/* Botón Host / Publicar */}')
]

for f, target in files:
    try:
        with open(f, 'r', encoding='utf-8') as file: c = file.read()
        
        if 'import ThemeToggle' not in c:
            # inject import at top
            c = c.replace('import { createClient }', 'import ThemeToggle from "@/components/ThemeToggle"\nimport { createClient }')
            
            # inject toggle
            c = c.replace(target, f"<ThemeToggle />\n              {target}")
            
            with open(f, 'w', encoding='utf-8') as file: file.write(c)
            print(f"Injected in {f}")
    except Exception as e:
        print(e)
