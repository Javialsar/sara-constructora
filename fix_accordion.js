const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';

let code = fs.readFileSync(path, 'utf8');

// 1. Add state for the accordion
if (!code.includes("const [openGroup,")) {
  code = code.replace(
    /const \[indForm, setIndForm\] = useState\(\{ admin: 10, imprevistos: 5, utilidad: 10 \}\)/,
    "const [indForm, setIndForm] = useState({ admin: 10, imprevistos: 5, utilidad: 10 })\n  const [openGroup, setOpenGroup] = useState({ 1: false, 2: false, 3: true, 4: true, 5: true, 6: true })"
  );
}

// 2. Replace the static headers with interactive ones
// Equipos
code = code.replace(
  /<div className="bg-\[#4b8fb4\] text-white font-bold p-3 flex justify-between cursor-pointer">([\s\S]*?)<span>1.- Equipos<\/span><ChevronDown size=\{18\}\/>([\s\S]*?)<\/div>/,
  `<div onClick={() => setOpenGroup({...openGroup, 1: !openGroup[1]})} className="bg-[#4b8fb4] text-white font-bold p-3 flex justify-between cursor-pointer select-none">$1<span>1.- Equipos</span>{openGroup[1] ? <ChevronDown size={18} className="rotate-180 transition-transform"/> : <ChevronDown size={18} className="transition-transform"/>}$2</div>
  {openGroup[1] && (
    <div className="p-4 bg-white text-sm text-gray-500 text-center italic">En construcción... (Aquí se detallarán las herramientas menores).</div>
  )}`
);

// Mano de Obra
code = code.replace(
  /<div className="bg-\[#4b8fb4\] text-white font-bold p-3 flex justify-between cursor-pointer mt-1">([\s\S]*?)<span>2.- Mano de Obra<\/span><ChevronDown size=\{18\}\/>([\s\S]*?)<\/div>/,
  `<div onClick={() => setOpenGroup({...openGroup, 2: !openGroup[2]})} className="bg-[#4b8fb4] text-white font-bold p-3 flex justify-between cursor-pointer mt-1 select-none">$1<span>2.- Mano de Obra</span>{openGroup[2] ? <ChevronDown size={18} className="rotate-180 transition-transform"/> : <ChevronDown size={18} className="transition-transform"/>}$2</div>
  {openGroup[2] && (
    <div className="p-4 bg-white text-sm text-gray-500 text-center italic">En construcción... (Aquí se detallará el subtotal de mano de obra).</div>
  )}`
);

// Materiales
code = code.replace(
  /<div className="bg-\[#4b8fb4\] text-white font-bold p-3 flex justify-between cursor-pointer mt-1">([\s\S]*?)<span>3.- Materiales<\/span><ChevronDown size=\{18\}\/>([\s\S]*?)<\/div>\s*<div className="p-4 bg-white grid grid-cols-12 text-sm">/,
  `<div onClick={() => setOpenGroup({...openGroup, 3: !openGroup[3]})} className="bg-[#4b8fb4] text-white font-bold p-3 flex justify-between cursor-pointer mt-1 select-none">$1<span>3.- Materiales</span>{openGroup[3] ? <ChevronDown size={18} className="rotate-180 transition-transform"/> : <ChevronDown size={18} className="transition-transform"/>}$2</div>
  {openGroup[3] && (
    <div className="p-4 bg-white grid grid-cols-12 text-sm">`
);

// Close Materiales
code = code.replace(
  /<div className="col-span-3 text-gray-400 py-2 pl-4 text-xs font-mono">= \$cdir = Costo Directo Total<\/div>\s*<\/div>/,
  `<div className="col-span-3 text-gray-400 py-2 pl-4 text-xs font-mono">= $cdir = Costo Directo Total</div>\n    </div>\n  )}`
);

