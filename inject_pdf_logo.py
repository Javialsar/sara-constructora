import os

f = 'src/lib/pdfGenerator.ts'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

# Helper function inside the file to get the correct base64
helper = """
const getCompanyMembrete = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('my_company_logo');
    if (custom) return custom;
  }
  return membreteBase64;
};
"""

if 'getCompanyMembrete' not in c:
    c = c.replace('export const generatePresupuestoGeneralPDF', helper + '\nexport const generatePresupuestoGeneralPDF')
    c = c.replace("doc.addImage(membreteBase64, 'PNG', 50, 5, 110, 40)", "doc.addImage(getCompanyMembrete(), 'PNG', 50, 5, 110, 40)")
    c = c.replace("doc.addImage(membreteBase64, 'PNG', 50, 10, 110, 40)", "doc.addImage(getCompanyMembrete(), 'PNG', 50, 10, 110, 40)")

    with open(f, 'w', encoding='utf-8') as file: file.write(c)
