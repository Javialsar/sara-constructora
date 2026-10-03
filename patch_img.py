import os

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import Image from "next/image"' not in content:
        content = content.replace('import { useState } from "react";', 'import { useState } from "react";\nimport Image from "next/image";')
        
    content = content.replace(
        '<img src={prov.logo_url} alt="Logo" className="max-w-full max-h-full object-contain mix-blend-multiply" />',
        '<Image src={prov.logo_url} alt="Logo" width={96} height={48} className="object-contain mix-blend-multiply" unoptimized={true} />'
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file('src/app/admin/proveedores/page.tsx')
print("Patched")
