import re

path = 'src/app/admin/presupuestos_reales/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# find lucide-react import
match = re.search(r'import \{([^}]+)\} from "lucide-react"', c)
if match:
    imports = match.group(1)
    if 'Settings' not in imports:
        new_imports = imports + ', Settings'
        c = c.replace(match.group(0), f'import {{{new_imports}}} from "lucide-react"')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print("Fixed missing Settings import")
    else:
        print("Settings already imported")
else:
    print("Could not find lucide-react import")
