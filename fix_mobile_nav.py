import os
import re

def insert_apu_link(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        c = f.read()

    # Find the mobile links area:
    target = '<Link href="/" className="hover:text-white transition-colors">Sara Constructora</Link>'
    replacement = target + '\n              <Link href="/login" className="hover:text-blue-400 transition-colors font-bold text-blue-400">SARA APU</Link>'
    if replacement not in c:
        c = c.replace(target, replacement)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(c)

insert_apu_link('src/app/(public)/stays/page.tsx')
insert_apu_link('src/app/(public)/inmobiliaria/page.tsx')
