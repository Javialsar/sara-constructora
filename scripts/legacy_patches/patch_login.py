import os

def patch_login():
    filepath = 'src/app/login/page.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()
    
    if 'import Link' not in c:
        c = c.replace('import { useRouter } from "next/navigation"', 'import { useRouter } from "next/navigation"\nimport Link from "next/link"')
    if 'ArrowLeft' not in c:
        c = c.replace('ArrowRight, Loader2,', 'ArrowRight, Loader2, ArrowLeft,')
    
    if 'Volver al Inicio' not in c:
        c = c.replace(
            '<div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl flex overflow-hidden min-h-[600px]">',
            '<div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl flex overflow-hidden min-h-[600px] relative">\n        {/* Boton Volver */}\n        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors z-20">\n          <ArrowLeft size={16} />\n          Volver al Inicio\n        </Link>'
        )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Login Patched")

patch_login()
