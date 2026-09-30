const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

// Import dynamic and config
if (!content.includes('next/dynamic')) {
  content = content.replace(
    'import React, { useState, useMemo, useRef, useCallback, useEffect } from "react"',
    'import React, { useState, useMemo, useRef, useCallback, useEffect } from "react"\nimport dynamic from "next/dynamic"\nimport { getInmobiliariaConfig, InmobiliariaConfigCompleta, DEFAULT_INMOBILIARIA_CONFIG } from "@/lib/services/inmobiliariaPlanesService"'
  );
}

// Add Dynamic Modal Map
if (!content.includes('const DynamicModalMap')) {
  content = content.replace(
    'export default function PublicarInmuebleModal(',
    'const DynamicModalMap = dynamic(() => import("@/components/inmobiliaria/ModalMap"), { ssr: false })\n\nexport default function PublicarInmuebleModal('
  );
}

// State for config
const configState = `
  const [planesConfig, setPlanesConfig] = useState<InmobiliariaConfigCompleta>(DEFAULT_INMOBILIARIA_CONFIG)
  useEffect(() => {
    getInmobiliariaConfig().then(cfg => {
      setPlanesConfig(cfg)
      // Ajustar tarifa base en caso de ser necesario
      setFormInmueble(prev => ({
        ...prev,
        tarifaMensual: cfg.planes[prev.planPromocion]?.precioMensual || prev.tarifaMensual
      }))
    })
  }, [])
`;
if (!content.includes('setPlanesConfig')) {
  content = content.replace(
    'const fileInputRef = useRef<HTMLInputElement>(null)',
    'const fileInputRef = useRef<HTMLInputElement>(null)\n' + configState
  );
}

// Codigo readonly
content = content.replace(
  'value={formInmueble.codigo}\n                        onChange={(e) => setFormInmueble({ ...formInmueble, codigo: e.target.value })}',
  'value={formInmueble.codigo}\n                        readOnly={true}\n                        onChange={(e) => setFormInmueble({ ...formInmueble, codigo: e.target.value })}'
);

// Map iframe replacement
const iframeRegex = /<iframe[\s\S]*?<\/iframe>/;
if (iframeRegex.test(content)) {
  content = content.replace(
    iframeRegex,
    `<DynamicModalMap lat={formInmueble.coordenadas.lat} lng={formInmueble.coordenadas.lng} onChange={(lat, lng) => setFormInmueble({ ...formInmueble, coordenadas: { lat, lng } })} />`
  );
  
  // Add the help text for map dragging
  content = content.replace(
    'className="h-64 sm:h-72 bg-gray-200 rounded-xl overflow-hidden relative border border-gray-300"',
    'className="h-64 sm:h-72 bg-gray-200 rounded-xl overflow-hidden relative border border-gray-300"\n                  >\n                    <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-gray-700 font-bold border border-gray-200 pointer-events-none">Arrastra el marcador para precisar tu ubicación</div>'
  );
}

// Precios / titulos dynamic replacement
content = content.replace(
  /const precios = \{\n\s*basico: 35,\n\s*destacado: 65,\n\s*premium: 120\n\s*\}/g,
  `const precios = { basico: planesConfig.planes.basico.precioMensual, destacado: planesConfig.planes.destacado.precioMensual, premium: planesConfig.planes.premium.precioMensual }`
);
content = content.replace(
  /const titulos = \{\n\s*basico: "Básico",\n\s*destacado: "Destacado",\n\s*premium: "Premium"\n\s*\}/g,
  `const titulos = { basico: planesConfig.planes.basico.nombre.toUpperCase(), destacado: planesConfig.planes.destacado.nombre.toUpperCase(), premium: planesConfig.planes.premium.nombre.toUpperCase() }`
);

// Change the description of commission dynamically in the Venta section (we can just replace a generic text if we know it)
content = content.replace(
  'La comisión por venta es del 3% del valor final',
  'La comisión base por venta es del {planesConfig.comisiones.comisionVentaDefault}% del valor final'
);

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
console.log('Patched modal');
