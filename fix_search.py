import re

with open('src/app/admin/apus/rubros/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'onClick={() => setSelectedCategory(null)}',
    'onClick={() => { setSelectedCategory(null); setSearchCategoryTerm(""); }}'
)

with open('src/app/admin/apus/rubros/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed search clear")
