import os
import re

def patch_file2(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import Image from "next/image"' not in content:
        content = content.replace('import React, { useState, useEffect } from "react"', 'import React, { useState, useEffect } from "react"\nimport Image from "next/image"')
        
    content = re.sub(
        r'<img src=\{p\.logo_url\}.+?/>',
        r'<Image src={p.logo_url} alt="Logo" width={96} height={96} className="max-w-full max-h-full object-contain mix-blend-multiply" unoptimized={true} />',
        content
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file2('src/app/dashboard/directorio/proveedores/page.tsx')
print("Patched 2")
