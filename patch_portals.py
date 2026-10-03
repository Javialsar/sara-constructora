import os
import re

# STAYS
stays_f = 'src/app/(public)/stays/mis-reservas/page.tsx'
with open(stays_f, 'r', encoding='utf-8') as file:
    c = file.read()

c = c.replace('import { Shield,', 'import SecurityPanel from "@/components/SecurityPanel";\nimport { Shield,')
c = c.replace('useState<"reservas" | "alojamientos">("reservas")', 'useState<"reservas" | "alojamientos" | "seguridad">("reservas")')
c = c.replace('<span>2. Mis Alojamientos & Ganancias</span>', '<span>2. Mis Alojamientos</span>')

button_str = '''              </button>
              <button
                onClick={() => setMainPortalTab("seguridad")}
                className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  mainPortalTab === "seguridad"
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <Shield size={16} className={mainPortalTab === "seguridad" ? "text-emerald-400" : ""} />
                <span className="hidden sm:inline">3. Seguridad</span>
              </button>'''

c = re.sub(r'\{misAlojamientos\.length\}\s*</span>\s*</button>', '{misAlojamientos.length}\n                </span>' + button_str, c)

c = c.replace('{mainPortalTab === "alojamientos" && (', '{mainPortalTab === "seguridad" && <SecurityPanel />}\n        {mainPortalTab === "alojamientos" && (')

with open(stays_f, 'w', encoding='utf-8') as file:
    file.write(c)


# INMOBILIARIA
inmo_f = 'src/app/(public)/inmobiliaria/mi-portal/page.tsx'
with open(inmo_f, 'r', encoding='utf-8') as file:
    c2 = file.read()

c2 = c2.replace('import { Shield,', 'import SecurityPanel from "@/components/SecurityPanel";\nimport { Shield,')
c2 = c2.replace('useState<"propiedades" | "historial">("propiedades")', 'useState<"propiedades" | "historial" | "seguridad">("propiedades")')

inmo_desktop_btn = '''              </button>
              <button
                onClick={() => { setMainTab("seguridad"); setDetalleInmueble(null) }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  mainTab === "seguridad" && !detalleInmueble
                    ? "bg-slate-700 text-white shadow-md font-extrabold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Shield size={14} /> Seguridad
              </button>'''
c2 = re.sub(r'<Clock size=\{14\} /> Historial\s*</button>', '<Clock size={14} /> Historial\n              </button>\n' + inmo_desktop_btn, c2)

inmo_mobile_btn = '''            </button>
            <button
              onClick={() => { setMainTab("seguridad"); setDetalleInmueble(null) }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mainTab === "seguridad" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              <Shield size={16} /> <span className="hidden sm:inline">Seguridad</span>
            </button>'''
c2 = re.sub(r'<Clock size=\{16\} /> <span className="hidden sm:inline">Historial</span>\s*</button>', '<Clock size={16} /> <span className="hidden sm:inline">Historial</span>\n            </button>\n' + inmo_mobile_btn, c2)

c2 = c2.replace('{mainTab === "historial" && (', '{mainTab === "seguridad" && <SecurityPanel />}\n            {mainTab === "historial" && (')

with open(inmo_f, 'w', encoding='utf-8') as file:
    file.write(c2)
