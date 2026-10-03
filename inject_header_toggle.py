import os

f = 'src/components/layout/Header.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

if 'import ThemeToggle' not in c:
    c = c.replace('import { Button }', 'import ThemeToggle from "@/components/ThemeToggle"\nimport { Button }')
    
    target = """          <div className="flex items-center gap-4">
            <Link href="/portal" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-sage transition-colors">"""
            
    replacement = """          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/portal" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-black hover:text-brand-sage transition-colors">"""
            
    c = c.replace(target, replacement)
    with open(f, 'w', encoding='utf-8') as file: file.write(c)
