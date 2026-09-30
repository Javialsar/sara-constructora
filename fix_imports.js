const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

if (!content.includes('import dynamic from "next/dynamic"')) {
  content = 'import dynamic from "next/dynamic"\n' + content;
}
if (!content.includes('getInmobiliariaConfig')) {
  content = 'import { getInmobiliariaConfig, InmobiliariaConfigCompleta, DEFAULT_INMOBILIARIA_CONFIG } from "@/lib/services/inmobiliariaPlanesService"\n' + content;
}
if (!content.includes('Percent,')) {
  content = content.replace('import {', 'import { Percent, CheckCircle2,');
}

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
console.log('Fixed imports');
