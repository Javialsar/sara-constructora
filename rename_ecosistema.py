import os

f = 'src/app/admin/ecosistema/page.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

c = c.replace('<h2 className="text-lg font-bold text-gray-900">SARA Constructora</h2>', '<h2 className="text-lg font-bold text-gray-900">SARA-APU</h2>')
c = c.replace('<p className="text-xs font-semibold text-blue-600 tracking-wider uppercase">SaaS APU</p>', '<p className="text-xs font-semibold text-blue-600 tracking-wider uppercase">SARA Constructora</p>')

with open(f, 'w', encoding='utf-8') as file: file.write(c)
