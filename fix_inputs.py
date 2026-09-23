import re

with open('src/app/admin/presupuestos_reales/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# We want to replace each input like:
# <input type="number" step="0.1" value={indForm.pmaq1} onChange={e => setIndForm({...indForm, pmaq1: e.target.value})} className="..." />
# With a wrapper:
# <div className="flex items-center border-2 border-brand-sage/40 rounded-lg overflow-hidden w-24 h-9 shadow-inner bg-blue-50 focus-within:border-brand-sage focus-within:bg-white transition-all">
#   <button onClick={() => setIndForm({...indForm, pmaq1: String((Number(indForm.pmaq1)||0) - 0.1)})} className="w-8 h-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-600">-</button>
#   <input type="number" step="0.1" value={indForm.pmaq1} onChange={e => setIndForm({...indForm, pmaq1: e.target.value})} className="w-full h-full text-center bg-transparent outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
#   <button onClick={() => setIndForm({...indForm, pmaq1: String((Number(indForm.pmaq1)||0) + 0.1)})} className="w-8 h-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-600">+</button>
# </div>

keys = ['pmaq1', 'pmob1', 'pmat1', 'ggen', 'pgas1', 'pgas2', 'pgas3', 'pimp', 'util']

for k in keys:
    # Find the input for this key
    pattern = rf'<input type="number" step="[^"]+" value={{indForm\.{k}}}[^>]*>'
    
    match = re.search(pattern, code)
    if match:
        wrapper = f"""<div className="flex items-center border-2 border-brand-sage/40 rounded-lg overflow-hidden w-28 h-9 shadow-inner bg-blue-50 focus-within:border-brand-sage focus-within:bg-white transition-all">
                          <button type="button" onClick={{() => setIndForm({{\.\.\.indForm, {k}: String(Math.max(0, (Number(indForm.{k})||0) - 1)))}} className="w-8 h-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-600 flex items-center justify-center">-</button>
                          <input type="number" step="0.1" value={{indForm.{k} !== undefined && indForm.{k} !== null ? indForm.{k} : ''}} onChange={{e => setIndForm({{\.\.\.indForm, {k}: e.target.value}})}} className="w-full h-full text-center bg-transparent outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm" />
                          <button type="button" onClick={{() => setIndForm({{\.\.\.indForm, {k}: String((Number(indForm.{k})||0) + 1))}} className="w-8 h-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-600 flex items-center justify-center">+</button>
                        </div>"""
        
        # Note: Math.max to avoid negative percentages.
        # Wait, the braces are a bit messy. Let's construct it properly.
        wrapper = f"""<div className="flex items-center border-2 border-brand-sage/40 rounded-lg overflow-hidden w-28 h-9 shadow-inner bg-blue-50 focus-within:border-brand-sage focus-within:bg-white transition-all">
                          <button type="button" onClick={{() => setIndForm({{...indForm, {k}: String(Math.max(0, (Number(indForm.{k})||0) - 1))}})}} className="w-8 h-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-600 flex items-center justify-center">-</button>
                          <input type="number" step="0.1" value={{indForm.{k} !== undefined && indForm.{k} !== null ? indForm.{k} : ''}} onChange={{e => setIndForm({{...indForm, {k}: e.target.value}})}} className="w-full h-full text-center bg-transparent outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm" />
                          <button type="button" onClick={{() => setIndForm({{...indForm, {k}: String((Number(indForm.{k})||0) + 1)}})}} className="w-8 h-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-600 flex items-center justify-center">+</button>
                        </div>"""
        
        code = code[:match.start()] + wrapper + code[match.end():]

with open('src/app/admin/presupuestos_reales/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Inputs upgraded to custom buttons!")
