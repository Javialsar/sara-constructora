import re

path = 'src/app/admin/presupuestos_reales/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old_code = """    const explosionData = Object.values(consolidado).sort((a, b) => {
      if (a.tipo < b.tipo) return -1; if (a.tipo > b.tipo) return 1; return a.nombre.localeCompare(b.nombre);
    });

    generateExplosionPDF({
      currentPresupuesto,
      explosionData
    });"""

new_code = """    let explosionData = Object.values(consolidado).sort((a, b) => {
      if (a.tipo < b.tipo) return -1; if (a.tipo > b.tipo) return 1; return a.nombre.localeCompare(b.nombre);
    });
    
    let title = "EXPLOSIÓN DE INSUMOS";
    if (filterType === 'equipo') {
       explosionData = explosionData.filter(i => i.tipo === 'equipo' || i.tipo === 'herramienta_menor');
       title = "REPORTE DE EQUIPOS";
    } else if (filterType === 'mano_de_obra') {
       explosionData = explosionData.filter(i => i.tipo === 'mano_de_obra');
       title = "REPORTE DE MANO DE OBRA";
    } else if (filterType === 'material') {
       explosionData = explosionData.filter(i => i.tipo === 'material');
       title = "REPORTE DE MATERIALES";
    }

    generateExplosionPDF({
      currentPresupuesto,
      explosionData,
      title
    });"""

if old_code in c:
    c = c.replace(old_code, new_code)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Patched handleGenerateExplosionPDF")
else:
    print("Could not find old_code")
