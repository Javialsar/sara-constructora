const fs = require('fs');
const file = 'src/app/(public)/inmobiliaria/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add state
const stateImport = `const [logoInmobiliaria, setLogoInmobiliaria] = useState<string>("/sara-inmobiliaria.png")`;
const newState = `const [logoInmobiliaria, setLogoInmobiliaria] = useState<string>("/sara-inmobiliaria.png")
  // Paginación
  const [visibleCount, setVisibleCount] = useState<number>(12)`;
content = content.replace(stateImport, newState);

// Update map
const oldMap = `{filteredInmuebles.map((inm) => (`;
const newMap = `{filteredInmuebles.slice(0, visibleCount).map((inm) => (`;
content = content.replace(oldMap, newMap);

// Add Load More button
const endGrid = `          ))}
        </div>

        {/* Modal de Detalle de Inmueble (Alta Gama) */}`;
const endGridNew = `          ))}
        </div>
        
        {/* Paginación - Cargar Más */}
        {filteredInmuebles.length > visibleCount && (
          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm flex items-center gap-2"
            >
              Cargar más propiedades
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
        )}

        {/* Modal de Detalle de Inmueble (Alta Gama) */}`;
content = content.replace(endGrid, endGridNew);

// Also reset visibleCount when filters change
const oldUseEffectFilters = `return wB - wA
    })
  }, [inmueblesList, modalidadTab, tipoFiltro, ubicacionInput, precioMin, precioMax, habFiltro, searchTerm])`;

const newUseEffectFilters = `return wB - wA
    })
  }, [inmueblesList, modalidadTab, tipoFiltro, ubicacionInput, precioMin, precioMax, habFiltro, searchTerm])

  // Resetear paginación cuando cambian los filtros
  useEffect(() => {
    setVisibleCount(12)
  }, [modalidadTab, tipoFiltro, ubicacionInput, precioMin, precioMax, habFiltro, searchTerm])`;

content = content.replace(oldUseEffectFilters, newUseEffectFilters);

fs.writeFileSync(file, content);
console.log('Added pagination!');
