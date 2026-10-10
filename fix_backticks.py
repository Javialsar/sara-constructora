import os

files = [
    'src/components/admin/fletes/GlobalMap.tsx',
    'src/components/admin/fletes/MapLeaflet.tsx'
]

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace('\\`', '`')
        content = content.replace('\\$', '$')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
