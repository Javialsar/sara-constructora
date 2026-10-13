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
    'className="h-64 sm:h-72 bg-gray-200 rounded-xl overflow-hidden relative border border-gray-300"\n                  >\n                    <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-gray-700 font-bold border border-gray-200 pointer-events-none">📍 Arrastra el marcador para precisar tu ubicación exacta</div>'
  );
}

// Precios / titulos dynamic replacement inside mapping
const mappingBlock = `                    {["basico", "destacado", "premium"].map((planStr) => {
                      const plan = planStr as "basico" | "destacado" | "premium"
                      const cfgPlan = planesConfig.planes[plan]
                      const isActive = formInmueble.planPromocion === plan
                      const colores = { basico: "bg-gray-50 border-gray-200 hover:border-gray-400", destacado: "bg-emerald-50 border-emerald-300 hover:border-emerald-500", premium: "bg-amber-50 border-amber-300 hover:border-amber-500" }
                      
                      return (
                        <div
                          key={plan}
                          onClick={() => setFormInmueble({ ...formInmueble, planPromocion: plan, tarifaMensual: cfgPlan.precioMensual })}
                          className={\`p-4 rounded-xl border-2 cursor-pointer transition-all relative \${colores[plan]} \${isActive ? 'ring-2 ring-emerald-500 scale-[1.02]' : ''}\`}
                        >
                          {isActive && <div className="absolute top-2 right-2"><CheckCircle2 size={18} className="text-emerald-600" /></div>}
                          <h5 className="font-black text-gray-900 uppercase text-sm mb-1">{cfgPlan.nombre}</h5>
                          <p className="text-xl font-black text-gray-800 mb-2">\${cfgPlan.precioMensual}<span className="text-xs text-gray-500 font-medium">/mes</span></p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {cfgPlan.beneficios.map((ben, bidx) => (
                              <li key={bidx} className="flex items-start gap-1"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5"/> <span className="leading-tight">{ben}</span></li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}`;

content = content.replace(
  /\{\[\"basico\", \"destacado\", \"premium\"\]\.map\(\(planStr\) \=\> \{[\s\S]*?\}\)\}/,
  mappingBlock
);

// Add the Commission info box below the plans depending on modalidad
const comisionesInfo = `                  {/* Información de Comisiones Dinámica */}
                  <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
                    <h5 className="font-bold mb-2 flex items-center gap-2">
                      <Percent size={16} className="text-indigo-600" />
                      Acuerdo de Corretaje ({formInmueble.modalidad === 'venta' ? 'Venta' : 'Arriendo'})
                    </h5>
                    {formInmueble.modalidad === 'venta' ? (
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li><strong>Comisión Base:</strong> {planesConfig.comisiones.comisionVentaDefault}%</li>
                        <li><strong>Rango permitido:</strong> {planesConfig.comisiones.comisionVentaMin}% al {planesConfig.comisiones.comisionVentaMax}%</li>
                        <li><strong>Exclusividad:</strong> {planesConfig.comisiones.comisionVentaExclusiva}% (Si aplicara)</li>
                        <li>{planesConfig.comisiones.descripcionVenta}</li>
                      </ul>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li><strong>Modalidad de cobro:</strong> {planesConfig.comisiones.tipoComisionArriendo === 'primer_canon' ? 'Primer Canon' : 'Porcentaje'}</li>
                        {planesConfig.comisiones.tipoComisionArriendo === 'primer_canon' ? (
                          <li><strong>Honorarios:</strong> {planesConfig.comisiones.porcentajePrimerMes}% del primer mes de arriendo</li>
                        ) : (
                          <li><strong>Honorarios:</strong> {planesConfig.comisiones.comisionArriendoPorcentaje}%</li>
                        )}
                        <li>{planesConfig.comisiones.descripcionArriendo}</li>
                      </ul>
                    )}
                  </div>
`;

content = content.replace(
  '{/* Detalle de Facturación */}',
  comisionesInfo + '\n                  {/* Detalle de Facturación */}'
);

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
console.log('Patched modal successfully!');