// Gastos generales
code = code.replace(
  /<div className="bg-\[#4b8fb4\] text-white font-bold p-3 flex justify-between cursor-pointer mt-1">([\s\S]*?)<span>4.- Gastos generales y administrativos<\/span><ChevronDown size=\{18\}\/>([\s\S]*?)<\/div>\s*<div className="p-4 bg-white grid grid-cols-12 text-sm items-center gap-y-2">/,
  `<div onClick={() => setOpenGroup({...openGroup, 4: !openGroup[4]})} className="bg-[#4b8fb4] text-white font-bold p-3 flex justify-between cursor-pointer mt-1 select-none">$1<span>4.- Gastos generales y administrativos</span>{openGroup[4] ? <ChevronDown size={18} className="rotate-180 transition-transform"/> : <ChevronDown size={18} className="transition-transform"/>}$2</div>
  {openGroup[4] && (
    <div className="p-4 bg-white grid grid-cols-12 text-sm items-center gap-y-2">`
);

// Close Gastos generales
code = code.replace(
  /<div className="col-span-3 text-gray-400 py-2 pl-4 text-xs font-mono mt-2">= \$cnet = \$cdir \+ \$sggen<\/div>\s*<\/div>/,
  `<div className="col-span-3 text-gray-400 py-2 pl-4 text-xs font-mono mt-2">= $cnet = $cdir + $sggen</div>\n    </div>\n  )}`
);

// Imprevistos
code = code.replace(
  /<div className="bg-\[#4b8fb4\] text-white font-bold p-3 flex justify-between cursor-pointer mt-1">([\s\S]*?)<span>5.- Imprevistos<\/span><ChevronDown size=\{18\}\/>([\s\S]*?)<\/div>\s*<div className="p-4 bg-white grid grid-cols-12 text-sm items-center">/,
  `<div onClick={() => setOpenGroup({...openGroup, 5: !openGroup[5]})} className="bg-[#4b8fb4] text-white font-bold p-3 flex justify-between cursor-pointer mt-1 select-none">$1<span>5.- Imprevistos</span>{openGroup[5] ? <ChevronDown size={18} className="rotate-180 transition-transform"/> : <ChevronDown size={18} className="transition-transform"/>}$2</div>
  {openGroup[5] && (
    <div className="p-4 bg-white grid grid-cols-12 text-sm items-center">`
);

// Close Imprevistos
code = code.replace(
  /<div className="col-span-3 text-gray-400 text-xs font-mono pl-4">= \$simprv = \$cdir \* \$imprv \/ 100<\/div>\s*<\/div>/,
  `<div className="col-span-3 text-gray-400 text-xs font-mono pl-4">= $simprv = $cdir * $imprv / 100</div>\n    </div>\n  )}`
);

// Utilidad
code = code.replace(
  /<div className="bg-\[#4b8fb4\] text-white font-bold p-3 flex justify-between cursor-pointer mt-1">([\s\S]*?)<span>6.- Utilidad<\/span><ChevronDown size=\{18\}\/>([\s\S]*?)<\/div>\s*<div className="p-4 bg-white grid grid-cols-12 text-sm items-center gap-y-2">/,
  `<div onClick={() => setOpenGroup({...openGroup, 6: !openGroup[6]})} className="bg-[#4b8fb4] text-white font-bold p-3 flex justify-between cursor-pointer mt-1 select-none">$1<span>6.- Utilidad</span>{openGroup[6] ? <ChevronDown size={18} className="rotate-180 transition-transform"/> : <ChevronDown size={18} className="transition-transform"/>}$2</div>
  {openGroup[6] && (
    <div className="p-4 bg-white grid grid-cols-12 text-sm items-center gap-y-2">`
);

// Close Utilidad
code = code.replace(
  /<div className="col-span-3 text-gray-400 py-2 pl-4 text-xs font-mono bg-gray-50">= \$Stotal = \$pven<\/div>\s*<\/div>/,
  `<div className="col-span-3 text-gray-400 py-2 pl-4 text-xs font-mono bg-gray-50">= $Stotal = $pven</div>\n    </div>\n  )}`
);

fs.writeFileSync(path, code);
console.log('Accordion functionality added!');
