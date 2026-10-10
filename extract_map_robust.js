const fs = require('fs');
let c = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

const vehiculoStart = c.indexOf("{/* TAB: VEHICULO */}");
const documentosStart = c.indexOf("{/* TAB: DOCUMENTOS */}");
let vehiculoBlock = c.substring(vehiculoStart, documentosStart);

const mapStartStr = "{/* GEOREFERENCIA MAPA */}";
const mapStart = vehiculoBlock.indexOf(mapStartStr);

if (mapStart > -1) {
    let currentIdx = mapStart;
    let divCount = 0;
    let started = false;
    let mapEnd = -1;
    
    // Simple HTML parser for divs
    for (let i = mapStart; i < vehiculoBlock.length; i++) {
        if (vehiculoBlock.substring(i, i + 4) === "<div") {
            divCount++;
            started = true;
        } else if (vehiculoBlock.substring(i, i + 6) === "</div>") {
            divCount--;
        }
        
        if (started && divCount === 0 && vehiculoBlock.substring(i, i + 6) === "</div>") {
            mapEnd = i + 6;
            break;
        }
    }
    
    if (mapEnd > -1) {
        let mapContent = vehiculoBlock.substring(mapStart, mapEnd);
        let newVehiculoBlock = vehiculoBlock.substring(0, mapStart) + vehiculoBlock.substring(mapEnd);
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
        console.log("Could not find end of map block");
    }
} else {
    console.log("Could not find start");
}
