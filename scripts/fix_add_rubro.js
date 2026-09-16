const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const oldLogic = `      if (recetaMaestra && recetaMaestra.length > 0) {
        const clonedRecipe = recetaMaestra.map(rm => {
          const insumoObj = Array.isArray(rm.insumo) ? rm.insumo[0] : rm.insumo;
          return {
            presupuesto_rubro_id: newPresRubro.id,
            insumo_id: rm.insumo_id,
            cantidad: rm.cantidad,
            precio_sin_iva_snapshot: insumoObj ? insumoObj.precio_sin_iva : 0
          }
        });
        await supabase.from('presupuesto_rubro_insumos').insert(clonedRecipe)
      }
  
      setIsAddRubroModalOpen(false)
      setSearchRubroTerm("")
      fetchPresupuestoRubros(currentPresupuesto.id)
      setExpandedRubros(prev => ({...prev, [newPresRubro.id]: true}))`;

const newLogic = `      if (recetaMaestra && recetaMaestra.length > 0) {
        const clonedRecipe = recetaMaestra.map(rm => {
          const insumoObj = Array.isArray(rm.insumo) ? rm.insumo[0] : rm.insumo;
          return {
            presupuesto_rubro_id: newPresRubro.id,
            insumo_id: rm.insumo_id,
            cantidad: rm.cantidad,
            precio_sin_iva_snapshot: insumoObj ? insumoObj.precio_sin_iva : 0
          }
        });
        await supabase.from('presupuesto_rubro_insumos').insert(clonedRecipe)
        // Force recalculation so P. Unitario is perfectly derived from insumos
        await recalcAndSaveRubroUnitario(newPresRubro.id, defaultCantidad, rubro.id)
      }
  
      setIsAddRubroModalOpen(false)
      setSearchRubroTerm("")
      fetchPresupuestoRubros(currentPresupuesto.id)
      setExpandedRubros(prev => ({...prev, [newPresRubro.id]: true}))`;

c = c.replace(oldLogic, newLogic);
fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
console.log('Fixed handleAddRubroToPresupuesto');
