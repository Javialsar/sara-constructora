import os

f = 'src/app/(public)/stays/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

c = c.replace('<Calculator size={14} className="text-emerald-400" />\n                <span>Portal Inmobiliario</span>', '<Building size={14} className="text-emerald-400" />\n                <span>Portal Inmobiliario</span>')

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
