import re

with open("src/app/admin/cotizador/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1. Add imports
if "useQuery" not in c:
    c = c.replace('import { useState, useEffect, useRef } from "react"', 
                  'import { useState, useEffect, useRef } from "react";\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";')

# 2. Add QueryClient and replace states
if "const queryClient = useQueryClient();" not in c:
    c = c.replace("export default function AdminCotizador() {\n  const supabase = createClient()", 
                  "export default function AdminCotizador() {\n  const supabase = createClient();\n  const queryClient = useQueryClient();")


# Let's replace the fetches
old_states = """  const [params, setParams] = useState<any>(null)
  const [loadingParams, setLoadingParams] = useState(true)
  const [savingParams, setSavingParams] = useState(false)
  const [mensajeParametros, setMensajeParametros] = useState("")

  const [clientes, setClientes] = useState<any[]>([])
  const [selectedClienteId, setSelectedClienteId] = useState<string>("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [clientFormData, setClientFormData] = useState({
    nombre: '', apellido: '', email: '', telefono: '', password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)"""

new_states = """  const [savingParams, setSavingParams] = useState(false)
  const [mensajeParametros, setMensajeParametros] = useState("")

  const [selectedClienteId, setSelectedClienteId] = useState<string>("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [clientFormData, setClientFormData] = useState({
    nombre: '', apellido: '', email: '', telefono: '', password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
        const c = clientesData?.find(client => client.id === h.cliente_id);
        return {
          ...h,
          clientes: c || { nombre: 'Cliente', apellido: 'No encontrado' }
        };
      });
    }
  });
"""
c = c.replace(old_states, new_states)

# Remove old useEffect and fetch functions
old_fetch_logic = r"const \[historialCotizaciones, setHistorialCotizaciones\] = useState<any\[\]>\(\[\]\)\s*// Cargar par.*?const fetchClientes = async \(\) => \{.*?\}"
c = re.sub(old_fetch_logic, "", c, flags=re.DOTALL)

# Handle mutations
c = c.replace(
    """const handleSaveQuote = async (resultados: any) => {
    if (!selectedClienteId) return alert("Por favor, selecciona o crea un cliente antes de guardar en el historial.")
    setSavingQuote(true)
    
    const payload = {
      cliente_id: selectedClienteId,
      nombre_proyecto: cotizacion.nombreProyecto,
      area_construccion: Number(cotizacion.areaConstruccion) || 0,
      total_consultoria: resultados.totalHonorarios,
      total_obra: resultados.costoObra,
      detalles_json: cotizacion
    }
    
    const { error } = await supabase.from('historial_cotizaciones').insert(payload)
    if (error) {
      alert("Error al guardar: " + error.message)
    } else {
      alert("Cotización guardada exitosamente en el historial.")
      fetchHistorialCotizaciones()
    }
    setSavingQuote(false)
  }""",
    """const handleSaveQuote = async (resultados: any) => {
    if (!selectedClienteId) return alert("Por favor, selecciona o crea un cliente antes de guardar en el historial.")
    setSavingQuote(true)
    
    const payload = {
      cliente_id: selectedClienteId,
      nombre_proyecto: cotizacion.nombreProyecto,
      area_construccion: Number(cotizacion.areaConstruccion) || 0,
      total_consultoria: resultados.totalHonorarios,
      total_obra: resultados.costoObra,
      detalles_json: cotizacion
    }
    
    const { error } = await supabase.from('historial_cotizaciones').insert(payload)
    if (error) {
      alert("Error al guardar: " + error.message)
    } else {
      alert("Cotización guardada exitosamente en el historial.")
      queryClient.invalidateQueries({ queryKey: ['historial_cotizaciones'] });
    }
    setSavingQuote(false)
  }"""
)

c = c.replace(
    """const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await createClientAccount(clientFormData)
    if (res.success) {
      setIsCreateModalOpen(false)
      await fetchClientes()
      // Seleccionar el nuevo (podemos buscarlo por nombre o simplemente resetear el dropdown)
      setClientFormData({nombre: '', apellido: '', email: '', telefono: '', password: ''})
      alert("Cliente creado y vinculado exitosamente.")
    } else {
      alert("Error: " + res.error)
    }
    setIsSubmitting(false)
  }""",
    """const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await createClientAccount(clientFormData)
    if (res.success) {
      setIsCreateModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setClientFormData({nombre: '', apellido: '', email: '', telefono: '', password: ''})
      alert("Cliente creado y vinculado exitosamente.")
    } else {
      alert("Error: " + res.error)
    }
    setIsSubmitting(false)
  }"""
)

with open("src/app/admin/cotizador/page.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
