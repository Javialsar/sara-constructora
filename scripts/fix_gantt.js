const fs = require('fs');
let code = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const oldLogic = `  const generateSchedule = async () => {
    let needsInit = presupuestoRubros.some(pr => !pr.fecha_inicio);
    if (!needsInit) return;

    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    
    const newRubros = [];
    
    for (let i = 0; i < presupuestoRubros.length; i++) {
      const pr = presupuestoRubros[i];
      let totalManHours = 0;
      const insumos = rubrosRecipes[pr.id] || [];
      const mo = insumos.filter(r => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra');
      mo.forEach(m => {
        totalManHours += Number(m.cantidad) * pr.cantidad_obra;
      });
      
      let dias = Math.max(1, Math.ceil((totalManHours / 24) * 1.2)); 
      
      const updatePayload = {
        fecha_inicio: currentDate.toISOString().split('T')[0],
        duracion_dias: dias
      };
      
      await supabase.from('presupuesto_rubros').update(updatePayload).eq('id', pr.id);
      
      pr.fecha_inicio = updatePayload.fecha_inicio;
      pr.duracion_dias = updatePayload.duracion_dias;
      newRubros.push({...pr});
      
      currentDate.setDate(currentDate.getDate() + dias);
    }
    setPresupuestoRubros(newRubros);
  };`;

const newLogic = `  const generateSchedule = async () => {
    try {
      let needsInit = presupuestoRubros.some(pr => !pr.fecha_inicio);
      if (!needsInit) return;

      let currentDate = new Date();
      currentDate.setHours(0,0,0,0);
      
      const newRubros = [];
      
      for (let i = 0; i < presupuestoRubros.length; i++) {
        const pr = presupuestoRubros[i];
        let totalManHours = 0;
        const insumos = rubrosRecipes[pr.id] || [];
        const mo = insumos.filter(r => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra');
        mo.forEach(m => {
          totalManHours += Number(m.cantidad || 0) * Number(pr.cantidad_obra || 0);
        });
        
        let dias = Math.max(1, Math.ceil((totalManHours / 24) * 1.2) || 1); 
        
        const updatePayload = {
          fecha_inicio: currentDate.toISOString().split('T')[0],
          duracion_dias: dias
        };
        
        await supabase.from('presupuesto_rubros').update(updatePayload).eq('id', pr.id);
        
        pr.fecha_inicio = updatePayload.fecha_inicio;
        pr.duracion_dias = updatePayload.duracion_dias;
        newRubros.push({...pr});
        
        currentDate.setDate(currentDate.getDate() + dias);
      }
      setPresupuestoRubros(newRubros);
    } catch (err) {
      console.error(err);
      alert("Error generando cronograma: " + err.message);
    }
  };`;

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  
  // also wrap the button onClick in a try/catch to be ultra safe
  const oldBtn = `<button onClick={async () => { await generateSchedule(); setIsGanttModalOpen(true); }}`;
  const newBtn = `<button onClick={async () => { try { await generateSchedule(); setIsGanttModalOpen(true); } catch(e) { alert(e.message); } }}`;
  code = code.replace(oldBtn, newBtn);

  fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', code);
  console.log("Patched correctly!");
} else {
  console.log("Could not find old logic");
}
