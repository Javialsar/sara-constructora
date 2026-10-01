const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

const replacement = `          const jsonData = await res.json()
          const lista = jsonData.inmuebles || (Array.isArray(jsonData) ? jsonData : [])
          
          const misInmuebles = lista.filter((item: any) => {
            const email = item.propietarioEmail || (item.propietario && item.propietario.email);
            return email && email.toLowerCase() === session!.email.toLowerCase();
          })
          
          const mapped: InmuebleOwner[] = misInmuebles.map((item: any) => ({`;

content = content.replace(
  '          const data = await res.json()\n          const mapped: InmuebleOwner[] = (data || []).map((item: any) => ({',
  replacement
);

fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
