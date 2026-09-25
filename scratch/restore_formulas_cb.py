import re

with open("src/app/admin/presupuestos_reales/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

target = """<button onClick={() => setIndForm({...indForm, formulas: defaultFormulas})} className='px-4 py-2 text-sm font-medium bg-slate-100 border border-transparent rounded-lg text-slate-600 hover:bg-slate-200 transition-colors'>Restaurar Frmulas por defecto</button>
                    
                  </div>"""

replacement = """<button onClick={() => setIndForm({...indForm, formulas: defaultFormulas})} className='px-4 py-2 text-sm font-medium bg-slate-100 border border-transparent rounded-lg text-slate-600 hover:bg-slate-200 transition-colors'>Restaurar Fórmulas por defecto</button>
                    <div className="flex items-center gap-2 ml-4">
                      <input type="checkbox" id="show-formulas" checked={showFormulas} onChange={(e) => setShowFormulas(e.target.checked)} className="rounded text-brand-sage focus:ring-brand-sage w-4 h-4 cursor-pointer" />
                      <label htmlFor="show-formulas" className="text-sm text-gray-600 font-medium cursor-pointer">Visualizar fórmulas</label>
                    </div>
                  </div>"""

# Replace the strange character as well
target = target.replace("", "ó")

# Let's just use exact replace with the real characters
if target in c:
    c = c.replace(target, replacement)
else:
    # Try regex if it fails
    c = re.sub(
        r"<button onClick=\{\(\) => setIndForm\(\{...indForm, formulas: defaultFormulas\}\)\} className='px-4 py-2 text-sm font-medium bg-slate-100 border border-transparent rounded-lg text-slate-600 hover:bg-slate-200 transition-colors'>Restaurar F.rmulas por defecto</button>\s*</div>",
        """<button onClick={() => setIndForm({...indForm, formulas: defaultFormulas})} className='px-4 py-2 text-sm font-medium bg-slate-100 border border-transparent rounded-lg text-slate-600 hover:bg-slate-200 transition-colors'>Restaurar Fórmulas por defecto</button>
                    <div className="flex items-center gap-2 ml-4">
                      <input type="checkbox" id="show-formulas" checked={showFormulas} onChange={(e) => setShowFormulas(e.target.checked)} className="rounded text-brand-sage focus:ring-brand-sage w-4 h-4 cursor-pointer" />
                      <label htmlFor="show-formulas" className="text-sm text-gray-600 font-medium cursor-pointer">Visualizar fórmulas</label>
                    </div>
                  </div>""",
        c
    )

with open("src/app/admin/presupuestos_reales/page.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
