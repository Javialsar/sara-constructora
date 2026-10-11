import os

path = 'src/components/admin/fletes/MapLeaflet.tsx'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        'url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"',
        'url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"'
    )
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
