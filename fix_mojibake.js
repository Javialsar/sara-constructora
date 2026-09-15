const fs = require('fs');
let text = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');

const replacements = {
    'DiseÃ±o': 'Diseño',
    'ConsultorÃa': 'Consultoría',
    'MÃ³dulo': 'Módulo',
    'ArquitectÃ³nico': 'Arquitectónico',
    'ElÃ©ctrica': 'Eléctrica',
    'TopogrÃ¡fico': 'Topográfico',
    'ParÃ¡metros': 'Parámetros',
    'EstÃ¡ndar': 'Estándar',
    'BaÃ±os': 'Baños',
    'ClimatizaciÃ³n': 'Climatización',
    'MetÃ¡lica': 'Metálica',
    'SubterrÃ¡nea': 'Subterránea',
    'Ã“ptimo': 'Óptimo',
    'Ã\x81rea': 'Área',
    'Ãrea': 'Área',
    'CotizaciÃ³n': 'Cotización',
    'IngenierÃas': 'Ingenierías',
    'HormigÃ³n': 'Hormigón',
    'mÃ²': 'm²',
    'EconÃ³mico': 'Económico',
    'TopografÃa': 'Topografía',
    'Ã?rea': 'Área',
    'Cotizaci?n': 'Cotización',
    'Levantamiento Topogrǭfico Base': 'Levantamiento Topográfico Base',
    'Ingenieras MEP (Hidro / ElǸctrica)': 'Ingenierías MEP (Hidro / Eléctrica)',
    'Estruct. Metlica': 'Estruct. Metálica',
    'Hormign Armado': 'Hormigón Armado',
    'Econmico': 'Económico',
    'Estndar': 'Estándar',
    'Diseo': 'Diseño',
    'Arquitectnico': 'Arquitectónico',
    'Topogrfico': 'Topográfico',
    'Mdulo': 'Módulo',
    'Consultora': 'Consultoría',
    'Ingenieras': 'Ingenierías',
    'Elctrica': 'Eléctrica'
};

for (const [bad, good] of Object.entries(replacements)) {
    text = text.split(bad).join(good);
}

fs.writeFileSync('src/app/admin/cotizador/page.tsx', text, 'utf8');
