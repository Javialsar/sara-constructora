with open("src/app/admin/cotizador/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1. Imports
if "useQuery" not in c:
    c = c.replace('import { useState, useEffect, useRef } from "react"', 
                  'import { useState, useEffect, useRef } from "react";\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";')

# 2. QueryClient
c = c.replace('const supabase = createClient()', 'const supabase = createClient();\n  const queryClient = useQueryClient();')

# 3. Replace states
old_states = """  const [params, setParams] = useState<any>(null)
  const [loadingParams, setLoadingParams] = useState(true)
  const [savingParams, setSavingParams] = useState(false)
  const [mensajeParametros, setMensajeParametros] = useState("")

  // Estados de clientes
  const [clientes, setClientes] = useState<any[]>([])"""

new_states = """  const [savingParams, setSavingParams] = useState(false)
  const [mensajeParametros, setMensajeParametros] = useState("")

  // REACT QUERY FETCHES
  const { data: params, isLoading: loadingParams } = useQuery({
    queryKey: ['parametros_globales'],
    queryFn: async () => {
      const { data } = await supabase.from('parametros_globales').select('*').eq('id', 1).single();
      if (!data) return null;
      return {
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
        factor_suelo_rocoso: 1.05, 
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
    }
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
      return data || [];
    }
  });

  const { data: historialCotizaciones = [] } = useQuery({
    queryKey: ['historial_cotizaciones'],
    queryFn: async () => {
      const { data: historialData } = await supabase.from('historial_cotizaciones').select('*').order('created_at', { ascending: false });
      if (!historialData) return [];
      const { data: clientesData } = await supabase.from('clientes').select('id, nombre, apellido');
      return historialData.map(h => {
        const c = clientesData?.find((client:any) => client.id === h.cliente_id);
        return {
          ...h,
          clientes: c || { nombre: 'Cliente', apellido: 'No encontrado' }
        };
      });
    }
  });"""

c = c.replace(old_states, new_states)

# 4. Remove old fetch block securely using indices
start_str = "const [historialCotizaciones, setHistorialCotizaciones] = useState<any[]>([])"
end_str = "if (data) setClientes(data)\n  }"

start_idx = c.find(start_str)
end_idx = c.find(end_str)

if start_idx != -1 and end_idx != -1:
    c = c[:start_idx] + c[end_idx + len(end_str):]
else:
    print("WARNING: fetch block not found perfectly")


# 5. Fix handleCreateClient
c = c.replace(
    """const res = await createClientAccount(clientFormData)
    if (res.success) {
      setIsCreateModalOpen(false)
      await fetchClientes()
      // Seleccionar el nuevo (podemos buscarlo por nombre o simplemente resetear el dropdown)""",
    """const res = await createClientAccount(clientFormData)
    if (res.success) {
      setIsCreateModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      // Seleccionar el nuevo"""
)

# 6. Fix handleSaveQuote
c = c.replace(
    """if (error) {
      alert("Error al guardar: " + error.message)
    } else {
      alert("Cotizacin guardada exitosamente en el historial.")
      fetchHistorialCotizaciones()
    }""",
    """if (error) {
      alert("Error al guardar: " + error.message)
    } else {
      alert("Cotización guardada exitosamente en el historial.")
      queryClient.invalidateQueries({ queryKey: ['historial_cotizaciones'] });
    }"""
)


with open("src/app/admin/cotizador/page.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
