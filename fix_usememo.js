const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/page.tsx', 'utf8');

// The function is:
//   const filteredInmuebles = useMemo(() => {
//     const filtered = inmueblesList.filter((item) => {
//       ...
//       return true
//     })
//   }, [modalidadTab, tipoFiltro, ubicacionInput, precioMin, precioMax, habFiltro, searchTerm])

content = content.replace(/return true\n\s*\}\)\n\s*\}, \[modalidadTab/g, `return true
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
  }, [inmueblesList, modalidadTab`);

fs.writeFileSync('src/app/(public)/inmobiliaria/page.tsx', content);
console.log('Fixed useMemo return!');
