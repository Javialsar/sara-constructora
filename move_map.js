const fs = require('fs');
let c = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');

const mapStartStr = '{/* GEOREFERENCIA MAPA */}';
const mapStartIdx = c.indexOf(mapStartStr);

if (mapStartIdx !== -1) {
    // The map block is roughly between GEOREFERENCIA MAPA and 
    // the end of the location form div. Let's find "</div>\n\n                    </div>\n                  </div>"
    
    // The safest way is to split the content by `{/* GEOREFERENCIA MAPA */}`
    // and then take everything up to `                     </div>\n\n                    </div>`
    
    let endIdx = c.indexOf('</div>\n\n                    </div>', mapStartIdx);
    if (endIdx === -1) {
        endIdx = c.indexOf('</div>\r\n\r\n                    </div>', mapStartIdx);
    }
    
    if (endIdx !== -1) {
        const mapBlock = c.substring(mapStartIdx, endIdx + 6); // include the </div>
        
        // Remove it from current position
        c = c.substring(0, mapStartIdx) + c.substring(endIdx + 6);
        
        // Prepare the new tab
        const tabSincronizacion = `
          {/* TAB: SINCRONIZACION */}
          {activeTab === 'sincronizacion' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[85vh]">
              <h2 className="text-3xl font-black mb-6">Sincronización Fletes (Radar Activo)</h2>
              ${mapBlock.replace(/w-full h-96 rounded-xl/, 'w-full h-full rounded-2xl shadow-xl')}
            </div>
          )}
        `;
        
        c = c.replace("{/* TAB: VEHICULO */}", tabSincronizacion + "\n          {/* TAB: VEHICULO */}");
        fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', c);
    }
}
