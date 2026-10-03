import os

f = 'src/app/admin/ecosistema/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

# I need to modify the data fetching and the JSX cards.
# First, update the fetching part.
target_fetch = """  // APU
  const { count: usuariosCount } = await supabase.from("usuarios_sistema").select("*", { count: "exact", head: true })
  const { count: proyectosCount } = await supabase.from("proyectos").select("*", { count: "exact", head: true })
  const { count: pptoCount } = await supabase.from("presupuestos_reales").select("*", { count: "exact", head: true })"""

new_fetch = """  // SARA CONSTRUCTORA (Corporativo)
  const { count: proyectosCount } = await supabase.from("proyectos").select("*", { count: "exact", head: true }).in("estado", ["en_diseno", "en_construccion"])
  const { count: cotizacionesCount } = await supabase.from("cotizaciones").select("*", { count: "exact", head: true })
  const { count: clientesCount } = await supabase.from("clientes").select("*", { count: "exact", head: true })

  // SARA-APU (SaaS)
  const { count: usuariosCount } = await supabase.from("usuarios_sistema").select("*", { count: "exact", head: true })
  const { count: pptoCount } = await supabase.from("presupuestos_reales").select("*", { count: "exact", head: true })"""

c = c.replace(target_fetch, new_fetch)

# Now update the grid to be grid-cols-1 md:grid-cols-2 lg:grid-cols-4
c = c.replace('grid-cols-1 md:grid-cols-3', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4')

# Now update the cards.
target_cards = """          {/* SARA APU */}
          <div className="bg-white rounded-2xl shadow-sm border-t-4 border-t-blue-500 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">SARA-APU</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">SARA Constructora</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Users size={16}/> Usuarios / Clientes</span>
                <span className="font-black text-gray-900 text-lg">{usuariosCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Home size={16}/> Proyectos Activos</span>
                <span className="font-black text-gray-900 text-lg">{proyectosCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><BarChart3 size={16}/> Presupuestos Creados</span>
                <span className="font-black text-gray-900 text-lg">{pptoCount || 0}</span>
              </div>
            </div>
          </div>"""

new_cards = """          {/* SARA CONSTRUCTORA */}
          <div className="bg-white rounded-2xl shadow-sm border-t-4 border-t-brand-dark overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-sage/20 text-brand-dark rounded-xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">SARA Constructora</h3>
                <p className="text-xs text-brand-dark font-bold uppercase tracking-wider">Matriz Corporativa</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Home size={16}/> Obras Activas</span>
                <span className="font-black text-gray-900 text-lg">{proyectosCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Users size={16}/> Clientes Directos</span>
                <span className="font-black text-gray-900 text-lg">{clientesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><BarChart3 size={16}/> Cotizaciones</span>
                <span className="font-black text-gray-900 text-lg">{cotizacionesCount || 0}</span>
              </div>
            </div>
          </div>

          {/* SARA APU */}
          <div className="bg-white rounded-2xl shadow-sm border-t-4 border-t-blue-500 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">SARA-APU</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Software SaaS</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><Users size={16}/> Suscriptores</span>
                <span className="font-black text-gray-900 text-lg">{usuariosCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm flex items-center gap-2"><BarChart3 size={16}/> Presupuestos Creados</span>
                <span className="font-black text-gray-900 text-lg">{pptoCount || 0}</span>
              </div>
            </div>
          </div>"""

c = c.replace(target_cards, new_cards)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
