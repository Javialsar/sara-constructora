import os
import re

f = 'src/app/dashboard/presupuestos_reales/page.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

# Add state
if 'const [isBimModalOpen, setIsBimModalOpen] = useState(false)' not in c:
    c = c.replace('const [isNewModalOpen, setIsNewModalOpen] = useState(false)', 'const [isNewModalOpen, setIsNewModalOpen] = useState(false)\n  const [isBimModalOpen, setIsBimModalOpen] = useState(false)')

# Add Import
if 'import BimImporterModal' not in c:
    c = c.replace('import React,', 'import BimImporterModal from "./components/BimImporterModal"\nimport { Cuboid } from "lucide-react"\nimport React,')

# Add Button
target_btn = "{userRole === 'admin' && <button onClick={() => setIsNewModalOpen(true)}"
replacement_btn = """{userRole === 'admin' && (
            <div className="flex gap-3">
              <button onClick={() => setIsBimModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-full hover:shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
                <Cuboid size={20} /> Importación BIM
              </button>
              <button onClick={() => setIsNewModalOpen(true)}"""
if 'Importación BIM' not in c:
    c = c.replace(target_btn, replacement_btn)
    # close the div that wraps the buttons
    c = c.replace('/> Nuevo Presupuesto</button>}', '/> Nuevo Presupuesto</button>\n            </div>\n          )}')

# Add Modal rendered logic at the end
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
    # Insert before the final closing div/fragment
    c = re.sub(r'(</>\s*)\s*$', r'\n' + modal_logic + r'\n\1', c)

with open(f, 'w', encoding='utf-8') as file: file.write(c)
