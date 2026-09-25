import re

with open("src/app/admin/presupuestos_reales/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1. Add Excel import
if "generatePresupuestoGeneralExcel" not in c:
    c = c.replace(
        'import { generatePresupuestoGeneralPDF, generateAPUsPDF, generateExplosionPDF } from "@/lib/pdfGenerator"',
        'import { generatePresupuestoGeneralPDF, generateAPUsPDF, generateExplosionPDF } from "@/lib/pdfGenerator"\nimport { generatePresupuestoGeneralExcel } from "@/lib/excelGenerator"'
    )

# 2. Add Excel handler
handler_str = """  const handleGeneratePresupuestoGeneralExcel = () => {
    generatePresupuestoGeneralExcel({
      currentPresupuesto,
      proyectosCRM,
      totales: calcTotales(),
      presupuestoRubros,
      rubrosRecipes,
      allRubros
    });
  }

  const handleGeneratePresupuestoGeneralPDF"""

if "handleGeneratePresupuestoGeneralExcel" not in c:
    c = c.replace("const handleGeneratePresupuestoGeneralPDF", handler_str)

# 3. Modify table header
old_th = """<th className="px-6 py-3 text-center w-32">PDF</th>
                    <th className="px-6 py-3 text-center w-32">sT</th>"""

new_th = """<th className="px-6 py-3 text-center w-32">PDF</th>
                    <th className="px-6 py-3 text-center w-32">Excel</th>"""

c = c.replace('<th className="px-6 py-3 text-center w-32">sT</th>', '<th className="px-6 py-3 text-center w-32">Excel</th>')
c = c.replace('<th className="px-6 py-3 text-center w-32">ÚsT</th>', '<th className="px-6 py-3 text-center w-32">Excel</th>')

# 4. Modify Presupuesto Row Excel Button
old_pdf_btn = """<td className="px-6 py-4 text-center">
                      <button onClick={handleGeneratePresupuestoGeneralPDF} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                        <FileText size={14}/> Generar
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                        <Settings size={14}/> Configurar
                      </button>
                    </td>"""

new_pdf_btn = """<td className="px-6 py-4 text-center">
                      <button onClick={handleGeneratePresupuestoGeneralPDF} className="bg-red-600 hover:bg-red-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                        <FileText size={14}/> PDF
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={handleGeneratePresupuestoGeneralExcel} className="bg-green-600 hover:bg-green-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                        <Download size={14}/> Excel
                      </button>
                    </td>"""

# I will use a regex to replace the configuration button column
c = re.sub(
    r'<td className="px-6 py-4 text-center">\s*<button onClick=\{handleGeneratePresupuestoGeneralPDF\}.*?</button>\s*</td>\s*<td className="px-6 py-4 text-center">\s*<button className="bg-blue-600.*?Configurar\s*</button>\s*</td>',
    new_pdf_btn,
    c,
    flags=re.DOTALL
)

# And for the others that I haven't implemented yet, I will just replace the "Configurar" with a disabled Excel button or just leave it for now.
c = re.sub(
    r'<td className="px-6 py-4 text-center">\s*<button className="bg-blue-600.*?Configurar\s*</button>\s*</td>',
    r'<td className="px-6 py-4 text-center"><button disabled className="bg-gray-300 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed">Próximamente</button></td>',
    c,
    flags=re.DOTALL
)

with open("src/app/admin/presupuestos_reales/page.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
