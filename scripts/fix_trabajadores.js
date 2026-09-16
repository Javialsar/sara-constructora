const fs = require('fs');
let code = fs.readFileSync('src/app/admin/trabajadores/page.tsx', 'utf8');

if (!code.includes('import salariosData')) {
    code = code.replace('import { createClient } from "@/lib/supabase/client"', 'import { createClient } from "@/lib/supabase/client"\nimport salariosData from "@/lib/salariosData.json"');
}

const inputRegex = /<input\s+required\s+type="text"\s+placeholder="Ej[^>]+className="w-full border border-gray-300[^>]+value=\{formData\.categoria_ocupacional\}\s+onChange=\{e => setFormData\(\{\.\.\.formData, categoria_ocupacional: e\.target\.value\}\)\}\s+\/>/m;

const newInput = `<input 
                      required
                      type="text" 
                      list="categorias-list"
                      placeholder="Ej. Albañil, Ayudante, Maestro de Obra..."
                      className="w-full border-2 border-brand-sage rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none bg-brand-sage/5"
                      value={formData.categoria_ocupacional}
                      onChange={e => {
                        const val = e.target.value;
                        const found = salariosData.find(s => s.actividad === val);
                        if (found) {
                          setFormData({...formData, categoria_ocupacional: val, jornal_real: found.jornal, costo_horario: found.hora});
                        } else {
                          setFormData({...formData, categoria_ocupacional: val});
                        }
                      }}
                    />
                    <datalist id="categorias-list">
                      {salariosData.map(s => <option key={s.actividad} value={s.actividad} />)}
                    </datalist>`;

code = code.replace(inputRegex, newInput);

fs.writeFileSync('src/app/admin/trabajadores/page.tsx', code);
console.log('Fixed trabajadores form');
