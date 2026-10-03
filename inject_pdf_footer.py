import os

f = 'src/lib/pdfGenerator.ts'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

helper = """
const getCompanyProfile = () => {
  if (typeof window !== 'undefined') {
    const profileStr = localStorage.getItem('my_company_profile');
    if (profileStr) {
      try { return JSON.parse(profileStr).formData; } catch(e) {}
    }
  }
  return null;
};

const addCompanyFooter = (doc: jsPDF) => {
  const profile = getCompanyProfile();
  if (!profile) return;
  
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    
    let footerParts = [];
    if (profile.nombre_comercial) footerParts.push(profile.nombre_comercial);
    if (profile.ruc) footerParts.push(`RUC: ${profile.ruc}`);
    if (profile.direccion) footerParts.push(`Dir: ${profile.direccion.substring(0,50)}`);
    if (profile.telefono) footerParts.push(`Tel: ${profile.telefono}`);
    if (profile.email) footerParts.push(`Email: ${profile.email}`);
    if (profile.website) footerParts.push(`Web: ${profile.website}`);
    
    if (footerParts.length > 0) {
      doc.text(footerParts.join('  |  '), 14, doc.internal.pageSize.height - 10);
    }
  }
};
"""

if 'getCompanyProfile' not in c:
    c = c.replace('export const generatePresupuestoGeneralPDF', helper + '\nexport const generatePresupuestoGeneralPDF')
    
    # Inyectar antes de doc.save en cada función
    c = c.replace('doc.save("Presupuesto_General.pdf")', 'addCompanyFooter(doc);\n    doc.save("Presupuesto_General.pdf")')
    c = c.replace('doc.save("Analisis_Precios_Unitarios.pdf")', 'addCompanyFooter(doc);\n    doc.save("Analisis_Precios_Unitarios.pdf")')
    c = c.replace('doc.save(`${title.replace(/ /g, "_")}.pdf`)', 'addCompanyFooter(doc);\n    doc.save(`${title.replace(/ /g, "_")}.pdf`)')

    with open(f, 'w', encoding='utf-8') as file: file.write(c)
