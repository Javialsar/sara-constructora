const fs = require('fs');
const path = 'src/app/admin/configuracion/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const themePickerHTML = `
      {/* Selector de Temas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Settings size={18} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Apariencia y Tema (Administrador)</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <button onClick={() => changeTheme('')} className="flex flex-col gap-2 items-center text-center p-4 rounded-xl border-2 hover:border-brand-sage transition-all border-gray-200">
            <div className="flex gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#07130d]"></div>
              <div className="w-6 h-6 rounded-full bg-[#3c7a52]"></div>
            </div>
            <span className="font-bold text-gray-800">Sara Sage</span>
            <span className="text-xs text-gray-500">Tema Corporativo (Por defecto)</span>
          </button>

          <button onClick={() => changeTheme('theme-ocean')} className="flex flex-col gap-2 items-center text-center p-4 rounded-xl border-2 hover:border-blue-500 transition-all border-gray-200">
            <div className="flex gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#1e293b]"></div>
              <div className="w-6 h-6 rounded-full bg-[#3b82f6]"></div>
            </div>
            <span className="font-bold text-gray-800">Constructor Ocean</span>
            <span className="text-xs text-gray-500">Tonos azules y grises técnicos</span>
          </button>

          <button onClick={() => changeTheme('theme-gold')} className="flex flex-col gap-2 items-center text-center p-4 rounded-xl border-2 hover:border-yellow-500 transition-all border-gray-200">
            <div className="flex gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#171717]"></div>
              <div className="w-6 h-6 rounded-full bg-[#d4af37]"></div>
            </div>
            <span className="font-bold text-gray-800">Elegante Dark</span>
            <span className="text-xs text-gray-500">Oscuro alto contraste con dorado</span>
          </button>
        </div>
      </div>
`;

// Add changeTheme function
if (!code.includes("const changeTheme = ")) {
  code = code.replace(
    /const addMiembro = \(\) => \{/,
    `const changeTheme = (themeClass: string) => {
    document.documentElement.classList.remove('theme-ocean', 'theme-gold', 'theme-apucons')
    if (themeClass) {
      document.documentElement.classList.add(themeClass)
    }
    localStorage.setItem('sara_theme', themeClass)
  }

  const addMiembro = () => {`
  );
}

// Inject UI
if (!code.includes("Apariencia y Tema (Administrador)")) {
  code = code.replace(
    /<div className="max-w-5xl space-y-8 pb-12">\s*<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">([\s\S]*?)<\/div>\s*<\/div>/,
    `<div className="max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">$1</div></div>\n${themePickerHTML}`
  );
}

fs.writeFileSync(path, code);
console.log("Configuracion patched!");
