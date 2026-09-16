const fs = require('fs');

const text = fs.readFileSync('public/salarios-personal.content.txt', 'utf8');
const lines = text.split('\n');
const regex = /^([a-zA-ZÀ-ÿ\s,.\(\)]+?)\s+\$\s*\d+,\d{2}\s+\d+,\d{2}\s+\d+,\d{2}\s+\d+,\d{2}\s+\d+,\d{2}\s+[\d.,]+\s+(\d+,\d{2})\s+(\d+,\d{2})/;
const results = [];

lines.forEach(l => {
  const m = l.trim().match(regex);
  if (m) {
    let act = m[1].replace(/\s+/g, ' ').trim();
    // Clean up specific artifacts from pdf extraction
    act = act.replace(/C A TEGORÍA /g, '');
    act = act.replace(/T écnico/g, 'Técnico');
    act = act.replace(/A yudante/g, 'Ayudante');
    act = act.replace(/Operador de equipo pesado \(.+?\)/g, 'Operador de equipo pesado');
    
    // Some lines might have weird splits, let's fix them manually
    if (act.includes('Hidráulico y Vial')) act = 'Ingeniero civil (Estructural, Hidráulico y Vial)';
    if (act.includes('Inspector de obra')) act = 'Inspector de obra';
    if (act.includes('Chofer vehículos pesados')) act = 'Chofer vehículos pesados';
    
    const jornal = parseFloat(m[2].replace(',','.'));
    const hora = parseFloat(m[3].replace(',','.'));
    results.push({
      actividad: act,
      jornal: jornal,
      hora: hora
    });
  }
});

// Remove duplicates if any
const unique = [];
const seen = new Set();
results.forEach(r => {
  if (!seen.has(r.actividad)) {
    seen.add(r.actividad);
    unique.push(r);
  }
});

fs.writeFileSync('src/lib/salariosData.json', JSON.stringify(unique, null, 2));
console.log('Saved', unique.length, 'records');
