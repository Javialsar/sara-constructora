import os

f = 'src/app/dashboard/presupuestos_reales/page.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

modal_logic = """
      {/* MODAL BIM */}
      {isBimModalOpen && (
        <BimImporterModal 
          onClose={() => setIsBimModalOpen(false)}
          onImport={(data) => {
            alert(`SARA procesará estos ${data.length} registros y creará un Presupuesto automáticamente. (Fase 2 de Desarrollo)`);
            setIsBimModalOpen(false);
            setIsNewModalOpen(true);
          }}
        />
      )}
"""

if '{/* MODAL BIM */}' not in c:
    c = c.replace('    </div>\n  )\n}', modal_logic + '    </div>\n  )\n}')
    with open(f, 'w', encoding='utf-8') as file: file.write(c)
