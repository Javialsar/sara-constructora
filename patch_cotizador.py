import re

with open('src/app/admin/cotizador/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Replace fetchParametros table name
code = re.sub(
    r"supabase\.from\('cotizador_parametros'\)",
    r"supabase.from('parametros_globales')",
    code
)

flatten_logic = """
    if (data) {
      const flatParams = {
        tarifa_diseno_arq_m2: data.cotizador_tarifas.arquitectura_ejecutivo,
        tarifa_diseno_est_m2: data.cotizador_tarifas.diseno_estructural,
        tarifa_geotecnia: data.cotizador_tarifas.estudio_geotecnia,
        tarifa_diseno_elec_m2: data.cotizador_tarifas.diseno_electrico,
        tarifa_diseno_hidro_m2: data.cotizador_tarifas.diseno_hidrico,
        tarifa_topografia_base: data.cotizador_tarifas.topografia,

        costo_base_construccion_m2: data.cotizador_obra_base.costo_construccion_base,
        porcentaje_iva_base: data.cotizador_obra_base.porcentaje_iva,

        factor_acabados_economico: data.cotizador_factores.acabado_economico,
        factor_acabados_estandar: data.cotizador_factores.acabado_estandar,
        factor_acabados_premium: data.cotizador_factores.acabado_premium,
        factor_suelo_normal: data.cotizador_factores.suelo_normal,
        factor_suelo_blando: data.cotizador_factores.suelo_blando,
        factor_suelo_rocoso: 1.05, // fallback
        factor_estructura_hormigon: data.cotizador_factores.estructura_hormigon,
        factor_estructura_metalica: data.cotizador_factores.estructura_metalica,
        factor_pendiente_plana: data.cotizador_factores.pendiente_plana,
        factor_pendiente_media: data.cotizador_factores.pendiente_media,
        factor_pendiente_fuerte: data.cotizador_factores.pendiente_fuerte,

        costo_extra_master: data.cotizador_ensambles.dormitorio_master,
        costo_extra_bano_completo: data.cotizador_ensambles.bano_completo,
        costo_extra_medio_bano: data.cotizador_ensambles.medio_bano,
        costo_extra_lavanderia: data.cotizador_ensambles.lavanderia,
        costo_extra_cisterna: data.cotizador_ensambles.cisterna_subt,
        costo_extra_piscina: data.cotizador_ensambles.piscina_base,
        costo_extra_garaje_descubierto: data.cotizador_ensambles.garaje_descubierto,
        costo_extra_splits: data.cotizador_ensambles.clima_splits,
        
        // Extra fallbacks so it doesn't break
        factor_tipologia_unifamiliar: 1,
        factor_tipologia_multifamiliar: 1.15,
        factor_tipologia_comercial: 1.25,
        factor_tipologia_industrial: 0.85,
        porcentaje_adicional_por_piso: 0.03,
        factor_sotano: 1.4,
        factor_acceso_urbano: 1,
        factor_acceso_rural: 1.08,
        factor_pisos_1: 1.05,
        factor_pisos_2: 1,
        factor_pisos_3: 1.02,
        costo_extra_cocina_isla: 1500,
        costo_ml_cerramiento: 120,
        costo_extra_garaje_cubierto: 3500,
        costo_extra_aire_central: 4500,
      };
      setParams(flatParams);
    }
"""

code = re.sub(
    r"if \(data\) setParams\(data\)",
    flatten_logic.strip(),
    code
)

# Remove the 'parametros' tab button safely using regex
# Look for something like <button ... onClick={() => setActiveTab('parametros')} ...> Parámetros Base </button>
tab_pattern = r'<button[^>]*onClick=\{\(\) => setActiveTab\([\'"]parametros[\'"]\)\}[^>]*>.*?</button>'
code = re.sub(tab_pattern, '', code, flags=re.DOTALL)

# Hide the section: {activeTab === 'parametros' && (
code = code.replace("{activeTab === 'parametros' && (", "{(false) && (")

with open('src/app/admin/cotizador/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Cotizador patched successfully!")
