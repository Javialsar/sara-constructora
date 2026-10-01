const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const targetStr = `  destacado: boolean
  // Información del Propietario & Bancaria`;

const repStr = `  destacado: boolean
  estado?: 'en_verificacion' | 'aprobado' | 'rechazado' | 'publicado'
  legalidad?: any
  // Información del Propietario & Bancaria`;

content = content.replace(targetStr, repStr);

const targetStr2 = `estadoPago: "al_dia" | "por_vencer" | "vencido"`;
const repStr2 = `estadoPago: "al_dia" | "por_vencer" | "vencido" | "pendiente"`;

content = content.replace(targetStr2, repStr2);

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
