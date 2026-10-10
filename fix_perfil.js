const fs = require('fs');
let content = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

// Fix double dollars
content = content.replace(/\$\$\{/g, '${');

// Add file input refs
content = content.replace(
  'const fileInputRef = useRef<HTMLInputElement>(null);',
  `const fileInputRef = useRef<HTMLInputElement>(null);
  const cedulaRef = useRef<HTMLInputElement>(null);
  const licenciaRef = useRef<HTMLInputElement>(null);
  const matriculaRef = useRef<HTMLInputElement>(null);
  
  const [docCedula, setDocCedula] = useState(false);
  const [docLicencia, setDocLicencia] = useState(false);
  const [docMatricula, setDocMatricula] = useState(false);`
);

// Update Documentos section
content = content.replace(
  '<button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>',
  `<input type="file" ref={cedulaRef} className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) setDocCedula(true); }} />
  {docCedula ? (
    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Recibido</span>
  ) : (
    <button onClick={() => cedulaRef.current?.click()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>
  )}`
);

content = content.replace(
  '<button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>',
  `<input type="file" ref={licenciaRef} className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) setDocLicencia(true); }} />
  {docLicencia ? (
    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Recibido</span>
  ) : (
    <button onClick={() => licenciaRef.current?.click()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>
  )}`
);

content = content.replace(
  '<button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>',
  `<input type="file" ref={matriculaRef} className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) setDocMatricula(true); }} />
  {docMatricula ? (
    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Recibido</span>
  ) : (
    <button onClick={() => matriculaRef.current?.click()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>
  )}`
);

// Ensure the "Pendiente Validación" span is hidden if Recibido is shown. Actually, let's just replace the whole div for the right side of the card.
content = content.replace(
  '<span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente Validación</span>',
  '{!docCedula && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente</span>}'
);
content = content.replace(
  '<span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente Validación</span>',
  '{!docLicencia && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente</span>}'
);
content = content.replace(
  '<span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente Validación</span>',
  '{!docMatricula && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente</span>}'
);

// Update Download buttons
const excelHandler = "alert('Descargando reporte en formato Excel... El archivo ha sido guardado en sus descargas.');";
const pdfHandler = "alert('Generando reporte PDF... El archivo ha sido guardado en sus descargas.');";

content = content.replace(
  '<button className="flex items-center bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">',
  `<button onClick={() => { ${excelHandler} }} className="flex items-center bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">`
);

content = content.replace(
  '<button className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">',
  `<button onClick={() => { ${pdfHandler} }} className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">`
);

fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', content, 'utf8');
