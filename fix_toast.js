const fs = require('fs');
let content = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

// Add Toast state
content = content.replace(
  'const [docMatricula, setDocMatricula] = useState(false);',
  `const [docMatricula, setDocMatricula] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };`
);

// Replace alerts with showToast
content = content.replace(
  "alert(`Redirigiendo a pasarela (Tarjetas, Transferencia, QR) para recargar $${rechargeAmount}. Al confirmar, tu saldo aumentará.`);",
  "showToast(`Redirigiendo a pasarela de pagos para recargar $${rechargeAmount}...`);"
);
content = content.replace(
  "alert('Descargando reporte en formato Excel... El archivo ha sido guardado en sus descargas.');",
  "showToast('Descargando reporte en formato Excel...');"
);
content = content.replace(
  "alert('Generando reporte PDF... El archivo ha sido guardado en sus descargas.');",
  "showToast('Generando reporte PDF...');"
);

// Inject Toast UI before final closing div
const toastUI = `
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="font-bold">{toastMessage}</p>
        </div>
      )}
`;

content = content.replace(
  '    </div>\n  );\n}\n',
  toastUI + '    </div>\n  );\n}\n'
);

// Fallback if the closing div doesn't have exact newlines
if (!content.includes('TOAST NOTIFICATION')) {
    content = content.replace(
        '    </div>\n  );\n}',
        toastUI + '    </div>\n  );\n}'
      );
}
if (!content.includes('TOAST NOTIFICATION')) {
    const lastDivIndex = content.lastIndexOf('</div>');
    if (lastDivIndex !== -1) {
        content = content.substring(0, lastDivIndex) + toastUI + content.substring(lastDivIndex);
    }
}


fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', content, 'utf8');
