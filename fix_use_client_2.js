const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

content = content.replace('import { Percent } from "lucide-react"\n"use client"', '"use client"\nimport { Percent } from "lucide-react"');

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
