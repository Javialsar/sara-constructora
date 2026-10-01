const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/page.tsx', 'utf8');

// 1. Add plan?: string to interface
content = content.replace(/destacada: boolean/g, 'destacada: boolean\n  plan?: string');

// 2. Add plan: item.promocion?.plan || "basico" to mapping
content = content.replace(/destacada: item\.destacado \|\| false,/g, 'destacada: item.destacado || false,\n              plan: item.promocion?.plan || item.planPromocion || "basico",');

// 3. Update the sorting in filteredInmuebles
const sortLogic = `
      // Filtro Precio Máximo
      if (precioMax !== "" && Number(precioMax) > 0) {
        if (item.precio > Number(precioMax)) return false
      }
      return true
    })

    // Ordenar por prioridad del plan: premium > destacado > basico > comision
    const planWeight: Record<string, number> = {
      "premium": 4,
      "destacado": 3,
      "basico": 2,
      "comision": 1
    }

    return filtered.sort((a, b) => {
      const wA = planWeight[a.plan || "basico"] || 0
      const wB = planWeight[b.plan || "basico"] || 0
      return wB - wA
    })
  }, [inmueblesList, modalidadTab, tipoFiltro, ubicacionInput, precioMin, precioMax, habFiltro, searchTerm])
`;

const oldSort = `
      // Filtro Precio Máximo
      if (precioMax !== "" && Number(precioMax) > 0) {
        if (item.precio > Number(precioMax)) return false
      }
      return true
    })
  }, [inmueblesList, modalidadTab, tipoFiltro, ubicacionInput, precioMin, precioMax, habFiltro, searchTerm])
`;

content = content.replace(oldSort, sortLogic);

// Wait, the variable in `return inmueblesList.filter` is not assigned to `filtered`. 
// I need to change it.
const filterStart = `const filteredInmuebles = useMemo(() => {\n    return inmueblesList.filter((item) => {`;
const filterStartNew = `const filteredInmuebles = useMemo(() => {\n    const filtered = inmueblesList.filter((item) => {`;
content = content.replace(filterStart, filterStartNew);

fs.writeFileSync('src/app/(public)/inmobiliaria/page.tsx', content);
console.log('Fixed sorting by plan');
