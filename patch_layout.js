const fs = require('fs');
const path = 'src/app/admin/layout.tsx';

let code = fs.readFileSync(path, 'utf8');

// Add state for sidebar
if (!code.includes("isSidebarCollapsed")) {
  code = code.replace(
    /const \[userRole, setUserRole\] = useState\("Administrador"\)/,
    'const [userRole, setUserRole] = useState("Administrador")\n  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)'
  );
}

// Modify the aside tag
code = code.replace(
  /<aside className="w-64 bg-brand-dark text-white flex flex-col h-full shadow-2xl z-20 print:hidden">/,
  '<aside className={`bg-brand-dark text-white flex flex-col h-full shadow-2xl z-20 print:hidden transition-all duration-300 ${isSidebarCollapsed ? "w-20" : "w-64"}`}>'
);

// Modify logo section
code = code.replace(
  /<div className="p-6 border-b border-white\/10 flex items-center gap-3">([\s\S]*?)<\/div>\s*<\/div>/,
  `<div className="p-6 border-b border-white/10 flex items-center gap-3 justify-center">
          <div className="w-8 h-8 shrink-0 bg-white rounded flex items-center justify-center p-1">
            <img src={logo} alt="SARA Logo" className="w-full h-full object-contain" />
          </div>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold tracking-wider text-sm uppercase">{userRole}</h1>
              <p className="text-[10px] text-brand-sage uppercase">SARA Constructora</p>
            </div>
          )}
        </div>`
);

// Modify group button
code = code.replace(
  /<button \s*onClick=\{\(\) => toggleGroup\(group\.title\)\}\s*className=\{`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors \$\{([\s\S]*?)\}`\}\s*>\s*<span>\{group\.title\}<\/span>\s*\{isOpen \? <ChevronDown size=\{14\} \/> : <ChevronRight size=\{14\} \/>\}\s*<\/button>/g,
  `<button 
                  onClick={() => { if(isSidebarCollapsed) setIsSidebarCollapsed(false); toggleGroup(group.title); }}
                  className={\`w-full flex items-center \${isSidebarCollapsed ? "justify-center" : "justify-between"} px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors \${
                    isOpen ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }\`}
                >
                  {!isSidebarCollapsed && <span>{group.title}</span>}
                  {isSidebarCollapsed ? <span className="font-bold text-lg">...</span> : (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                </button>`
);

// Modify links
code = code.replace(
  /<Link \s*key=\{item\.href\}\s*href=\{item\.href\} \s*className=\{`flex items-center gap-3 px-3 py-2\.5 rounded-lg font-medium transition-colors \$\{([\s\S]*?)\}`\}\s*>\s*<Icon size=\{18\} \/>\s*<span>\{item\.label\}<\/span>\s*<\/Link>/g,
  `<Link 
                          key={item.href}
                          href={item.href} 
                          title={isSidebarCollapsed ? item.label : undefined}
                          className={\`flex items-center \${isSidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg font-medium transition-colors \${
                            isActive 
                              ? "bg-brand-sage text-brand-dark" 
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }\`}
                        >
                          <Icon size={18} className="shrink-0" />
                          {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                        </Link>`
);

// Modify bottom links
code = code.replace(
  /<div className="p-4 border-t border-white\/10">([\s\S]*?)<Settings size=\{16\} \/>\s*<span>Configuración<\/span>\s*<\/Link>([\s\S]*?)<LogOut size=\{16\} \/>\s*<span>Cerrar Sesión<\/span>\s*<\/button>\s*<\/div>/,
  `<div className="p-4 border-t border-white/10">
          <Link href="/admin/configuracion" title={isSidebarCollapsed ? "Configuración" : undefined} className={\`flex items-center \${isSidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors text-sm mb-1\`}>
            <Settings size={18} className="shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">Configuración</span>}
          </Link>
          <button 
            title={isSidebarCollapsed ? "Cerrar Sesión" : undefined}
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/'
            }} 
            className={\`w-full flex items-center \${isSidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm\`}
          >
            <LogOut size={18} className="shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden">Cerrar Sesión</span>}
          </button>
        </div>`
);

// Add Hamburger menu to Header
code = code.replace(
  /<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shrink-0 print:hidden">\s*<h2 className="font-bold text-gray-800 text-lg">Panel de Control<\/h2>/,
  `<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shrink-0 print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 bg-gray-50 hover:bg-gray-100 border rounded-lg transition-colors">
              <Menu size={20} className="text-gray-600"/>
            </button>
            <h2 className="font-bold text-gray-800 text-lg hidden sm:block">Panel de Control</h2>
          </div>`
);

fs.writeFileSync(path, code);
console.log("Layout patched!");
