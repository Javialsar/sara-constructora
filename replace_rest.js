const fs = require('fs');
let text = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');

const regex = /\{cotizacion\.incArquitectura && \([\s\S]*?\{cotizacion\.incMep && \([\s\S]*?<\/div>\s*\)\}/g;

const replacement = `{cotizacion.incArquitectura && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Diseño Arquitectónico Ejecutivo</span>
                      <span>\${resultados?.honorariosArq?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incEstructura && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Diseño Estructural</span>
                      <span>\${resultados?.honorariosEst?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incGeotecnia && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Estudio de Suelos (Geotecnia)</span>
                      <span>\${resultados?.honorariosGeotecnia?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incElectrico && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Diseño Eléctrico</span>
                      <span>\${resultados?.honorariosElec?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incHidrico && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Diseño Hidrosanitario (Hídrico)</span>
                      <span>\${resultados?.honorariosHidro?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incTopografia && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Levantamiento Topográfico Base</span>
                      <span>\${resultados?.honorariosTop?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}`;

text = text.replace(regex, replacement);
fs.writeFileSync('src/app/admin/cotizador/page.tsx', text, 'utf8');
