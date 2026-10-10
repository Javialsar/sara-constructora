const fs = require('fs');
let c = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

const vehiculoStart = c.indexOf("{/* TAB: VEHICULO */}");
const documentosStart = c.indexOf("{/* TAB: DOCUMENTOS */}");

let vehiculoBlock = c.substring(vehiculoStart, documentosStart);

const mapStart = vehiculoBlock.indexOf("{/* GEOREFERENCIA MAPA */}");
let mapEnd = vehiculoBlock.lastIndexOf("</div>", vehiculoBlock.lastIndexOf("</div>", vehiculoBlock.lastIndexOf("</div>") - 1) - 1);
// That's too risky. 

// Let's just find the map block using regex
const mapBlockMatch = vehiculoBlock.match(/\{\/\* GEOREFERENCIA MAPA \*\/\}[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*$)/);

if (mapBlockMatch) {
    const mapContent = mapBlockMatch[0];
    
    // The rest of the form is everything before the map block
    let newVehiculoBlock = vehiculoBlock.replace(mapContent, "");
    
    // Change title of Vehiculo block
    newVehiculoBlock = newVehiculoBlock.replace("Datos del Conductor y Radar", "Datos de Mi Cabina y Perfil");
    
    const tabSincronizacion = `
          {/* TAB: SINCRONIZACION */}
          {activeTab === 'sincronizacion' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full min-h-[85vh] flex flex-col">
              <h2 className="text-3xl font-black mb-6">Sincronización Fletes (Radar Activo)</h2>
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                ${mapContent.replace(/w-full h-96 rounded-xl/, 'w-full h-[75vh] rounded-xl shadow-inner')}
              </div>
            </div>
          )}
          
`;
    
    c = c.substring(0, vehiculoStart) + tabSincronizacion + newVehiculoBlock + c.substring(documentosStart);
    fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', c);
    console.log("Success");
} else {
    console.log("Regex failed");
}
