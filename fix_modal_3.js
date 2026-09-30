const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

const iframeRegex = /<iframe[\s\S]*?\/>/;
if (iframeRegex.test(content)) {
  content = content.replace(
    iframeRegex,
    `<DynamicModalMap lat={formInmueble.coordenadas.lat} lng={formInmueble.coordenadas.lng} onChange={(lat, lng) => setFormInmueble({ ...formInmueble, coordenadas: { lat, lng } })} />`
  );
  
  // Add the help text for map dragging
  content = content.replace(
    /className="h-64 sm:h-72 bg-gray-200 rounded-xl overflow-hidden relative border border-gray-300"/g,
    'className="h-64 sm:h-72 bg-gray-200 rounded-xl overflow-hidden relative border border-gray-300"\n                  >\n                    <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-gray-700 font-bold border border-gray-200 pointer-events-none">📍 Arrastra el marcador para precisar tu ubicación exacta</div>'
  );
  
  fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
  console.log('Fixed iframe self-closing tag!');
}
