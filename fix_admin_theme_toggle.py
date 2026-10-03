import os
f = 'src/app/admin/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()
target = '            <div className="flex items-center gap-4">\n              <button className="relative p-2 text-gray-500 hover:text-brand-dark transition-colors">'
toggle = '            <div className="flex items-center gap-4">\n              <ThemeToggle />\n              <button className="relative p-2 text-gray-500 hover:text-brand-dark transition-colors">'
if '<ThemeToggle />' not in c:
    c = c.replace(target, toggle)
    # also add import if missing
    if 'import ThemeToggle' not in c:
        c = c.replace('import { useState', 'import ThemeToggle from "@/components/ThemeToggle"\nimport { useState')
    with open(f, 'w', encoding='utf-8') as file: file.write(c)
