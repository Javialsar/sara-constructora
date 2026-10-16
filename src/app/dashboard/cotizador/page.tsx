"use client"
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { 
  Settings, 
  Calculator, 
  Save, 
  FileText, 
  CheckCircle2, 
  Download, 
  UserPlus, 
  X, 
  Cpu, 
  Sparkles, 
  FileSpreadsheet, 
  Building2, 
  MapPin, 
  ShieldAlert, 
  ArrowRight, 
  Check, 
  Layers, 
  FileCheck2, 
  HelpCircle,
  TrendingUp,
  Landmark,
  Flame,
  Waves,
  UtensilsCrossed,
  Briefcase,
  Tv,
  Home,
  CheckCircle,
  Truck,
  HardHat,
  ShoppingBag,
  Gift,
  Tag,
  Percent,
  RotateCcw,
  Eye,
  Edit3,
  Trash2,
  PieChart,
  Info
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { membreteBase64 } from "@/lib/membreteBase64";
import { createClientAccount } from "@/app/admin/clientes/actions";
import AsyncSelect from "@/components/ui/AsyncSelect";
import { useProject } from "@/contexts/ProjectContext";
import CotizadorAgentNetworkModal from "@/components/cotizador/CotizadorAgentNetworkModal";
import { syncAllInsumosForPresupuesto } from "@/lib/apuRecipeGenerator";

// 24 Provincias y principales cantones del Ecuador
const PROVINCIAS_CANTONES: Record<string, string[]> = {
  "Pichincha": ["Quito", "Rumiñahui", "Mejía", "Cayambe", "Pedro Moncayo", "San Miguel de los Bancos", "Puerto Quito", "Pedro Vicente Maldonado"],
  "Guayas": ["Guayaquil", "Samborondón", "Daule", "Durán", "Milagro", "Salitre", "Playas", "Balao", "El Empalme", "Naranjal", "Pedro Carbo"],
  "Azuay": ["Cuenca", "Gualaceo", "Paute", "Santa Isabel", "Sigsig", "Chordeleg", "Girón", "San Fernando", "Nabón"],
  "Loja": ["Loja", "Catamayo", "Saraguro", "Calvas", "Macará", "Paltas", "Puyango", "Celica", "Gonzanamá", "Zapotillo", "Chaguarpamba", "Espíndola", "Pindal", "Quilanga", "Sozoranga", "Olmedo"],
  "Manabí": ["Manta", "Portoviejo", "Chone", "Montecristi", "Jipijapa", "Sucre (Bahía)", "Pedernales", "El Carmen", "Tosagua", "Rocafuerte", "Calceta"],
  "El Oro": ["Machala", "Pasaje", "Santa Rosa", "Arenillas", "Huaquillas", "Piñas", "Zaruma", "Atahualpa", "Portovelo"],
  "Tungurahua": ["Ambato", "Baños", "Pelileo", "Píllaro", "Cevallos", "Mocha", "Patate", "Quero", "Tisaleo"],
  "Chimborazo": ["Riobamba", "Guano", "Alausí", "Colta", "Chambo", "Pallatanga", "Guamote", "Cumandá"],
  "Imbabura": ["Ibarra", "Otavalo", "Cotacachi", "Antonio Ante", "Pimampiro", "Urcuquí"],
  "Santo Domingo": ["Santo Domingo", "La Concordia"],
  "Cotopaxi": ["Latacunga", "Pujilí", "Salcedo", "Saquisilí", "La Maná", "Pangua", "Sigchos"],
  "Cañar": ["Azogues", "La Troncal", "Cañar", "Biblián", "El Tambo", "Déleg", "Suscal"],
  "Esmeraldas": ["Esmeraldas", "Atacames", "Quinindé", "San Lorenzo", "Muisne", "Rioverde", "Eloy Alfaro"],
  "Los Ríos": ["Babahoyo", "Quevedo", "Vinces", "Ventanas", "Buena Fe", "Montalvo", "Valencia"],
  "Carchi": ["Tulcán", "Montúfar", "Espejo", "Mira", "Bolívar", "San Pedro de Huaca"],
  "Bolívar": ["Guaranda", "San Miguel", "Chimbo", "Caluma", "Echeandía", "Chillanes", "Las Naves"],
  "Pastaza": ["Puyo", "Mera", "Santa Clara", "Arajuno"],
  "Morona Santiago": ["Macas", "Gualaquiza", "Sucúa", "Limón Indanza", "Méndez", "Palora"],
  "Napo": ["Tena", "Archidona", "El Chaco", "Quijos", "Carlos Julio Arosemena Tola"],
  "Zamora Chinchipe": ["Zamora", "Yantzaza", "El Pangui", "Centinela del Cóndor", "Chinchipe", "Nangaritza"],
  "Sucumbíos": ["Nueva Loja (Lago Agrio)", "Shushufindi", "Cuyabeno", "Putumayo", "Cascales", "Gonzalo Pizarro"],
  "Orellana": ["Francisco de Orellana (Coca)", "La Joya de los Sachas", "Loreto", "Aguarico"],
  "Santa Elena": ["Santa Elena", "La Libertad", "Salinas"],
  "Galápagos": ["Puerto Baquerizo Moreno", "Puerto Ayora (Santa Cruz)", "Puerto Villamil (Isabela)"]
};

// Matriz de calibración paramétrica por Provincia (Red de Agentes SARA)
interface ProvinciaCalibracion {
  factorMateriales: number;
  factorDisenoArq: number;
  factorDisenoEst: number;
  zonaSismicaNEC: string;
  baseAprobacionGAD: number;
  tasaPorM2GAD: number;
  nombreGAD: string;
}

const CALIBRACION_PROVINCIAS: Record<string, ProvinciaCalibracion> = {
  "Pichincha": { factorMateriales: 1.00, factorDisenoArq: 15.00, factorDisenoEst: 8.50, zonaSismicaNEC: "Zona V (PGA 0.40g - Alta)", baseAprobacionGAD: 420, tasaPorM2GAD: 2.20, nombreGAD: "GAD Metropolitano de Quito" },
  "Guayas": { factorMateriales: 1.00, factorDisenoArq: 15.00, factorDisenoEst: 9.00, zonaSismicaNEC: "Zona V (PGA 0.40g - Alta)", baseAprobacionGAD: 450, tasaPorM2GAD: 2.40, nombreGAD: "GAD Municipal de Guayaquil" },
  "Azuay": { factorMateriales: 1.03, factorDisenoArq: 14.50, factorDisenoEst: 8.00, zonaSismicaNEC: "Zona III (PGA 0.25g - Moderada)", baseAprobacionGAD: 380, tasaPorM2GAD: 2.00, nombreGAD: "GAD Municipal de Cuenca" },
  "Loja": { factorMateriales: 1.04, factorDisenoArq: 13.00, factorDisenoEst: 8.00, zonaSismicaNEC: "Zona III (PGA 0.25g - Moderada)", baseAprobacionGAD: 320, tasaPorM2GAD: 1.60, nombreGAD: "GAD Municipal de Loja" },
  "Manabí": { factorMateriales: 1.04, factorDisenoArq: 13.50, factorDisenoEst: 10.00, zonaSismicaNEC: "Zona VI (PGA 0.50g - Muy Alta / Subducción)", baseAprobacionGAD: 340, tasaPorM2GAD: 1.80, nombreGAD: "GAD Municipal de Portoviejo / Manta" },
  "El Oro": { factorMateriales: 1.03, factorDisenoArq: 13.00, factorDisenoEst: 8.50, zonaSismicaNEC: "Zona IV (PGA 0.35g - Alta)", baseAprobacionGAD: 310, tasaPorM2GAD: 1.60, nombreGAD: "GAD Municipal de Machala" },
  "Tungurahua": { factorMateriales: 1.02, factorDisenoArq: 13.50, factorDisenoEst: 8.50, zonaSismicaNEC: "Zona V (PGA 0.40g - Alta)", baseAprobacionGAD: 330, tasaPorM2GAD: 1.70, nombreGAD: "GAD Municipal de Ambato" },
  "Chimborazo": { factorMateriales: 1.02, factorDisenoArq: 13.00, factorDisenoEst: 8.00, zonaSismicaNEC: "Zona IV (PGA 0.30g - Alta)", baseAprobacionGAD: 300, tasaPorM2GAD: 1.50, nombreGAD: "GAD Municipal de Riobamba" },
  "Imbabura": { factorMateriales: 1.02, factorDisenoArq: 13.00, factorDisenoEst: 8.50, zonaSismicaNEC: "Zona V (PGA 0.40g - Alta)", baseAprobacionGAD: 310, tasaPorM2GAD: 1.60, nombreGAD: "GAD Municipal de Ibarra" },
  "Santo Domingo": { factorMateriales: 1.03, factorDisenoArq: 13.00, factorDisenoEst: 8.50, zonaSismicaNEC: "Zona V (PGA 0.40g - Alta)", baseAprobacionGAD: 320, tasaPorM2GAD: 1.70, nombreGAD: "GAD Municipal de Santo Domingo" },
  "Cotopaxi": { factorMateriales: 1.02, factorDisenoArq: 12.50, factorDisenoEst: 8.50, zonaSismicaNEC: "Zona V (PGA 0.40g - Alta)", baseAprobacionGAD: 290, tasaPorM2GAD: 1.50, nombreGAD: "GAD Municipal de Latacunga" },
  "Cañar": { factorMateriales: 1.03, factorDisenoArq: 12.50, factorDisenoEst: 8.00, zonaSismicaNEC: "Zona III (PGA 0.25g - Moderada)", baseAprobacionGAD: 280, tasaPorM2GAD: 1.40, nombreGAD: "GAD Municipal de Azogues" },
  "Esmeraldas": { factorMateriales: 1.06, factorDisenoArq: 13.50, factorDisenoEst: 10.00, zonaSismicaNEC: "Zona VI (PGA 0.50g - Muy Alta / Costa)", baseAprobacionGAD: 310, tasaPorM2GAD: 1.60, nombreGAD: "GAD Municipal de Esmeraldas" },
  "Los Ríos": { factorMateriales: 1.03, factorDisenoArq: 12.50, factorDisenoEst: 8.50, zonaSismicaNEC: "Zona IV (PGA 0.35g - Alta)", baseAprobacionGAD: 290, tasaPorM2GAD: 1.50, nombreGAD: "GAD Municipal de Babahoyo / Quevedo" },
  "Carchi": { factorMateriales: 1.05, factorDisenoArq: 12.50, factorDisenoEst: 8.00, zonaSismicaNEC: "Zona IV (PGA 0.35g - Alta)", baseAprobacionGAD: 280, tasaPorM2GAD: 1.40, nombreGAD: "GAD Municipal de Tulcán" },
  "Bolívar": { factorMateriales: 1.05, factorDisenoArq: 12.00, factorDisenoEst: 8.00, zonaSismicaNEC: "Zona IV (PGA 0.30g - Alta)", baseAprobacionGAD: 260, tasaPorM2GAD: 1.30, nombreGAD: "GAD Municipal de Guaranda" },
  "Pastaza": { factorMateriales: 1.12, factorDisenoArq: 14.00, factorDisenoEst: 7.50, zonaSismicaNEC: "Zona II (PGA 0.15g - Intermedia)", baseAprobacionGAD: 270, tasaPorM2GAD: 1.30, nombreGAD: "GAD Municipal de Puyo" },
  "Morona Santiago": { factorMateriales: 1.13, factorDisenoArq: 14.00, factorDisenoEst: 7.50, zonaSismicaNEC: "Zona II (PGA 0.15g - Intermedia)", baseAprobacionGAD: 270, tasaPorM2GAD: 1.30, nombreGAD: "GAD Municipal de Macas" },
  "Napo": { factorMateriales: 1.12, factorDisenoArq: 14.00, factorDisenoEst: 7.50, zonaSismicaNEC: "Zona II (PGA 0.15g - Intermedia)", baseAprobacionGAD: 270, tasaPorM2GAD: 1.30, nombreGAD: "GAD Municipal de Tena" },
  "Zamora Chinchipe": { factorMateriales: 1.14, factorDisenoArq: 14.00, factorDisenoEst: 7.50, zonaSismicaNEC: "Zona II (PGA 0.15g - Intermedia)", baseAprobacionGAD: 280, tasaPorM2GAD: 1.35, nombreGAD: "GAD Municipal de Zamora" },
  "Sucumbíos": { factorMateriales: 1.13, factorDisenoArq: 14.00, factorDisenoEst: 7.50, zonaSismicaNEC: "Zona II (PGA 0.15g - Intermedia)", baseAprobacionGAD: 280, tasaPorM2GAD: 1.35, nombreGAD: "GAD Municipal de Lago Agrio" },
  "Orellana": { factorMateriales: 1.14, factorDisenoArq: 14.00, factorDisenoEst: 7.50, zonaSismicaNEC: "Zona II (PGA 0.15g - Intermedia)", baseAprobacionGAD: 280, tasaPorM2GAD: 1.35, nombreGAD: "GAD Municipal de Fco. de Orellana" },
  "Santa Elena": { factorMateriales: 1.05, factorDisenoArq: 13.50, factorDisenoEst: 9.50, zonaSismicaNEC: "Zona V (PGA 0.40g - Alta)", baseAprobacionGAD: 320, tasaPorM2GAD: 1.70, nombreGAD: "GAD Municipal de Santa Elena / Salinas" },
  "Galápagos": { factorMateriales: 1.38, factorDisenoArq: 18.00, factorDisenoEst: 11.00, zonaSismicaNEC: "Zona Insular (PGA 0.30g / Logística Especial)", baseAprobacionGAD: 650, tasaPorM2GAD: 3.20, nombreGAD: "Consejo de Gobierno / GAD Galápagos" }
};

const CLAUSULA_LEGAL_SALVEDAD = "NOTA LEGAL Y SALVEDAD COMERCIAL: El presente presupuesto es una estimación referencial preliminar de prefactibilidad técnico-económica basada en parámetros estándar y memoria estadística histórica de Grupo SARA. El presupuesto definitivo y vinculante estará sujeto a la realización de los estudios geotécnicos definitivos de suelo, aprobación de planos arquitectónicos y estructurales por el GAD Municipal competente, especificaciones finales de acabados y fluctuación de precios de mercado de materiales y mano de obra a la fecha de suscripción del contrato de obra.";

export default function CotizadorPage() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { createProject, setActiveProject, projects } = useProject();

  const [activeTab, setActiveTab] = useState<'generar' | 'parametros' | 'historial'>('generar');
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isConvertingToApu, setIsConvertingToApu] = useState(false);

  // Parámetros Globales
  const setParams = (updater: any) => {
    queryClient.setQueryData(['parametros_globales'], (old: any) => {
      if (typeof updater === 'function') return updater(old);
      return updater;
    });
  };

  const [savingParams, setSavingParams] = useState(false);
  const [mensajeParametros, setMensajeParametros] = useState("");

  const { data: params, isLoading: loadingParams } = useQuery({
    queryKey: ['parametros_globales'],
    queryFn: async () => {
      const { data } = await supabase.from('parametros_globales').select('*').eq('id', 1).single();
      if (!data) return null;
      return {
        tarifa_diseno_arq_m2: data.cotizador_tarifas?.arquitectura_ejecutivo || 14,
        tarifa_diseno_est_m2: data.cotizador_tarifas?.diseno_estructural || 8.5,
        tarifa_geotecnia: data.cotizador_tarifas?.estudio_geotecnia || 850,
        tarifa_diseno_elec_m2: data.cotizador_tarifas?.diseno_electrico || 3.5,
        tarifa_diseno_hidro_m2: data.cotizador_tarifas?.diseno_hidrico || 3.5,
        tarifa_topografia_base: data.cotizador_tarifas?.topografia || 380,

        costo_base_construccion_m2: data.cotizador_obra_base?.costo_construccion_base || 450,
        porcentaje_iva_base: data.cotizador_obra_base?.porcentaje_iva || 15,

        factor_acabados_economico: data.cotizador_factores?.acabado_economico || 0.85,
        factor_acabados_estandar: data.cotizador_factores?.acabado_estandar || 1.0,
        factor_acabados_premium: data.cotizador_factores?.acabado_premium || 1.35,
        factor_suelo_normal: data.cotizador_factores?.suelo_normal || 1.0,
        factor_suelo_blando: data.cotizador_factores?.suelo_blando || 1.15,
        factor_suelo_rocoso: 1.05, 
        factor_estructura_hormigon: data.cotizador_factores?.estructura_hormigon || 1.0,
        factor_estructura_metalica: data.cotizador_factores?.estructura_metalica || 1.15,
        factor_pendiente_plana: data.cotizador_factores?.pendiente_plana || 1.0,
        factor_pendiente_media: data.cotizador_factores?.pendiente_media || 1.08,
        factor_pendiente_fuerte: data.cotizador_factores?.pendiente_fuerte || 1.18,

        costo_extra_master: data.cotizador_ensambles?.dormitorio_master || 800,
        costo_extra_bano_completo: data.cotizador_ensambles?.bano_completo || 1500,
        costo_extra_medio_bano: data.cotizador_ensambles?.medio_bano || 800,
        costo_extra_lavanderia: data.cotizador_ensambles?.lavanderia || 600,
        costo_extra_cisterna: data.cotizador_ensambles?.cisterna_subt || 2500,
        costo_extra_piscina: data.cotizador_ensambles?.piscina_base || 12000,
        costo_extra_garaje_descubierto: data.cotizador_ensambles?.garaje_descubierto || 800,
        costo_extra_splits: data.cotizador_ensambles?.clima_splits || 1200,
        
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

  const { data: historialCotizaciones = [] } = useQuery({
    queryKey: ['historial_cotizaciones'],
    queryFn: async () => {
      const { data: historialData } = await supabase.from('historial_cotizaciones').select('*').order('created_at', { ascending: false });
      if (!historialData) return [];
      const { data: clientesData } = await supabase.from('clientes').select('id, nombre, apellido');
      return historialData.map(h => {
        const c = clientesData?.find((client: any) => client.id === h.cliente_id);
        return {
          ...h,
          clientes: c || { nombre: 'Cliente', apellido: 'No encontrado' }
        };
      });
    }
  });

  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: ""
  });

  // Estado para la cotización actual
  const [cotizacion, setCotizacion] = useState({
    nombreCliente: '',
    nombreProyecto: '',
    provincia: 'Pichincha',
    canton: 'Quito',
    areaConstruccion: '120',
    // FASE 1: Terreno y Estructura
    pendiente: 'plana', 
    suelo: 'normal',
    accesibilidad: 'urbana',
    pisos: '2',
    estructura: 'hormigon', // 'hormigon' | 'metalica' | 'mixta' | 'mamposteria' | 'steel_framing' | 'madera_tratada'
    // FASE 2: Arquitectura y Distribución
    acabados: 'estandar', 
    cuartosMaster: 1,
    cuartosNormales: 2,
    banosCompletos: 2,
    mediosBanos: 1,
    lavanderia: true,
    salaComedor: 'abierta', // 'estandar' | 'abierta' | 'doble_altura'
    cocina: 'abierta', // 'cerrada' | 'abierta' | 'gourmet'
    estudio: false,
    salaTv: false,
    // FASE 3: Wellness, Recreación y Exteriores
    zonaBbq: true,
    jacuzzi: false,
    piscina: false,
    terrazaRooftop: false,
    cerramientoMl: 30,
    cisterna: true,
    garaje: 'descubierto', // 'ninguno' | 'descubierto' | 'cubierto'
    climatizacion: 'splits', // 'ninguna' | 'splits' | 'central'
    
    // Módulo 1 (Consultoría & Trámites Municipales)
    incArquitectura: true,
    incEstructura: true,
    incAprobacionPlanos: true,
    incGeotecnia: true,
    incElectrico: true,
    incHidrico: true,
    incTopografia: true,
  });

  // Estado para Descuentos Comerciales y Bonificaciones Editables en Módulo 1
  const [descuentosModulo1, setDescuentosModulo1] = useState<{
    arq: number | null;
    est: number | null;
    aprobacion: number | null;
    elec: number | null;
    hidro: number | null;
    geotecnia: number | null;
    topografia: number | null;
  }>({
    arq: null,
    est: null,
    aprobacion: null,
    elec: null,
    hidro: null,
    geotecnia: null,
    topografia: null
  });

  // Configuración de Indirectos AIU (Administración, Imprevistos, Utilidad)
  // Calibrado por los Agentes de Conocimiento SARA con estándares de construcción de Ecuador
  const [aiuConfig, setAiuConfig] = useState({
    porcentajeAdmin: 8.0,
    porcentajeImprevistos: 3.0,
    porcentajeUtilidad: 9.0
  });

  // Modal para ver el detalle de una cotización del historial
  const [detalleModalCotizacion, setDetalleModalCotizacion] = useState<any | null>(null);
  const [showAiuEditor, setShowAiuEditor] = useState(false);

  const [savingQuote, setSavingQuote] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Manejador de cambio de provincia
  const handleProvinciaChange = (nuevaProv: string) => {
    const cantonesDisponibles = PROVINCIAS_CANTONES[nuevaProv] || ["Capital Provincial"];
    setCotizacion(prev => ({
      ...prev,
      provincia: nuevaProv,
      canton: cantonesDisponibles[0] || ""
    }));
  };

  // Cálculos en tiempo real con Calibración Agéntica y Descuentos Comerciales
  const calcularCostos = () => {
    if (!params) return null;

    const areaValue = Math.max(0, Number(cotizacion.areaConstruccion) || 0);
    const calib = CALIBRACION_PROVINCIAS[cotizacion.provincia] || CALIBRACION_PROVINCIAS["Pichincha"];

    // Factor Pendiente
    let fPendiente = params.factor_pendiente_plana;
    if (cotizacion.pendiente === 'media') fPendiente = params.factor_pendiente_media;
    if (cotizacion.pendiente === 'fuerte') fPendiente = params.factor_pendiente_fuerte;

    // Factor Acabados
    let fAcabados = params.factor_acabados_estandar || 1;
    if (cotizacion.acabados === 'economico') fAcabados = params.factor_acabados_economico || 0.85;
    if (cotizacion.acabados === 'premium') fAcabados = params.factor_acabados_premium || 1.35;

    // Factor Suelo
    let fSuelo = params.factor_suelo_normal || 1;
    if (cotizacion.suelo === 'blando') fSuelo = params.factor_suelo_blando || 1.15;
    if (cotizacion.suelo === 'rocoso') fSuelo = params.factor_suelo_rocoso || 1.05;

    // Factor Accesibilidad
    let fAcceso = params.factor_acceso_urbano || 1;
    if (cotizacion.accesibilidad === 'rural') fAcceso = params.factor_acceso_rural || 1.08;

    // Factor Pisos
    let fPisos = params.factor_pisos_2 || 1;
    if (cotizacion.pisos === '1') fPisos = params.factor_pisos_1 || 1.05;
    if (cotizacion.pisos === '3_mas') fPisos = params.factor_pisos_3 || 1.02;

    // Factor Estructura (Sistemas estructurales ampliados)
    let fEstructura = 1.0;
    if (cotizacion.estructura === 'metalica') fEstructura = 1.15;
    else if (cotizacion.estructura === 'mixta') fEstructura = 1.08;
    else if (cotizacion.estructura === 'mamposteria') fEstructura = 0.92;
    else if (cotizacion.estructura === 'steel_framing') fEstructura = 1.05;
    else if (cotizacion.estructura === 'madera_tratada') fEstructura = 1.12;
    else fEstructura = params.factor_estructura_hormigon || 1.0;

    // Factor Regional de Materiales / Logística (Calibrado por SARA-Fletes y SARA-Marketplace)
    const fRegional = calib.factorMateriales;

    // Costo Base Paramétrico de Obra
    const costoObraBase = areaValue * (params.costo_base_construccion_m2 || 450) * fPendiente * fAcabados * fSuelo * fAcceso * fPisos * fEstructura * fRegional;

    // Costos Aditivos (Distribución Arquitectónica, Wellness y Exteriores)
    let costoExtras = 0;
    
    // Habitaciones y Baños
    costoExtras += (Number(cotizacion.cuartosMaster) || 0) * (params.costo_extra_master || 800);
    costoExtras += (Number(cotizacion.banosCompletos) || 0) * (params.costo_extra_bano_completo || 1500);
    costoExtras += (Number(cotizacion.mediosBanos) || 0) * (params.costo_extra_medio_bano || 800);
    if (cotizacion.lavanderia) costoExtras += (params.costo_extra_lavanderia || 600);

    // Sala y Comedor
    if (cotizacion.salaComedor === 'doble_altura') costoExtras += 2500;

    // Cocina
    if (cotizacion.cocina === 'abierta') costoExtras += (params.costo_extra_cocina_isla || 1500);
    else if (cotizacion.cocina === 'gourmet') costoExtras += 3200;

    // Estudio y Sala de TV
    if (cotizacion.estudio) costoExtras += 600;
    if (cotizacion.salaTv) costoExtras += 700;

    // Wellness & Recreación
    if (cotizacion.zonaBbq) costoExtras += 2800;
    if (cotizacion.jacuzzi) costoExtras += 4200;
    if (cotizacion.piscina) costoExtras += (params.costo_extra_piscina || 12000);
    if (cotizacion.terrazaRooftop) costoExtras += 1800;

    // Exteriores Básicos
    costoExtras += (Number(cotizacion.cerramientoMl) || 0) * (params.costo_ml_cerramiento || 120);
    if (cotizacion.cisterna) costoExtras += (params.costo_extra_cisterna || 2500);
    if (cotizacion.garaje === 'cubierto') costoExtras += (params.costo_extra_garaje_cubierto || 3500);
    if (cotizacion.garaje === 'descubierto') costoExtras += (params.costo_extra_garaje_descubierto || 800);
    if (cotizacion.climatizacion === 'splits') costoExtras += (params.costo_extra_splits || 1200);
    if (cotizacion.climatizacion === 'central') costoExtras += (params.costo_extra_aire_central || 4500);

    // Costo Directo de Obra (Materiales, Mano de Obra, Equipos y Maquinaria)
    const costoObraDirecto = costoObraBase + costoExtras;

    // Costos Indirectos y Margen de Utilidad (AIU) - Estándar Ecuador
    const pctAdmin = Number(aiuConfig.porcentajeAdmin) || 0;
    const pctImprev = Number(aiuConfig.porcentajeImprevistos) || 0;
    const pctUtil = Number(aiuConfig.porcentajeUtilidad) || 0;
    const pctAiuTotal = pctAdmin + pctImprev + pctUtil;

    const montoAdmin = costoObraDirecto * (pctAdmin / 100);
    const montoImprevistos = costoObraDirecto * (pctImprev / 100);
    const montoUtilidad = costoObraDirecto * (pctUtil / 100);
    const montoAiuTotal = montoAdmin + montoImprevistos + montoUtilidad;

    // Costo de Obra Completo (Costo Directo + AIU)
    const costoObra = costoObraDirecto + montoAiuTotal;
    const desgloseObra = { 
      base: costoObraBase, 
      extras: costoExtras,
      directo: costoObraDirecto,
      montoAdmin,
      montoImprevistos,
      montoUtilidad,
      montoAiuTotal,
      pctAdmin,
      pctImprev,
      pctUtil,
      pctAiuTotal
    };

    // Módulo 1: Consultoría & Aprobación Municipal (Calibrado con IA + Descuentos Comerciales)
    const tarifaArqM2 = calib.factorDisenoArq;
    const tarifaEstM2 = calib.factorDisenoEst;

    // Valores de Lista / Referenciales
    const honorariosArqRef = cotizacion.incArquitectura ? areaValue * tarifaArqM2 : 0;
    const honorariosEstRef = cotizacion.incEstructura ? areaValue * tarifaEstM2 : 0;
    const honorariosAprobacionRef = cotizacion.incAprobacionPlanos ? Math.round(calib.baseAprobacionGAD + (areaValue * calib.tasaPorM2GAD)) : 0;
    const honorariosGeotecniaRef = cotizacion.incGeotecnia ? (params.tarifa_geotecnia || 850) : 0;
    const honorariosElecRef = cotizacion.incElectrico ? areaValue * (params.tarifa_diseno_elec_m2 || 3.5) : 0;
    const honorariosHidroRef = cotizacion.incHidrico ? areaValue * (params.tarifa_diseno_hidro_m2 || 3.5) : 0;
    const honorariosTopRef = cotizacion.incTopografia ? (params.tarifa_topografia_base || 380) : 0;

    const totalHonorariosRef = honorariosArqRef + honorariosEstRef + honorariosAprobacionRef + honorariosGeotecniaRef + honorariosElecRef + honorariosHidroRef + honorariosTopRef;

    // Valores Finales con Descuento / Bonificación Aplicada
    const honorariosArq = cotizacion.incArquitectura ? (descuentosModulo1.arq !== null ? descuentosModulo1.arq : honorariosArqRef) : 0;
    const honorariosEst = cotizacion.incEstructura ? (descuentosModulo1.est !== null ? descuentosModulo1.est : honorariosEstRef) : 0;
    const honorariosAprobacion = cotizacion.incAprobacionPlanos ? (descuentosModulo1.aprobacion !== null ? descuentosModulo1.aprobacion : honorariosAprobacionRef) : 0;
    const honorariosGeotecnia = cotizacion.incGeotecnia ? (descuentosModulo1.geotecnia !== null ? descuentosModulo1.geotecnia : honorariosGeotecniaRef) : 0;
    const honorariosElec = cotizacion.incElectrico ? (descuentosModulo1.elec !== null ? descuentosModulo1.elec : honorariosElecRef) : 0;
    const honorariosHidro = cotizacion.incHidrico ? (descuentosModulo1.hidro !== null ? descuentosModulo1.hidro : honorariosHidroRef) : 0;
    const honorariosTop = cotizacion.incTopografia ? (descuentosModulo1.topografia !== null ? descuentosModulo1.topografia : honorariosTopRef) : 0;

    const totalHonorarios = honorariosArq + honorariosEst + honorariosAprobacion + honorariosGeotecnia + honorariosElec + honorariosHidro + honorariosTop;
    const totalAhorroConsultoria = Math.max(0, totalHonorariosRef - totalHonorarios);

    const subtotalGeneral = totalHonorarios + costoObra;
    const ivaEstimado = subtotalGeneral * ((params.porcentaje_iva_base || 15) / 100);
    const granTotalConIva = subtotalGeneral + ivaEstimado;

    return {
      costoObra,
      costoObraDirecto,
      montoAdmin,
      montoImprevistos,
      montoUtilidad,
      montoAiuTotal,
      pctAdmin,
      pctImprev,
      pctUtil,
      pctAiuTotal,
      desgloseObra,
      fEstructura,
      tarifaArqM2,
      tarifaEstM2,
      fRegional,
      calib,
      honorariosArqRef,
      honorariosEstRef,
      honorariosAprobacionRef,
      honorariosGeotecniaRef,
      honorariosElecRef,
      honorariosHidroRef,
      honorariosTopRef,
      totalHonorariosRef,
      honorariosArq,
      honorariosEst,
      honorariosAprobacion,
      honorariosGeotecnia,
      honorariosElec,
      honorariosHidro,
      honorariosTop,
      totalHonorarios,
      totalAhorroConsultoria,
      subtotalGeneral,
      ivaEstimado,
      granTotalConIva
    };
  };

  const resultados = calcularCostos();

  // Etiqueta legible del sistema estructural
  const getEstructuraLabel = (key: string) => {
    switch (key) {
      case 'hormigon': return 'Hormigón Armado Sismo-Resistente (Pórticos y Vigas - NEC)';
      case 'metalica': return 'Estructura Metálica Dúctil con Losa Steel Deck (+15%)';
      case 'mixta': return 'Estructura Mixta (Columnas H.A. + Vigas Metálicas) (+8%)';
      case 'mamposteria': return 'Mampostería Confinada / Bloque Estructural (-8%)';
      case 'steel_framing': return 'Steel Framing / Perfiles Galvanizados Livianos (+5%)';
      case 'madera_tratada': return 'Madera Estructural Tratada / Timber Frame (+12%)';
      default: return 'Hormigón Armado';
    }
  };

  // Funciones de Descuento Rápido en Módulo 1
  const bonificarDisenoTotal = () => {
    setDescuentosModulo1(prev => ({
      ...prev,
      arq: 0,
      est: 0
    }));
  };

  const aplicarDescuentoItem = (itemKey: keyof typeof descuentosModulo1, pct: number, valorRef: number) => {
    const conDescuento = Math.round(valorRef * (1 - pct / 100));
    setDescuentosModulo1(prev => ({ ...prev, [itemKey]: conDescuento }));
  };

  const restaurarTarifasModulo1 = () => {
    setDescuentosModulo1({
      arq: null,
      est: null,
      aprobacion: null,
      elec: null,
      hidro: null,
      geotecnia: null,
      topografia: null
    });
  };

  // Cargar una cotización del historial de vuelta al Cotizador Paramétrico
  const handleCargarCotizacionEnCotizador = (c: any) => {
    const det = c.detalles_json || {};
    
    // Restaurar parámetros generales y de obra
    setCotizacion({
      nombreCliente: c.clientes ? `${c.clientes.nombre} ${c.clientes.apellido}`.trim() : (det.nombreCliente || ''),
      nombreProyecto: c.nombre_proyecto || det.nombreProyecto || '',
      provincia: det.provincia || 'Pichincha',
      canton: det.canton || 'Quito',
      areaConstruccion: String(c.area_construccion || det.areaConstruccion || '120'),
      pendiente: det.pendiente || 'plana',
      suelo: det.suelo || 'normal',
      accesibilidad: det.accesibilidad || 'urbana',
      pisos: det.pisos || '2',
      estructura: det.estructura || 'hormigon',
      acabados: det.acabados || 'estandar',
      cuartosMaster: det.cuartosMaster ?? 1,
      cuartosNormales: det.cuartosNormales ?? 2,
      banosCompletos: det.banosCompletos ?? 2,
      mediosBanos: det.mediosBanos ?? 1,
      lavanderia: det.lavanderia ?? true,
      salaComedor: det.salaComedor || 'abierta',
      cocina: det.cocina || 'abierta',
      estudio: det.estudio ?? false,
      salaTv: det.salaTv ?? false,
      zonaBbq: det.zonaBbq ?? true,
      jacuzzi: det.jacuzzi ?? false,
      piscina: det.piscina ?? false,
      terrazaRooftop: det.terrazaRooftop ?? false,
      cerramientoMl: det.cerramientoMl ?? 30,
      cisterna: det.cisterna ?? true,
      garaje: det.garaje || 'descubierto',
      climatizacion: det.climatizacion || 'splits',
      incArquitectura: det.incArquitectura ?? true,
      incEstructura: det.incEstructura ?? true,
      incAprobacionPlanos: det.incAprobacionPlanos ?? true,
      incGeotecnia: det.incGeotecnia ?? true,
      incElectrico: det.incElectrico ?? true,
      incHidrico: det.incHidrico ?? true,
      incTopografia: det.incTopografia ?? true,
    });

    // Restaurar descuentos comerciales si existían
    if (det.descuentos_modulo1) {
      setDescuentosModulo1(det.descuentos_modulo1);
    } else {
      restaurarTarifasModulo1();
    }

    // Restaurar configuración AIU si existía
    if (det.aiu_config) {
      setAiuConfig(det.aiu_config);
    }

    // Vincular cliente si existe
    if (c.cliente_id) {
      setSelectedClienteId(c.cliente_id);
    }

    setDetalleModalCotizacion(null);
    setActiveTab('generar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Eliminar cotización del historial
  const handleEliminarCotizacion = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la cotización "${nombre || 'Sin título'}" del historial? Esta acción no se puede deshacer.`)) {
      return;
    }
    const { error } = await supabase.from('historial_cotizaciones').delete().eq('id', id);
    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      if (detalleModalCotizacion?.id === id) {
        setDetalleModalCotizacion(null);
      }
      queryClient.invalidateQueries({ queryKey: ['historial_cotizaciones'] });
    }
  };

  // Exportar a PDF Oficial con Membrete y Desglose de Descuentos
  const handleExportPDF = () => {
    if (!resultados) return;
    const doc = new jsPDF('portrait');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Membrete Oficial centrado
    doc.addImage(membreteBase64, 'PNG', (pageWidth - 110) / 2, 5, 110, 32);

    // Título Principal
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("COTIZACIÓN ESTIMADA DE PROYECTO (PRESUPUESTO REFERENCIAL)", pageWidth / 2, 43, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);

    doc.text(`Cliente: ${cotizacion.nombreCliente || "No especificado"}`, 14, 52);
    doc.text(`Proyecto: ${cotizacion.nombreProyecto || "Residencia Unifamiliar"}`, 14, 57);
    doc.text(`Ubicación: ${cotizacion.canton}, Provincia de ${cotizacion.provincia} (${resultados.calib.nombreGAD})`, 14, 62);
    doc.text(`Área de Construcción: ${cotizacion.areaConstruccion} m²`, 14, 67);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}`, 14, 72);

    // Tabla de Parámetros del Proyecto
    const projectParams = [
      [{ content: 'CONDICIONANTES DEL SITIO Y SISTEMA ESTRUCTURAL', colSpan: 2, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
      ["Provincia y Cantón", `${cotizacion.provincia} - Cantón ${cotizacion.canton}`],
      ["Norma Sísmica NEC-SE-DS", resultados.calib.zonaSismicaNEC],
      ["Sistema Estructural", getEstructuraLabel(cotizacion.estructura)],
      ["Topografía", cotizacion.pendiente === 'plana' ? 'Plana (<5%)' : cotizacion.pendiente === 'media' ? 'Media (5%-20%)' : 'Fuerte (>20%)'],
      ["Tipo de Suelo", cotizacion.suelo === 'normal' ? 'Estándar' : cotizacion.suelo === 'blando' ? 'Arcilloso / Blando' : 'Rocoso / Duro'],
      ["Niveles / Pisos", `${cotizacion.pisos} Plantas`],
      [{ content: 'DISTRIBUCIÓN ARQUITECTÓNICA Y ESPACIOS', colSpan: 2, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
      ["Línea de Acabados", cotizacion.acabados.toUpperCase()],
      ["Sala y Comedor", cotizacion.salaComedor === 'doble_altura' ? 'Sala Doble Altura con ventanales altos' : cotizacion.salaComedor === 'abierta' ? 'Concepto Abierto (Open Space)' : 'Sala y Comedor Tradicional'],
      ["Estilo de Cocina", cotizacion.cocina === 'gourmet' ? 'Cocina Gourmet de Lujo (Isla Cuarzo y Despensa)' : cotizacion.cocina === 'abierta' ? 'Cocina Abierta con Isla' : 'Cocina Cerrada Tradicional'],
      ["Habitaciones & Baños", `${cotizacion.cuartosMaster} Máster, ${cotizacion.cuartosNormales} Dorm. Estándar, ${cotizacion.banosCompletos} Baños Comp., ${cotizacion.mediosBanos} Medios Baños`],
      ["Espacios de Confort", `${cotizacion.estudio ? "Estudio/Home Office | " : ""}${cotizacion.salaTv ? "Sala de TV | " : ""}${cotizacion.lavanderia ? "Lavandería" : ""}` || "Básico"],
      [{ content: 'WELLNESS, RECREACIÓN Y EXTERIORES', colSpan: 2, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
      ["Zona BBQ / Asador", cotizacion.zonaBbq ? "Sí (Pérgola con asador y mesón)" : "No"],
      ["Jacuzzi / Hidromasaje", cotizacion.jacuzzi ? "Sí (4-6 personas con Deck WPC)" : "No"],
      ["Piscina", cotizacion.piscina ? "Sí (Hormigón y equipo de filtrado)" : "No"],
      ["Terraza Roof Top", cotizacion.terrazaRooftop ? "Sí (Impermeabilizada y baranda)" : "No"],
      ["Cerramiento & Garaje", `${cotizacion.cerramientoMl} ml cerramiento | Garaje: ${cotizacion.garaje}`],
    ];

    autoTable(doc, {
      startY: 76,
      head: [["Parámetro de Prefactibilidad", "Configuración Seleccionada"]],
      body: projectParams as any,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 8;
    if (currentY > 210) {
      doc.addPage();
      currentY = 20;
    }

    // Tabla de Costos con Bonificaciones
    const costsData = [
      [{ content: 'MÓDULO 1: CONSULTORÍA, DISEÑO Y APROBACIÓN MUNICIPAL', colSpan: 2, styles: { fillColor: [226, 232, 240], fontStyle: 'bold' } }],
      ["Diseño Arquitectónico Ejecutivo y Planimetría", `$${resultados.honorariosArq.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${resultados.honorariosArq < resultados.honorariosArqRef ? `(Ref: $${resultados.honorariosArqRef.toLocaleString()})` : ''}`],
      [`Cálculo y Diseño Estructural (Norma NEC-SE-DS)`, `$${resultados.honorariosEst.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${resultados.honorariosEst < resultados.honorariosEstRef ? `(Ref: $${resultados.honorariosEstRef.toLocaleString()})` : ''}`],
      [`Aprobación de Planos y Permisos GAD Municipal (${cotizacion.canton})`, `$${resultados.honorariosAprobacion.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ["Diseño de Instalaciones Eléctricas e Iluminación", `$${resultados.honorariosElec.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ["Diseño de Instalaciones Hidrosanitarias y Pluviales", `$${resultados.honorariosHidro.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ["Estudio de Suelos (Geotecnia con Sondeos SPT)", `$${resultados.honorariosGeotecnia.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ["Levantamiento Topográfico con Estación Total / RTK", `$${resultados.honorariosTop.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ...(resultados.totalAhorroConsultoria > 0 ? [[{ content: 'BONIFICACIÓN COMERCIAL GRUPO SARA (AHORRO CLIENTE)', styles: { fontStyle: 'bold', textColor: [16, 185, 129] } }, { content: `-$${resultados.totalAhorroConsultoria.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', textColor: [16, 185, 129] } }]] : []),
      [{ content: 'TOTAL MÓDULO 1 (CONSULTORÍA ACORDADA)', styles: { fontStyle: 'bold' } }, { content: `$${resultados.totalHonorarios.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }],
      [{ content: 'MÓDULO 2: PROYECCIÓN PARAMÉTRICA DE EJECUCIÓN DE OBRA', colSpan: 2, styles: { fillColor: [226, 232, 240], fontStyle: 'bold' } }],
      [`Costo Directo Base (${cotizacion.acabados} - ${cotizacion.canton})`, `$${resultados.desgloseObra.base.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ["Equipamiento Interior, Wellness, BBQ y Exteriores", `$${resultados.desgloseObra.extras.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      [{ content: 'SUBTOTAL COSTO DIRECTO DE OBRA (CD)', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }, { content: `$${resultados.costoObraDirecto.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }],
      [{ content: 'COSTOS INDIRECTOS Y MARGEN CONSTRUCTOR (AIU)', colSpan: 2, styles: { fillColor: [254, 243, 199], fontStyle: 'bold', textColor: [146, 64, 14] } }],
      [`Gastos Administrativos & Residencia de Obra (${resultados.pctAdmin.toFixed(1)}%)`, `$${resultados.montoAdmin.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      [`Imprevistos y Contingencias Técnicas (${resultados.pctImprev.toFixed(1)}%)`, `$${resultados.montoImprevistos.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      [`Utilidad Constructora Grupo SARA (${resultados.pctUtil.toFixed(1)}%)`, `$${resultados.montoUtilidad.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      [{ content: `TOTAL INDIRECTOS AIU (${resultados.pctAiuTotal.toFixed(1)}%)`, styles: { fontStyle: 'bold' } }, { content: `$${resultados.montoAiuTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }],
      [{ content: 'TOTAL MÓDULO 2 (EJECUCIÓN DE OBRA: CD + AIU)', styles: { fontStyle: 'bold', fillColor: [226, 232, 240] } }, { content: `$${resultados.costoObra.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', fillColor: [226, 232, 240] } }],
      [{ content: 'SUBTOTAL GENERAL ACORDADO', styles: { fontStyle: 'bold' } }, { content: `$${resultados.subtotalGeneral.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }],
      [{ content: `IVA Estimado (${params?.porcentaje_iva_base || 15}%)`, styles: { fontStyle: 'bold' } }, { content: `$${resultados.ivaEstimado.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }],
      [{ content: 'GRAN TOTAL PRESUPUESTO REFERENCIAL (USD)', styles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' } }, { content: `$${resultados.granTotalConIva.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, styles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' } }]
    ];

    autoTable(doc, {
      startY: currentY,
      head: [["Componente de Inversión", "Subtotal Acordado ($ USD)"]],
      body: costsData as any,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      styles: { fontSize: 8.5, cellPadding: 2.5 }
    });

    // Cláusula Legal y Salvedad Comercial en el PDF
    const finalY = (doc as any).lastAutoTable.finalY + 6;
    if (finalY > 240) {
      doc.addPage();
    }
    const boxY = finalY > 240 ? 20 : finalY;
    
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, boxY, pageWidth - 28, 26, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9);
    doc.text("CLÁUSULA DE SALVEDAD COMERCIAL Y VALIDEZ LEGAL:", 18, boxY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    const splitLines = doc.splitTextToSize(CLAUSULA_LEGAL_SALVEDAD, pageWidth - 36);
    doc.text(splitLines, 18, boxY + 11);

    doc.save(`Cotizacion_SARA_${cotizacion.nombreCliente || 'Proyecto'}_${cotizacion.canton}.pdf`);
  };

  // Exportar a Excel (.xlsx) Nativo con Fórmulas y Descuentos
  const handleExportExcel = () => {
    if (!resultados) return;
    const wb = XLSX.utils.book_new();

    const fechaStr = new Date().toLocaleDateString('es-ES');
    const nombreCliente = cotizacion.nombreCliente || "Cliente General";
    const nombreProyecto = cotizacion.nombreProyecto || "Residencia Unifamiliar";
    const areaM2 = Number(cotizacion.areaConstruccion) || 120;

    const excelRows: any[][] = [
      ["GRUPO SARA • ECOSISTEMA CONSTRUCTOR & RED DE AGENTES IA"],
      ["COTIZACIÓN ESTIMADA DE PROYECTO (PRESUPUESTO REFERENCIAL CON BONIFICACIÓN)"],
      [],
      ["DATOS GENERALES DEL PROYECTO"],
      ["Cliente:", nombreCliente, "", "Fecha de Emisión:", fechaStr],
      ["Proyecto:", nombreProyecto, "", "Área de Construcción:", `${areaM2} m²`],
      ["Provincia:", cotizacion.provincia, "", "Cantón / GAD:", cotizacion.canton],
      ["Norma Sísmica NEC-SE-DS:", resultados.calib.zonaSismicaNEC, "", "Entidad Municipal:", resultados.calib.nombreGAD],
      ["Sistema Estructural:", getEstructuraLabel(cotizacion.estructura), "", "Gama de Acabados:", cotizacion.acabados.toUpperCase()],
      ["Topografía del Terreno:", cotizacion.pendiente, "", "Tipo de Suelo:", cotizacion.suelo],
      [],
      ["MÓDULO 1: CONSULTORÍA, DISEÑO Y APROBACIÓN MUNICIPAL"],
      ["Ítem", "Descripción del Servicio", "Unidad", "Cantidad", "P. Referencial ($)", "P. Acordado ($)", "Ahorro ($)"]
    ];

    let itemIdx = 1;
    if (cotizacion.incArquitectura) {
      excelRows.push([itemIdx++, "Diseño Arquitectónico Ejecutivo y Planimetría", "m²", areaM2, resultados.honorariosArqRef, resultados.honorariosArq, resultados.honorariosArqRef - resultados.honorariosArq]);
    }
    if (cotizacion.incEstructura) {
      excelRows.push([itemIdx++, `Cálculo y Diseño Estructural (Norma NEC-SE-DS - ${cotizacion.provincia})`, "m²", areaM2, resultados.honorariosEstRef, resultados.honorariosEst, resultados.honorariosEstRef - resultados.honorariosEst]);
    }
    if (cotizacion.incAprobacionPlanos) {
      excelRows.push([itemIdx++, `Aprobación de Planos y Permisos Municipales (${resultados.calib.nombreGAD})`, "GLB", 1, resultados.honorariosAprobacionRef, resultados.honorariosAprobacion, resultados.honorariosAprobacionRef - resultados.honorariosAprobacion]);
    }
    if (cotizacion.incElectrico) {
      excelRows.push([itemIdx++, "Diseño de Instalaciones Eléctricas e Iluminación", "m²", areaM2, resultados.honorariosElecRef, resultados.honorariosElec, resultados.honorariosElecRef - resultados.honorariosElec]);
    }
    if (cotizacion.incHidrico) {
      excelRows.push([itemIdx++, "Diseño de Instalaciones Hidrosanitarias y Pluviales", "m²", areaM2, resultados.honorariosHidroRef, resultados.honorariosHidro, resultados.honorariosHidroRef - resultados.honorariosHidro]);
    }
    if (cotizacion.incGeotecnia) {
      excelRows.push([itemIdx++, "Estudio Geotécnico de Mecánica de Suelos (Sondeos SPT)", "GLB", 1, resultados.honorariosGeotecniaRef, resultados.honorariosGeotecnia, resultados.honorariosGeotecniaRef - resultados.honorariosGeotecnia]);
    }
    if (cotizacion.incTopografia) {
      excelRows.push([itemIdx++, "Levantamiento Topográfico con Estación Total / RTK", "GLB", 1, resultados.honorariosTopRef, resultados.honorariosTop, resultados.honorariosTopRef - resultados.honorariosTop]);
    }

    excelRows.push(["", "", "", "", "SUBTOTAL CONSULTORÍA:", resultados.totalHonorarios, resultados.totalAhorroConsultoria]);
    excelRows.push([]);

    excelRows.push(["MÓDULO 2: PROYECCIÓN PARAMÉTRICA DE EJECUCIÓN DE OBRA"]);
    excelRows.push(["Ítem", "Capítulo / Componente", "Unidad", "Cantidad", "Factor / P.U.", "Subtotal ($)"]);

    excelRows.push([
      1,
      `Obra Gris y Acabados Base (${cotizacion.acabados}) calibrado para ${cotizacion.canton}`,
      "m²",
      areaM2,
      params?.costo_base_construccion_m2 || 450,
      resultados.desgloseObra.base
    ]);

    let extraIdx = 2;
    if (cotizacion.cuartosMaster > 0) {
      excelRows.push([extraIdx++, "Dormitorio(s) Máster con Baño y Vestidor", "U", cotizacion.cuartosMaster, params?.costo_extra_master || 800, cotizacion.cuartosMaster * (params?.costo_extra_master || 800)]);
    }
    if (cotizacion.banosCompletos > 0) {
      excelRows.push([extraIdx++, "Baño(s) Completo(s) Adicional(es)", "U", cotizacion.banosCompletos, params?.costo_extra_bano_completo || 1500, cotizacion.banosCompletos * (params?.costo_extra_bano_completo || 1500)]);
    }
    if (cotizacion.mediosBanos > 0) {
      excelRows.push([extraIdx++, "Medio(s) Baño(s) Social(es)", "U", cotizacion.mediosBanos, params?.costo_extra_medio_bano || 800, cotizacion.mediosBanos * (params?.costo_extra_medio_bano || 800)]);
    }
    if (cotizacion.salaComedor === 'doble_altura') {
      excelRows.push([extraIdx++, "Diseño de Sala con Doble Altura y Ventanales Altos", "GLB", 1, 2500, 2500]);
    }
    if (cotizacion.cocina === 'abierta') {
      excelRows.push([extraIdx++, "Cocina Abierta con Isla y Mesón de Granito", "GLB", 1, params?.costo_extra_cocina_isla || 1500, params?.costo_extra_cocina_isla || 1500]);
    } else if (cotizacion.cocina === 'gourmet') {
      excelRows.push([extraIdx++, "Cocina Gourmet de Lujo (Isla Cuarzo, Despensa y Torre Hornos)", "GLB", 1, 3200, 3200]);
    }
    if (cotizacion.estudio) {
      excelRows.push([extraIdx++, "Área de Estudio / Home Office / Teletrabajo", "GLB", 1, 600, 600]);
    }
    if (cotizacion.salaTv) {
      excelRows.push([extraIdx++, "Sala Familiar de Estar Íntimo / TV Room", "GLB", 1, 700, 700]);
    }
    if (cotizacion.zonaBbq) {
      excelRows.push([extraIdx++, "Zona BBQ / Pérgola con Asador Empotrado y Mesón", "GLB", 1, 2800, 2800]);
    }
    if (cotizacion.jacuzzi) {
      excelRows.push([extraIdx++, "Jacuzzi / Hidromasaje Exterior con Calentador y Deck WPC", "GLB", 1, 4200, 4200]);
    }
    if (cotizacion.piscina) {
      excelRows.push([extraIdx++, "Piscina en Hormigón Armado con Sistema de Filtración", "GLB", 1, params?.costo_extra_piscina || 12000, params?.costo_extra_piscina || 12000]);
    }
    if (cotizacion.terrazaRooftop) {
      excelRows.push([extraIdx++, "Terraza Accesible / Roof Top con Baranda e Impermeabilización", "GLB", 1, 1800, 1800]);
    }
    if (cotizacion.lavanderia) {
      excelRows.push([extraIdx++, "Área de Lavandería y Cuarto de Máquinas", "GLB", 1, params?.costo_extra_lavanderia || 600, params?.costo_extra_lavanderia || 600]);
    }
    if (cotizacion.cerramientoMl > 0) {
      excelRows.push([extraIdx++, "Cerramiento Perimetral en Bloque y Malla", "ML", cotizacion.cerramientoMl, params?.costo_ml_cerramiento || 120, cotizacion.cerramientoMl * (params?.costo_ml_cerramiento || 120)]);
    }
    if (cotizacion.cisterna) {
      excelRows.push([extraIdx++, "Cisterna Subterránea Hormigón Armado y Bomba", "GLB", 1, params?.costo_extra_cisterna || 2500, params?.costo_extra_cisterna || 2500]);
    }
    if (cotizacion.garaje !== 'ninguno') {
      excelRows.push([extraIdx++, `Área de Garaje / Estacionamiento (${cotizacion.garaje})`, "GLB", 1, cotizacion.garaje === 'cubierto' ? 3500 : 800, cotizacion.garaje === 'cubierto' ? 3500 : 800]);
    }
    if (cotizacion.climatizacion !== 'ninguna') {
      excelRows.push([extraIdx++, `Sistema de Climatización (${cotizacion.climatizacion})`, "GLB", 1, cotizacion.climatizacion === 'central' ? 4500 : 1200, cotizacion.climatizacion === 'central' ? 4500 : 1200]);
    }

    excelRows.push(["", "", "", "", "SUBTOTAL COSTO DIRECTO OBRA (CD):", resultados.costoObraDirecto]);
    excelRows.push(["", "", "", "", `Gastos Administrativos & Residencia (${resultados.pctAdmin}%):`, resultados.montoAdmin]);
    excelRows.push(["", "", "", "", `Imprevistos y Contingencias (${resultados.pctImprev}%):`, resultados.montoImprevistos]);
    excelRows.push(["", "", "", "", `Utilidad Constructora Grupo SARA (${resultados.pctUtil}%):`, resultados.montoUtilidad]);
    excelRows.push(["", "", "", "", `TOTAL INDIRECTOS AIU (${resultados.pctAiuTotal}%):`, resultados.montoAiuTotal]);
    excelRows.push(["", "", "", "", "TOTAL MÓDULO 2 (OBRA: CD + AIU):", resultados.costoObra]);
    excelRows.push([]);

    excelRows.push(["RESUMEN ECONÓMICO INTEGRAL"]);
    excelRows.push(["Subtotal Módulo 1 (Consultoría & Permisos):", resultados.totalHonorarios]);
    excelRows.push(["Subtotal Módulo 2 Costo Directo (CD):", resultados.costoObraDirecto]);
    excelRows.push([`Subtotal Módulo 2 Indirectos AIU (${resultados.pctAiuTotal}%):`, resultados.montoAiuTotal]);
    excelRows.push(["Subtotal Ejecución de Obra (Módulo 2):", resultados.costoObra]);
    excelRows.push(["SUBTOTAL GENERAL ESTIMADO:", resultados.subtotalGeneral]);
    excelRows.push([`IVA Estimado (${params?.porcentaje_iva_base || 15}%):`, resultados.ivaEstimado]);
    excelRows.push(["GRAN TOTAL PRESUPUESTO REFERENCIAL (USD):", resultados.granTotalConIva]);
    if (resultados.totalAhorroConsultoria > 0) {
      excelRows.push(["BONIFICACIÓN COMERCIAL TOTAL CONCEDIDA:", `-$${resultados.totalAhorroConsultoria}`]);
    }
    excelRows.push([]);

    excelRows.push(["CLÁUSULA DE SALVEDAD COMERCIAL Y VALIDEZ LEGAL:"]);
    excelRows.push([CLAUSULA_LEGAL_SALVEDAD]);

    const ws = XLSX.utils.aoa_to_sheet(excelRows);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 62 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Cotizacion_Referencial");
    const safeClient = (cotizacion.nombreCliente || 'Proyecto').replace(/\s+/g, '_');
    XLSX.writeFile(wb, `Cotizacion_SARA_${safeClient}_${cotizacion.canton}.xlsx`);
  };

  // Puente: Convertir Cotización a Proyecto Real en la Mesa APU (CREANDO TODOS LOS RUBROS DETALLADOS)
  const handleConvertirAPU = async () => {
    setIsConvertingToApu(true);
    try {
      const nombreProj = cotizacion.nombreProyecto?.trim() || `Casa ${cotizacion.nombreCliente || 'Residencial'} (${cotizacion.areaConstruccion}m² - ${cotizacion.canton})`;
      const areaM2 = Number(cotizacion.areaConstruccion) || 120;
      
      // 1. Crear o seleccionar el Proyecto
      let targetProject = projects.find(p => p.nombre.toLowerCase() === nombreProj.toLowerCase());

      if (!targetProject) {
        targetProject = await createProject({
          nombre: nombreProj,
          provincia: cotizacion.provincia,
          ubicacion: `${cotizacion.canton}, ${cotizacion.provincia}`,
          descripcion: `Presupuesto proyectado de ${cotizacion.areaConstruccion} m² en ${cotizacion.canton}. Estructura: ${getEstructuraLabel(cotizacion.estructura)}. Gran Total: $${resultados?.granTotalConIva.toLocaleString()} USD.`,
          regimen: 'particular'
        }) || undefined;
      }

      if (targetProject) {
        setActiveProject(targetProject);
      }

      // 2. Definir los Capítulos del Presupuesto Real
      const capitulosPresupuesto = [
        "1. Consultoría, Diseño y Aprobación Municipal",
        "2. Trabajos Preliminares y Cimentación",
        "3. Estructura y Hormigones (Norma NEC)",
        "4. Mamposterías, Enlucidos y Acabados",
        "5. Instalaciones Eléctricas e Hidrosanitarias",
        "6. Wellness, Recreación y Obras Exteriores",
        "7. Varios y Limpieza Final"
      ];

      // 3. Crear el Registro Principal en presupuestos_reales
      const { data: newPresupuesto, error: presErr } = await supabase
        .from('presupuestos_reales')
        .insert([{
          nombre_proyecto: nombreProj,
          cliente_id: selectedClienteId || targetProject?.cliente_id || null,
          porcentaje_admin: aiuConfig.porcentajeAdmin,
          porcentaje_imprevistos: aiuConfig.porcentajeImprevistos,
          porcentaje_utilidad: aiuConfig.porcentajeUtilidad,
          estado: 'borrador',
          indirectos_config: {
            regimen: 'privado',
            capitulos: capitulosPresupuesto,
            rubro_capitulo_map: {},
            pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0
          }
        }])
        .select()
        .single();

      if (presErr || !newPresupuesto) {
        throw new Error("No se pudo crear el presupuesto en la base de datos: " + (presErr?.message || 'Error desconocido'));
      }

      // 4. Construir la lista completa de rubros detallados basados en la cotización
      const rubrosDataToInsert: Array<{
        codigo_rubro: string;
        nombre_rubro: string;
        unidad: string;
        cantidad_obra: number;
        precio_unitario_snapshot: number;
        subtotal: number;
        capitulo: string;
      }> = [];

      // CAPÍTULO 1: Consultoría & Aprobación Municipal
      if (cotizacion.incArquitectura) {
        rubrosDataToInsert.push({
          codigo_rubro: "CONS-001",
          nombre_rubro: "Diseño Arquitectónico Ejecutivo, Planimetría 2D y Renders 3D",
          unidad: "m²",
          cantidad_obra: areaM2,
          precio_unitario_snapshot: areaM2 > 0 ? (resultados?.honorariosArq || 0) / areaM2 : 14,
          subtotal: resultados?.honorariosArq || 0,
          capitulo: "1. Consultoría, Diseño y Aprobación Municipal"
        });
      }
      if (cotizacion.incEstructura) {
        rubrosDataToInsert.push({
          codigo_rubro: "CONS-002",
          nombre_rubro: `Cálculo y Diseño Estructural Sísmico (Norma NEC-SE-DS - ${cotizacion.provincia})`,
          unidad: "m²",
          cantidad_obra: areaM2,
          precio_unitario_snapshot: areaM2 > 0 ? (resultados?.honorariosEst || 0) / areaM2 : 8.5,
          subtotal: resultados?.honorariosEst || 0,
          capitulo: "1. Consultoría, Diseño y Aprobación Municipal"
        });
      }
      if (cotizacion.incAprobacionPlanos) {
        rubrosDataToInsert.push({
          codigo_rubro: "CONS-003",
          nombre_rubro: `Aprobación de Planos y Permisos Municipales (GAD Municipal de ${cotizacion.canton})`,
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: resultados?.honorariosAprobacion || 0,
          subtotal: resultados?.honorariosAprobacion || 0,
          capitulo: "1. Consultoría, Diseño y Aprobación Municipal"
        });
      }
      if (cotizacion.incGeotecnia) {
        rubrosDataToInsert.push({
          codigo_rubro: "CONS-004",
          nombre_rubro: "Estudio Geotécnico de Mecánica de Suelos (Sondeos SPT)",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: resultados?.honorariosGeotecnia || 850,
          subtotal: resultados?.honorariosGeotecnia || 850,
          capitulo: "1. Consultoría, Diseño y Aprobación Municipal"
        });
      }
      if (cotizacion.incTopografia) {
        rubrosDataToInsert.push({
          codigo_rubro: "CONS-005",
          nombre_rubro: "Levantamiento Topográfico con Estación Total / Dron RTK",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: resultados?.honorariosTop || 380,
          subtotal: resultados?.honorariosTop || 380,
          capitulo: "1. Consultoría, Diseño y Aprobación Municipal"
        });
      }

      // CAPÍTULO 2: Preliminares
      rubrosDataToInsert.push({
        codigo_rubro: "PREL-001",
        nombre_rubro: "Replanteo y Nivelación con Estación Total",
        unidad: "m²",
        cantidad_obra: areaM2,
        precio_unitario_snapshot: 2.80,
        subtotal: Math.round(areaM2 * 2.80),
        capitulo: "2. Trabajos Preliminares y Cimentación"
      });
      rubrosDataToInsert.push({
        codigo_rubro: "PREL-002",
        nombre_rubro: "Excavación a Máquina para Cimientos y Desalojo de Tierra",
        unidad: "m³",
        cantidad_obra: Math.round(areaM2 * 0.45),
        precio_unitario_snapshot: 7.50,
        subtotal: Math.round(areaM2 * 0.45 * 7.50),
        capitulo: "2. Trabajos Preliminares y Cimentación"
      });

      // CAPÍTULO 3: Estructura
      const costoEstructuralBase = Math.round((resultados?.desgloseObra.base || 0) * 0.45);
      rubrosDataToInsert.push({
        codigo_rubro: "ESTR-001",
        nombre_rubro: getEstructuraLabel(cotizacion.estructura),
        unidad: "m²",
        cantidad_obra: areaM2,
        precio_unitario_snapshot: areaM2 > 0 ? Math.round(costoEstructuralBase / areaM2) : 220,
        subtotal: costoEstructuralBase,
        capitulo: "3. Estructura y Hormigones (Norma NEC)"
      });
      rubrosDataToInsert.push({
        codigo_rubro: "ESTR-002",
        nombre_rubro: "Acero de Refuerzo Corrugado fy=4200 kg/cm² cortado y figurado",
        unidad: "kg",
        cantidad_obra: Math.round(areaM2 * 22),
        precio_unitario_snapshot: 1.65,
        subtotal: Math.round(areaM2 * 22 * 1.65),
        capitulo: "3. Estructura y Hormigones (Norma NEC)"
      });

      // CAPÍTULO 4: Mampostería y Acabados
      const costoAcabadosBase = Math.round((resultados?.desgloseObra.base || 0) * 0.35);
      rubrosDataToInsert.push({
        codigo_rubro: "MAMP-001",
        nombre_rubro: "Mampostería de Bloque Pesado e=15cm con Mortero 1:4",
        unidad: "m²",
        cantidad_obra: Math.round(areaM2 * 2.0),
        precio_unitario_snapshot: 14.20,
        subtotal: Math.round(areaM2 * 2.0 * 14.20),
        capitulo: "4. Mamposterías, Enlucidos y Acabados"
      });
      rubrosDataToInsert.push({
        codigo_rubro: "ACAB-001",
        nombre_rubro: `Acabados de Pisos, Paredes y Pintura Línea ${cotizacion.acabados.toUpperCase()}`,
        unidad: "m²",
        cantidad_obra: areaM2,
        precio_unitario_snapshot: areaM2 > 0 ? Math.round(costoAcabadosBase / areaM2) : 160,
        subtotal: costoAcabadosBase,
        capitulo: "4. Mamposterías, Enlucidos y Acabados"
      });
      if (cotizacion.salaComedor === 'doble_altura') {
        rubrosDataToInsert.push({
          codigo_rubro: "ACAB-002",
          nombre_rubro: "Ventanales Altos y Molduras para Sala en Doble Altura",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: 2500,
          subtotal: 2500,
          capitulo: "4. Mamposterías, Enlucidos y Acabados"
        });
      }
      if (cotizacion.cocina === 'abierta') {
        rubrosDataToInsert.push({
          codigo_rubro: "ACAB-003",
          nombre_rubro: "Mesón e Isla Central de Cocina en Granito con Muebles Melamínicos",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: 1500,
          subtotal: 1500,
          capitulo: "4. Mamposterías, Enlucidos y Acabados"
        });
      } else if (cotizacion.cocina === 'gourmet') {
        rubrosDataToInsert.push({
          codigo_rubro: "ACAB-003",
          nombre_rubro: "Cocina Gourmet de Lujo con Isla en Cuarzo, Despensa Walk-in y Torre de Hornos",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: 3200,
          subtotal: 3200,
          capitulo: "4. Mamposterías, Enlucidos y Acabados"
        });
      }
      if (cotizacion.estudio) {
        rubrosDataToInsert.push({
          codigo_rubro: "ACAB-004",
          nombre_rubro: "Adecuación y Puntos de Red para Estudio / Home Office",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: 600,
          subtotal: 600,
          capitulo: "4. Mamposterías, Enlucidos y Acabados"
        });
      }
      if (cotizacion.salaTv) {
        rubrosDataToInsert.push({
          codigo_rubro: "ACAB-005",
          nombre_rubro: "Sala Familiar de Estar Íntimo / TV Room con Aislamiento Acústico",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: 700,
          subtotal: 700,
          capitulo: "4. Mamposterías, Enlucidos y Acabados"
        });
      }
      if (cotizacion.cuartosMaster > 0) {
        rubrosDataToInsert.push({
          codigo_rubro: "ACAB-006",
          nombre_rubro: "Dormitorio Máster con Vestidor Walk-in y Baño Privado",
          unidad: "U",
          cantidad_obra: cotizacion.cuartosMaster,
          precio_unitario_snapshot: 800,
          subtotal: cotizacion.cuartosMaster * 800,
          capitulo: "4. Mamposterías, Enlucidos y Acabados"
        });
      }
      if (cotizacion.banosCompletos > 0) {
        rubrosDataToInsert.push({
          codigo_rubro: "ACAB-007",
          nombre_rubro: "Batería Sanitaria Completa con Aparatos FV, Mampara y Grifería",
          unidad: "U",
          cantidad_obra: cotizacion.banosCompletos,
          precio_unitario_snapshot: 1500,
          subtotal: cotizacion.banosCompletos * 1500,
          capitulo: "4. Mamposterías, Enlucidos y Acabados"
        });
      }
      if (cotizacion.mediosBanos > 0) {
        rubrosDataToInsert.push({
          codigo_rubro: "ACAB-008",
          nombre_rubro: "Medio Baño Social con Inodoro y Lavamanos FV",
          unidad: "U",
          cantidad_obra: cotizacion.mediosBanos,
          precio_unitario_snapshot: 800,
          subtotal: cotizacion.mediosBanos * 800,
          capitulo: "4. Mamposterías, Enlucidos y Acabados"
        });
      }

      // CAPÍTULO 5: Instalaciones
      if (cotizacion.incElectrico) {
        rubrosDataToInsert.push({
          codigo_rubro: "INST-001",
          nombre_rubro: "Redes Eléctricas Interiores, Puntos de Luz LED, Tomacorrientes y Tablero",
          unidad: "m²",
          cantidad_obra: areaM2,
          precio_unitario_snapshot: 8.50,
          subtotal: Math.round(areaM2 * 8.50),
          capitulo: "5. Instalaciones Eléctricas e Hidrosanitarias"
        });
      }
      if (cotizacion.incHidrico) {
        rubrosDataToInsert.push({
          codigo_rubro: "INST-002",
          nombre_rubro: "Redes de Agua Fría/Caliente en Termofusión y Desagües Sanitarios PVC",
          unidad: "m²",
          cantidad_obra: areaM2,
          precio_unitario_snapshot: 7.80,
          subtotal: Math.round(areaM2 * 7.80),
          capitulo: "5. Instalaciones Eléctricas e Hidrosanitarias"
        });
      }

      // CAPÍTULO 6: Wellness y Exteriores
      if (cotizacion.zonaBbq) {
        rubrosDataToInsert.push({
          codigo_rubro: "WELL-001",
          nombre_rubro: "Zona BBQ con Pérgola de Madera/Metal, Asador con Ladrillo Refractario y Fregadero",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: 2800,
          subtotal: 2800,
          capitulo: "6. Wellness, Recreación y Obras Exteriores"
        });
      }
      if (cotizacion.jacuzzi) {
        rubrosDataToInsert.push({
          codigo_rubro: "WELL-002",
          nombre_rubro: "Jacuzzi / Hidromasaje Exterior 4-6 personas con Calentador y Deck WPC",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: 4200,
          subtotal: 4200,
          capitulo: "6. Wellness, Recreación y Obras Exteriores"
        });
      }
      if (cotizacion.piscina) {
        rubrosDataToInsert.push({
          codigo_rubro: "WELL-003",
          nombre_rubro: "Construcción de Piscina en Hormigón Armado con Gres Antideslizante y Filtrado",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: 12000,
          subtotal: 12000,
          capitulo: "6. Wellness, Recreación y Obras Exteriores"
        });
      }
      if (cotizacion.terrazaRooftop) {
        rubrosDataToInsert.push({
          codigo_rubro: "WELL-004",
          nombre_rubro: "Terraza Accesible Roof Top con Impermeabilización y Pasamanos de Vidrio",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: 1800,
          subtotal: 1800,
          capitulo: "6. Wellness, Recreación y Obras Exteriores"
        });
      }
      if (cotizacion.cerramientoMl > 0) {
        rubrosDataToInsert.push({
          codigo_rubro: "EXT-001",
          nombre_rubro: "Cerramiento Perimetral en Bloque con Malla y Alambre de Púas",
          unidad: "ML",
          cantidad_obra: cotizacion.cerramientoMl,
          precio_unitario_snapshot: 120,
          subtotal: cotizacion.cerramientoMl * 120,
          capitulo: "6. Wellness, Recreación y Obras Exteriores"
        });
      }
      if (cotizacion.cisterna) {
        rubrosDataToInsert.push({
          codigo_rubro: "EXT-002",
          nombre_rubro: "Cisterna Subterránea de Hormigón Armado con Bomba y Tanque de Presión",
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: 2500,
          subtotal: 2500,
          capitulo: "6. Wellness, Recreación y Obras Exteriores"
        });
      }
      if (cotizacion.garaje !== 'ninguno') {
        rubrosDataToInsert.push({
          codigo_rubro: "EXT-003",
          nombre_rubro: `Área de Garaje / Estacionamiento (${cotizacion.garaje})`,
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: cotizacion.garaje === 'cubierto' ? 3500 : 800,
          subtotal: cotizacion.garaje === 'cubierto' ? 3500 : 800,
          capitulo: "6. Wellness, Recreación y Obras Exteriores"
        });
      }
      if (cotizacion.climatizacion !== 'ninguna') {
        rubrosDataToInsert.push({
          codigo_rubro: "EXT-004",
          nombre_rubro: `Sistema de Climatización (${cotizacion.climatizacion})`,
          unidad: "GLB",
          cantidad_obra: 1,
          precio_unitario_snapshot: cotizacion.climatizacion === 'central' ? 4500 : 1200,
          subtotal: cotizacion.climatizacion === 'central' ? 4500 : 1200,
          capitulo: "6. Wellness, Recreación y Obras Exteriores"
        });
      }

      // CAPÍTULO 7: Limpieza y Entrega
      rubrosDataToInsert.push({
        codigo_rubro: "VAR-001",
        nombre_rubro: "Limpieza Final de Obra y Desalojo General para Entrega",
        unidad: "GLB",
        cantidad_obra: 1,
        precio_unitario_snapshot: 450,
        subtotal: 450,
        capitulo: "7. Varios y Limpieza Final"
      });

      // 5. Insertar los rubros en presupuesto_rubros
      const dbPayload = rubrosDataToInsert.map(r => ({
        presupuesto_id: newPresupuesto.id,
        codigo_rubro: r.codigo_rubro,
        nombre_rubro: r.nombre_rubro,
        unidad: r.unidad,
        cantidad_obra: r.cantidad_obra,
        precio_unitario_snapshot: r.precio_unitario_snapshot,
        subtotal: r.subtotal
      }));

      const { data: insertedRubros, error: rubrosErr } = await supabase
        .from('presupuesto_rubros')
        .insert(dbPayload)
        .select();

      if (rubrosErr || !insertedRubros) {
        throw new Error("Error al guardar los rubros del presupuesto: " + (rubrosErr?.message || 'Error desconocido'));
      }

      // 6. Construir y actualizar el rubro_capitulo_map en presupuestos_reales
      const updatedMap: Record<string, string> = {};
      insertedRubros.forEach((ir: any, idx: number) => {
        if (rubrosDataToInsert[idx]) {
          updatedMap[ir.id] = rubrosDataToInsert[idx].capitulo;
        }
      });

      const costoDirectoCalculado = insertedRubros.reduce((acc: number, curr: any) => acc + Number(curr.subtotal || 0), 0);
      const factorAiuMultiplier = 1 + ((Number(aiuConfig.porcentajeAdmin) || 0) + (Number(aiuConfig.porcentajeImprevistos) || 0) + (Number(aiuConfig.porcentajeUtilidad) || 0)) / 100;
      const granTotalCalculado = Math.round(costoDirectoCalculado * factorAiuMultiplier);

      await supabase
        .from('presupuestos_reales')
        .update({
          costo_directo_total: costoDirectoCalculado,
          gran_total: granTotalCalculado,
          indirectos_config: {
            regimen: 'privado',
            capitulos: capitulosPresupuesto,
            rubro_capitulo_map: updatedMap,
            pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0
          }
        })
        .eq('id', newPresupuesto.id);

      // 7. Sincronizar automáticamente la receta analítica de insumos (Materiales, Mano de Obra, Equipos)
      try {
        await syncAllInsumosForPresupuesto(supabase, newPresupuesto.id);
      } catch (syncErr) {
        console.warn("Aviso: la sincronización de insumos se completará en segundo plano:", syncErr);
      }

      // 8. Redirigir y abrir de inmediato el editor con todos los rubros
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      router.push(`/dashboard/presupuestos_reales?open=${newPresupuesto.id}`);
    } catch (err: any) {
      console.error("Error al convertir:", err);
      alert("Error al transferir a la Mesa de Presupuestos: " + err.message);
    } finally {
      setIsConvertingToApu(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createClientAccount(clientFormData);
    if (res.success) {
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setClientFormData({ nombre: '', apellido: '', email: '', telefono: '', password: '' });
      alert("Cliente creado y vinculado exitosamente.");
    } else {
      alert("Error: " + res.error);
    }
    setIsSubmitting(false);
  };

  const handleSaveQuote = async (resCalculados: any) => {
    if (!selectedClienteId) return alert("Por favor, selecciona o crea un cliente antes de guardar en el historial.");
    setSavingQuote(true);
    
    const payload = {
      cliente_id: selectedClienteId,
      nombre_proyecto: cotizacion.nombreProyecto || `Proyecto en ${cotizacion.canton}`,
      area_construccion: Number(cotizacion.areaConstruccion) || 0,
      total_consultoria: resCalculados.totalHonorarios,
      total_obra: resCalculados.costoObra,
      detalles_json: {
        ...cotizacion,
        provincia: cotizacion.provincia,
        canton: cotizacion.canton,
        norma_sismica: resCalculados.calib.zonaSismicaNEC,
        entidad_municipal: resCalculados.calib.nombreGAD,
        descuentos_modulo1: descuentosModulo1,
        total_ahorro_consultoria: resCalculados.totalAhorroConsultoria,
        aiu_config: aiuConfig,
        costo_directo: resCalculados.costoObraDirecto,
        monto_aiu_total: resCalculados.montoAiuTotal,
        monto_admin: resCalculados.montoAdmin,
        monto_imprevistos: resCalculados.montoImprevistos,
        monto_utilidad: resCalculados.montoUtilidad,
        gran_total_con_iva: resCalculados.granTotalConIva
      }
    };
    
    const { error } = await supabase.from('historial_cotizaciones').insert(payload);
    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      alert("Cotización guardada exitosamente en el historial.");
      queryClient.invalidateQueries({ queryKey: ['historial_cotizaciones'] });
    }
    setSavingQuote(false);
  };

  if (loadingParams) return <div className="p-8 text-slate-400 font-mono">Cargando motor predictivo y parámetros de Grupo SARA...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* CABECERA PRINCIPAL CON BOTONES ESTRATÉGICOS SUPERIORES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Red de Agentes IA • Memoria Histórica 2026
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              24 Provincias Sincronizadas
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 mt-2 tracking-tight">
            <Calculator className="w-8 h-8 text-amber-500" /> Cotizador Paramétrico Predictivo
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Diseño Arquitectónico, Estructura (NEC), Permisos GAD, Bonificaciones Comerciales y Presupuesto Real de Obra.
          </p>
        </div>
        
        {/* BOTONES ESTRATÉGICOS DE ACCIÓN RÁPIDA (SIEMPRE VISIBLES ARRIBA) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 mr-2">
            <button 
              onClick={() => setActiveTab('generar')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'generar' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <FileText size={14} /> Cotizador
            </button>
            <button 
              onClick={() => setActiveTab('historial')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'historial' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <CheckCircle2 size={14} /> Historial
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'generar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO DE ENTRADA (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6 print:hidden">
            
            {/* SECCIÓN 0: CLIENTE Y PROYECTO */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">1. Cliente y Denominación</label>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus size={14} /> Registrar Nuevo Cliente
                </button>
              </div>
              <div className="space-y-3">
                <AsyncSelect
                  table="clientes"
                  selectFields="id, nombre, apellido, email"
                  searchColumns={['nombre', 'apellido', 'email']}
                  displayFormat={(c: any) => c ? `${c.nombre} ${c.apellido} (${c.email})` : ''}
                  value={selectedClienteId ? { id: selectedClienteId, nombre: cotizacion.nombreCliente?.split(' ')[0] || '', apellido: cotizacion.nombreCliente?.split(' ').slice(1).join(' ') || '' } : null}
                  onChange={(selectedClient: any) => {
                    if (selectedClient) {
                      setSelectedClienteId(selectedClient.id);
                      setCotizacion({ ...cotizacion, nombreCliente: `${selectedClient.nombre} ${selectedClient.apellido}` });
                    } else {
                      setSelectedClienteId("");
                      setCotizacion({ ...cotizacion, nombreCliente: '' });
                    }
                  }}
                  placeholder="-- Buscar cliente en base de datos... --"
                  className="w-full"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nombre del Proyecto</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Residencia Familiar Mendoza"
                      value={cotizacion.nombreProyecto} 
                      onChange={e => setCotizacion({ ...cotizacion, nombreProyecto: e.target.value })} 
                      className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Área Construida Proyectada (m²)</label>
                    <input 
                      type="number" 
                      step="1"
                      min="10"
                      value={cotizacion.areaConstruccion} 
                      onChange={e => setCotizacion({ ...cotizacion, areaConstruccion: e.target.value })} 
                      className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3.5 py-2 text-sm font-bold text-amber-600 dark:text-amber-400 outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: LOCALIZACIÓN NACIONAL & GAD MUNICIPAL */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                  <label className="text-sm font-black text-slate-900 dark:text-white">Localización Geográfica & GAD Municipal</label>
                </div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <MapPin size={13} /> Calibración SARA-APU
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Provincia (24 Provincias del Ecuador)</label>
                  <select 
                    value={cotizacion.provincia} 
                    onChange={e => handleProvinciaChange(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.keys(PROVINCIAS_CANTONES).sort().map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Cantón / Jurisdicción Municipal</label>
                  <select 
                    value={cotizacion.canton} 
                    onChange={e => setCotizacion({ ...cotizacion, canton: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {(PROVINCIAS_CANTONES[cotizacion.provincia] || []).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Banner Informativo de Calibración de la Provincia */}
              <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Landmark size={14} /> {resultados?.calib.nombreGAD}
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    Factor Regional Insumos: x{resultados?.fRegional}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4">
                  <span>Normativa Sísmica: <strong className="text-slate-700 dark:text-slate-300">{resultados?.calib.zonaSismicaNEC}</strong></span>
                  <span>Tasa Revisión GAD: <strong className="text-slate-700 dark:text-slate-300">${resultados?.calib.baseAprobacionGAD} + ${resultados?.calib.tasaPorM2GAD}/m²</strong></span>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: ALCANCE DE CONSULTORÍA CON DESCUENTOS Y BONIFICACIONES (MÓDULO 1) */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">3</span>
                  <label className="text-sm font-black text-slate-900 dark:text-white">Módulo 1: Consultoría & Permisos GAD</label>
                </div>
                
                {/* Botón Maestro de Bonificación */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={bonificarDisenoTotal}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Bonifica al 100% el diseño arquitectónico y estructural por contratación de obra"
                  >
                    <Gift size={13} />
                    <span>🎁 Bonificar 100% Diseño por Obra</span>
                  </button>

                  {(resultados?.totalAhorroConsultoria || 0) > 0 && (
                    <button
                      type="button"
                      onClick={restaurarTarifasModulo1}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Restaurar tarifas estándar de lista"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Banner de Ahorro para el Cliente */}
              {(resultados?.totalAhorroConsultoria || 0) > 0 && (
                <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      ¡Descuento comercial activo! El cliente ve un ahorro directo de <strong>${resultados?.totalAhorroConsultoria.toLocaleString()} USD</strong> en consultoría.
                    </span>
                  </div>
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20">
                    Ahorro: -${resultados?.totalAhorroConsultoria.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {/* 1. Arquitectura */}
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={cotizacion.incArquitectura} 
                        onChange={e => setCotizacion({ ...cotizacion, incArquitectura: e.target.checked })} 
                        className="w-4 h-4 accent-amber-500 rounded" 
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Diseño Arquitectónico Ejecutivo</span>
                        <span className="text-[10px] text-slate-400">Planimetría 2D, fachadas, renders 3D y especificaciones.</span>
                      </div>
                    </label>

                    <div className="text-right">
                      {resultados && resultados.honorariosArq < resultados.honorariosArqRef ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-[11px] text-slate-400 line-through font-mono">
                            ${resultados.honorariosArqRef.toLocaleString()}
                          </span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            ${resultados.honorariosArq.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                          ${resultados?.honorariosArq.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fila de Edición de Valor y Descuentos */}
                  {cotizacion.incArquitectura && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[10px]">Valor acordado ($):</span>
                        <input
                          type="number"
                          min="0"
                          value={descuentosModulo1.arq !== null ? descuentosModulo1.arq : resultados?.honorariosArqRef}
                          onChange={e => setDescuentosModulo1(prev => ({ ...prev, arq: Math.max(0, Number(e.target.value)) }))}
                          className="w-24 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs text-emerald-600 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDescuentosModulo1(prev => ({ ...prev, arq: 0 }))}
                          className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] hover:bg-emerald-200"
                        >
                          100% Gratis
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarDescuentoItem('arq', 50, resultados?.honorariosArqRef || 0)}
                          className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]"
                        >
                          -50%
                        </button>
                        {descuentosModulo1.arq !== null && (
                          <button
                            type="button"
                            onClick={() => setDescuentosModulo1(prev => ({ ...prev, arq: null }))}
                            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-600 text-[10px]"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Estructura */}
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={cotizacion.incEstructura} 
                        onChange={e => setCotizacion({ ...cotizacion, incEstructura: e.target.checked })} 
                        className="w-4 h-4 accent-amber-500 rounded" 
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Cálculo y Diseño Estructural Sísmico (NEC)</span>
                        <span className="text-[10px] text-slate-400">Memoria de cálculo sismo-resistente NEC-SE-DS y planos estructurales.</span>
                      </div>
                    </label>

                    <div className="text-right">
                      {resultados && resultados.honorariosEst < resultados.honorariosEstRef ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-[11px] text-slate-400 line-through font-mono">
                            ${resultados.honorariosEstRef.toLocaleString()}
                          </span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            ${resultados.honorariosEst.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                          ${resultados?.honorariosEst.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fila de Edición de Valor y Descuentos */}
                  {cotizacion.incEstructura && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[10px]">Valor acordado ($):</span>
                        <input
                          type="number"
                          min="0"
                          value={descuentosModulo1.est !== null ? descuentosModulo1.est : resultados?.honorariosEstRef}
                          onChange={e => setDescuentosModulo1(prev => ({ ...prev, est: Math.max(0, Number(e.target.value)) }))}
                          className="w-24 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs text-emerald-600 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDescuentosModulo1(prev => ({ ...prev, est: 0 }))}
                          className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] hover:bg-emerald-200"
                        >
                          100% Gratis
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarDescuentoItem('est', 50, resultados?.honorariosEstRef || 0)}
                          className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]"
                        >
                          -50%
                        </button>
                        {descuentosModulo1.est !== null && (
                          <button
                            type="button"
                            onClick={() => setDescuentosModulo1(prev => ({ ...prev, est: null }))}
                            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-600 text-[10px]"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Aprobación de Planos GAD Municipal */}
                <div className="p-3 border-2 border-amber-500/40 bg-amber-500/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={cotizacion.incAprobacionPlanos} 
                        onChange={e => setCotizacion({ ...cotizacion, incAprobacionPlanos: e.target.checked })} 
                        className="w-4 h-4 accent-amber-500 rounded" 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-700 dark:text-amber-300 block">
                            Aprobación de Planos & Permisos GAD Municipal
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300">
                            {cotizacion.canton}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Tasas GAD, Línea de Fábrica / IRM, Bomberos y Registro Profesional.
                        </span>
                      </div>
                    </label>

                    <div className="text-right">
                      {resultados && resultados.honorariosAprobacion < resultados.honorariosAprobacionRef ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-[11px] text-slate-400 line-through font-mono">
                            ${resultados.honorariosAprobacionRef.toLocaleString()}
                          </span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            ${resultados.honorariosAprobacion.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                          ${resultados?.honorariosAprobacion.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fila de Edición GAD */}
                  {cotizacion.incAprobacionPlanos && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-500/20 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[10px]">Tasa acordada ($):</span>
                        <input
                          type="number"
                          min="0"
                          value={descuentosModulo1.aprobacion !== null ? descuentosModulo1.aprobacion : resultados?.honorariosAprobacionRef}
                          onChange={e => setDescuentosModulo1(prev => ({ ...prev, aprobacion: Math.max(0, Number(e.target.value)) }))}
                          className="w-24 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs text-amber-600 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDescuentosModulo1(prev => ({ ...prev, aprobacion: 0 }))}
                          className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]"
                        >
                          Bonificado
                        </button>
                        {descuentosModulo1.aprobacion !== null && (
                          <button
                            type="button"
                            onClick={() => setDescuentosModulo1(prev => ({ ...prev, aprobacion: null }))}
                            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-600 text-[10px]"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Eléctrico, Hidrosanitario, Geotecnia y Topografía */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={cotizacion.incElectrico} onChange={e => setCotizacion({ ...cotizacion, incElectrico: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Diseño Eléctrico</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">${resultados?.honorariosElec.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={cotizacion.incHidrico} onChange={e => setCotizacion({ ...cotizacion, incHidrico: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Diseño Hidrosanitario</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">${resultados?.honorariosHidro.toLocaleString()}</span>
                  </label>

                  <label className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={cotizacion.incGeotecnia} onChange={e => setCotizacion({ ...cotizacion, incGeotecnia: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Estudio Suelos (SPT)</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">${resultados?.honorariosGeotecnia}</span>
                  </label>

                  <label className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={cotizacion.incTopografia} onChange={e => setCotizacion({ ...cotizacion, incTopografia: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Topografía (RTK)</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">${resultados?.honorariosTop}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: CONDICIONANTES DEL SITIO Y SISTEMA ESTRUCTURAL */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center">4</span>
                  <label className="text-sm font-black text-slate-900 dark:text-white">Condicionantes del Terreno y Sistema Estructural</label>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Factor Estructura: x{resultados?.fEstructura}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Sistema Estructural Sismo-Resistente (Normativa NEC-SE-DS)
                  </label>
                  <select 
                    value={cotizacion.estructura} 
                    onChange={e => setCotizacion({ ...cotizacion, estructura: e.target.value })} 
                    className="w-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="hormigon">🏢 Hormigón Armado Sismo-Resistente (Pórticos, Vigas y Losa Alivianada - Estándar NEC)</option>
                    <option value="metalica">🔩 Estructura Metálica Dúctil con Losa Steel Deck (+15%)</option>
                    <option value="mixta">🏛️ Estructura Mixta (Columnas H.A. + Vigas y Cubierta Metálica Ligera) (+8%)</option>
                    <option value="mamposteria">🧱 Mampostería Confinada / Bloque Estructural (-8% Económica)</option>
                    <option value="steel_framing">🏗️ Steel Framing / Perfiles Galvanizados Livianos en Seco (+5%)</option>
                    <option value="madera_tratada">🪵 Madera Estructural Tratada / Timber Frame Campestre (+12%)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Topografía</label>
                    <select value={cotizacion.pendiente} onChange={e => setCotizacion({ ...cotizacion, pendiente: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-xs">
                      <option value="plana">Plana (&lt; 5%)</option>
                      <option value="media">Media (5% - 20%)</option>
                      <option value="fuerte">Fuerte (&gt; 20%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Tipo de Suelo</label>
                    <select value={cotizacion.suelo} onChange={e => setCotizacion({ ...cotizacion, suelo: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-xs">
                      <option value="normal">Normal (Estándar)</option>
                      <option value="blando">Arcilloso / Blando</option>
                      <option value="rocoso">Rocoso / Duro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Accesibilidad</label>
                    <select value={cotizacion.accesibilidad} onChange={e => setCotizacion({ ...cotizacion, accesibilidad: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-xs">
                      <option value="urbana">Urbana Pavimentada</option>
                      <option value="rural">Rural / Remoto (+8%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Pisos / Niveles</label>
                    <select value={cotizacion.pisos} onChange={e => setCotizacion({ ...cotizacion, pisos: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-xs">
                      <option value="1">1 Planta</option>
                      <option value="2">2 Plantas</option>
                      <option value="3_mas">3 o más Plantas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: DISTRIBUCIÓN ARQUITECTÓNICA COMPLETA */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center">5</span>
                <label className="text-sm font-black text-slate-900 dark:text-white">Distribución Interior & Acabados</label>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Gama de Acabados</label>
                    <select value={cotizacion.acabados} onChange={e => setCotizacion({ ...cotizacion, acabados: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-white">
                      <option value="economico">Económico / Social</option>
                      <option value="estandar">Estándar / Comercial</option>
                      <option value="premium">Premium / Alta Gama</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Sala y Comedor</label>
                    <select value={cotizacion.salaComedor} onChange={e => setCotizacion({ ...cotizacion, salaComedor: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-2 text-xs">
                      <option value="estandar">Tradicional Independiente</option>
                      <option value="abierta">Open Concept (Integrada)</option>
                      <option value="doble_altura">Sala Doble Altura (+ $2,500)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Estilo de Cocina</label>
                    <select value={cotizacion.cocina} onChange={e => setCotizacion({ ...cotizacion, cocina: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-2 text-xs">
                      <option value="cerrada">Cerrada Tradicional</option>
                      <option value="abierta">Americana con Isla (+ $1,500)</option>
                      <option value="gourmet">Cocina Gourmet Lujo (+ $3,200)</option>
                    </select>
                  </div>
                </div>

                {/* Habitaciones y Baños con Contadores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Dorm. Máster</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <button type="button" onClick={() => setCotizacion({ ...cotizacion, cuartosMaster: Math.max(0, cotizacion.cuartosMaster - 1) })} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded font-bold">-</button>
                      <span className="font-bold">{cotizacion.cuartosMaster}</span>
                      <button type="button" onClick={() => setCotizacion({ ...cotizacion, cuartosMaster: cotizacion.cuartosMaster + 1 })} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded font-bold">+</button>
                    </div>
                  </div>

                  <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Dorm. Normal</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <button type="button" onClick={() => setCotizacion({ ...cotizacion, cuartosNormales: Math.max(0, cotizacion.cuartosNormales - 1) })} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded font-bold">-</button>
                      <span className="font-bold">{cotizacion.cuartosNormales}</span>
                      <button type="button" onClick={() => setCotizacion({ ...cotizacion, cuartosNormales: cotizacion.cuartosNormales + 1 })} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded font-bold">+</button>
                    </div>
                  </div>

                  <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Baños Comp.</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <button type="button" onClick={() => setCotizacion({ ...cotizacion, banosCompletos: Math.max(0, cotizacion.banosCompletos - 1) })} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded font-bold">-</button>
                      <span className="font-bold">{cotizacion.banosCompletos}</span>
                      <button type="button" onClick={() => setCotizacion({ ...cotizacion, banosCompletos: cotizacion.banosCompletos + 1 })} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded font-bold">+</button>
                    </div>
                  </div>

                  <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Medios Baños</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <button type="button" onClick={() => setCotizacion({ ...cotizacion, mediosBanos: Math.max(0, cotizacion.mediosBanos - 1) })} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded font-bold">-</button>
                      <span className="font-bold">{cotizacion.mediosBanos}</span>
                      <button type="button" onClick={() => setCotizacion({ ...cotizacion, mediosBanos: cotizacion.mediosBanos + 1 })} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded font-bold">+</button>
                    </div>
                  </div>
                </div>

                {/* Ambientes Complementarios */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <label className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <input type="checkbox" checked={cotizacion.estudio} onChange={e => setCotizacion({ ...cotizacion, estudio: e.target.checked })} className="accent-amber-500 rounded" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Estudio / Home Office (+ $600)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <input type="checkbox" checked={cotizacion.salaTv} onChange={e => setCotizacion({ ...cotizacion, salaTv: e.target.checked })} className="accent-amber-500 rounded" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Sala de TV / Estar (+ $700)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <input type="checkbox" checked={cotizacion.lavanderia} onChange={e => setCotizacion({ ...cotizacion, lavanderia: e.target.checked })} className="accent-amber-500 rounded" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Cuarto Lavandería (+ $600)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: WELLNESS, RECREACIÓN Y EXTERIORES */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center">6</span>
                <label className="text-sm font-black text-slate-900 dark:text-white">Wellness, Recreación y Obras Exteriores</label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3 border-2 border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" checked={cotizacion.zonaBbq} onChange={e => setCotizacion({ ...cotizacion, zonaBbq: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Flame size={14} className="text-amber-500" /> Zona BBQ / Pérgola Exterior
                      </span>
                      <span className="text-[10px] text-slate-400">Pérgola, asador empotrado y mesón de preparación.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">+$2,800</span>
                </label>

                <label className="flex items-center justify-between p-3 border-2 border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" checked={cotizacion.jacuzzi} onChange={e => setCotizacion({ ...cotizacion, jacuzzi: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Waves size={14} className="text-cyan-500" /> Jacuzzi / Hidromasaje
                      </span>
                      <span className="text-[10px] text-slate-400">4-6 personas con calentador, bombas y deck WPC.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">+$4,200</span>
                </label>

                <label className="flex items-center justify-between p-3 border-2 border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" checked={cotizacion.piscina} onChange={e => setCotizacion({ ...cotizacion, piscina: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Waves size={14} className="text-blue-500" /> Construcción de Piscina
                      </span>
                      <span className="text-[10px] text-slate-400">Hormigón armado, gres antideslizante y equipo de filtrado.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">+$12,000</span>
                </label>

                <label className="flex items-center justify-between p-3 border-2 border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" checked={cotizacion.terrazaRooftop} onChange={e => setCotizacion({ ...cotizacion, terrazaRooftop: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Home size={14} className="text-purple-500" /> Terraza Accesible / Roof Top
                      </span>
                      <span className="text-[10px] text-slate-400">Impermeabilización multicapa, porcelanato exterior y baranda.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">+$1,800</span>
                </label>
              </div>

              {/* Cerramiento, Cisterna, Garaje y Climatización */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Cerramiento (ml)</label>
                  <input type="number" min="0" value={cotizacion.cerramientoMl} onChange={e => setCotizacion({ ...cotizacion, cerramientoMl: Number(e.target.value) })} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-mono" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Garaje</label>
                  <select value={cotizacion.garaje} onChange={e => setCotizacion({ ...cotizacion, garaje: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs">
                    <option value="ninguno">Ninguno</option>
                    <option value="descubierto">Piso Descubierto</option>
                    <option value="cubierto">Losa Cubierta (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Cisterna Subt.</label>
                  <select value={cotizacion.cisterna ? "si" : "no"} onChange={e => setCotizacion({ ...cotizacion, cisterna: e.target.value === "si" })} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs">
                    <option value="si">Sí (+ Bomba)</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Climatización</label>
                  <select value={cotizacion.climatizacion} onChange={e => setCotizacion({ ...cotizacion, climatizacion: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs">
                    <option value="ninguna">Preinstalación</option>
                    <option value="splits">Equipos Splits (+)</option>
                    <option value="central">Centralizado (++)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BOTÓN SECUNDARIO GUARDAR */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => handleSaveQuote(resultados)}
                disabled={savingQuote || !selectedClienteId}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <Save size={15} /> {savingQuote ? 'Guardando...' : 'Guardar Cotización en Historial'}
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA: DASHBOARDS EN VIVO, AUDITORÍA AGÉNTICA & EXPORTACIÓN (5 cols) */}
          <div className="lg:col-span-5 space-y-5 sticky top-4">
            
            {/* 1. TARJETA RESUMEN DE INVERSIÓN CON BOTONES DESTACADOS */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-amber-500/30 p-5 space-y-4">
              
              {/* Encabezado con Gran Total Proyectado */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 space-y-1 shadow-md">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                  <span>Gran Total Referencial Proyectado</span>
                  <span className="text-[11px] font-mono bg-slate-950/20 px-2 py-0.5 rounded font-bold">IVA 15% Incluido</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono">
                  ${resultados?.granTotalConIva.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-bold">USD</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-900/90 pt-1 border-t border-slate-950/10">
                  <span>Subtotal Neto: ${resultados?.subtotalGeneral.toLocaleString()}</span>
                  <span>IVA (15%): ${resultados?.ivaEstimado.toLocaleString()}</span>
                </div>
              </div>

              {/* Banner de Bonificación Concedida si existe */}
              {(resultados?.totalAhorroConsultoria || 0) > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Gift size={14} className="text-emerald-600" /> Bonificación Comercial Aplicada:
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                    -${resultados?.totalAhorroConsultoria.toLocaleString()} USD
                  </span>
                </div>
              )}

              {/* BOTONES ESTRATÉGICOS DE DESCARGA RÁPIDA (EN EL RESUMEN) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button 
                  onClick={handleExportExcel}
                  className="w-full py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  title="Descargar presupuesto referencial en Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet size={16} />
                  <span>Exportar Excel (.xlsx)</span>
                </button>

                <button 
                  onClick={handleExportPDF}
                  className="w-full py-3 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-slate-700"
                  title="Descargar propuesta técnica en PDF oficial con membrete"
                >
                  <Download size={16} />
                  <span>Exportar PDF</span>
                </button>
              </div>

              {/* BOTÓN PUENTE: CONVERTIR A PRESUPUESTO REAL EN LA MESA APU */}
              <button
                type="button"
                onClick={handleConvertirAPU}
                disabled={isConvertingToApu}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isConvertingToApu ? 'Transfiriendo y Generando APUs...' : '🚀 Convertir a Presupuesto Real en la Mesa APU'}</span>
                <ArrowRight size={16} />
              </button>

              {/* Desglose Rápido Módulo 1 y Módulo 2 */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Módulo 1: Consultoría & Permisos GAD</span>
                    <span className="text-[10px] text-slate-400">
                      Arquitectura, Estructura NEC, GAD {cotizacion.canton}
                    </span>
                  </div>
                  <div className="text-right">
                    {resultados && resultados.totalAhorroConsultoria > 0 && (
                      <span className="text-[10px] text-slate-400 line-through font-mono block">
                        ${resultados.totalHonorariosRef.toLocaleString()}
                      </span>
                    )}
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${resultados?.totalHonorarios.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Módulo 2: Ejecución de Obra (CD + AIU)</span>
                    <span className="text-[10px] text-slate-400">Costo directo + Gastos Admin, Imprevistos y Utilidad</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    ${resultados?.costoObra.toLocaleString()}
                  </span>
                </div>

                {/* Desglose Transparente de Costo Directo e Indirectos AIU */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-800 dark:text-white">
                      <Calculator size={13} className="text-blue-500" /> Costo Directo de Obra (CD):
                    </span>
                    <span className="font-mono font-black text-slate-900 dark:text-white">
                      ${resultados?.costoObraDirecto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700/60 pt-2 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>• Gastos Administrativos & Residencia ({resultados?.pctAdmin}%):</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        ${resultados?.montoAdmin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>• Imprevistos y Contingencias ({resultados?.pctImprev}%):</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        ${resultados?.montoImprevistos.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>• Margen de Utilidad Constructora SARA ({resultados?.pctUtil}%):</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        ${resultados?.montoUtilidad.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 dark:border-slate-700/60 text-amber-700 dark:text-amber-300">
                      <span>Subtotal Indirectos AIU ({resultados?.pctAiuTotal}%):</span>
                      <span className="font-mono font-black">
                        +${resultados?.montoAiuTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Botón para calibrar % AIU */}
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAiuEditor(!showAiuEditor)}
                      className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Settings size={11} />
                      {showAiuEditor ? 'Cerrar Ajustes AIU' : 'Calibrar % AIU (Admin/Imprev/Util)'}
                    </button>
                  </div>

                  {showAiuEditor && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-500/20 text-center">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Admin %</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={aiuConfig.porcentajeAdmin}
                          onChange={e => setAiuConfig({ ...aiuConfig, porcentajeAdmin: Number(e.target.value) || 0 })}
                          className="w-full text-center p-1 text-[11px] font-mono border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Imprevistos %</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={aiuConfig.porcentajeImprevistos}
                          onChange={e => setAiuConfig({ ...aiuConfig, porcentajeImprevistos: Number(e.target.value) || 0 })}
                          className="w-full text-center p-1 text-[11px] font-mono border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Utilidad %</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={aiuConfig.porcentajeUtilidad}
                          onChange={e => setAiuConfig({ ...aiuConfig, porcentajeUtilidad: Number(e.target.value) || 0 })}
                          className="w-full text-center p-1 text-[11px] font-mono border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. AUDITORÍA AGÉNTICA EN VIVO: ¿QUIÉN CALCULA CADA VALOR? */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Auditoría Agéntica en Vivo • Grupo SARA
                    </h3>
                    <p className="text-[10px] text-slate-400">Cálculos distribuidos en la red de 8 agentes especializados</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAgentModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Cpu size={12} /> Ver Red Completa
                </button>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-cyan-300">
                    <span className="flex items-center gap-1.5"><HardHat size={13} /> SARA-Constructora (Ingeniería Sísmica)</span>
                    <span className="text-[10px] font-mono text-cyan-400">Activo</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Aplica la norma NEC-SE-DS para <strong>{cotizacion.canton} ({resultados?.calib.zonaSismicaNEC})</strong> con factor estructural <strong>x{resultados?.fEstructura}</strong>.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span className="flex items-center gap-1.5"><ShoppingBag size={13} /> SARA-Marketplace (Precios de Mercado)</span>
                    <span className="text-[10px] font-mono text-emerald-400">INEC 2026</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Canasta de insumos calibrada en <strong>{cotizacion.provincia}</strong>: Cemento Selvalegre/Holcim, Acero Adelca, áridos y porcelanatos.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span className="flex items-center gap-1.5"><Layers size={13} /> SARA-APU (Banco de Recetas)</span>
                    <span className="text-[10px] font-mono text-amber-400">Histórico</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Rendimientos de cuadrilla ajustados por topografía <strong>{cotizacion.pendiente}</strong> y altura en <strong>{cotizacion.pisos} plantas</strong>.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-purple-300">
                    <span className="flex items-center gap-1.5"><Truck size={13} /> SARA-Fletes (Logística Territorial)</span>
                    <span className="text-[10px] font-mono text-purple-400">Factor x{resultados?.fRegional}</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Acarreo y flete interprovincial computado para accesibilidad <strong>{cotizacion.accesibilidad}</strong> en {cotizacion.canton}.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. TARJETA DE SALVEDAD COMERCIAL Y VALIDEZ LEGAL */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Cláusula Legal y Salvedad Comercial</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-950 dark:text-amber-100/90 font-medium">
                {CLAUSULA_LEGAL_SALVEDAD}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* PESTAÑA HISTORIAL DE COTIZACIONES */}
      {activeTab === 'historial' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Historial de Cotizaciones Emitidas
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {historialCotizaciones.length} cotizaciones registradas
            </span>
          </div>

          {historialCotizaciones.length === 0 ? (
            <div className="text-center text-slate-500 py-12 text-sm">
              No hay cotizaciones guardadas en el historial todavía.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-black uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl">Fecha</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Proyecto / Ubicación</th>
                    <th className="px-4 py-3 text-right">Área</th>
                    <th className="px-4 py-3 text-right">Consultoría & GAD</th>
                    <th className="px-4 py-3 text-right">Obra Paramétrica</th>
                    <th className="px-4 py-3 text-right">Gran Total Estimado</th>
                    <th className="px-4 py-3 text-center rounded-tr-xl">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {historialCotizaciones.map((c: any) => {
                    const det = c.detalles_json || {};
                    const totalCons = Number(c.total_consultoria) || 0;
                    const totalOb = Number(c.total_obra) || 0;
                    const sub = totalCons + totalOb;
                    const grand = Number(det.gran_total_con_iva || (sub * 1.15));
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500">{new Date(c.created_at).toLocaleDateString('es-ES')}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{c.clientes?.nombre} {c.clientes?.apellido}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          <div className="font-bold">{c.nombre_proyecto || 'Sin título'}</div>
                          {det.canton && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              📍 {det.canton}, {det.provincia}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">{c.area_construccion} m²</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">${totalCons.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">${totalOb.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right font-mono font-black text-amber-600 dark:text-amber-400">${grand.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetalleModalCotizacion(c)}
                              className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                              title="Ver desglose y detalle completo del presupuesto"
                            >
                              <Eye size={13} />
                              <span className="hidden sm:inline">Detalle</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCargarCotizacionEnCotizador(c)}
                              className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                              title="Cargar y editar en el Cotizador Paramétrico"
                            >
                              <Edit3 size={13} />
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminarCotizacion(c.id, c.nombre_proyecto)}
                              className="p-1 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                              title="Eliminar del historial"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETALLE DE COTIZACIÓN HISTÓRICA */}
      {detalleModalCotizacion && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Ficha Técnica • Cotización Registrada
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {detalleModalCotizacion.nombre_proyecto || 'Sin Título'}
                </h3>
                <p className="text-xs text-slate-500">
                  Cliente: <strong className="text-slate-700 dark:text-slate-300">{detalleModalCotizacion.clientes?.nombre} {detalleModalCotizacion.clientes?.apellido}</strong> • {new Date(detalleModalCotizacion.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              <button 
                onClick={() => setDetalleModalCotizacion(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Parámetros Generales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Ubicación</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {detalleModalCotizacion.detalles_json?.canton || 'Quito'}, {detalleModalCotizacion.detalles_json?.provincia || 'Pichincha'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Área Construcción</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {detalleModalCotizacion.area_construccion} m²
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Sistema Estructural</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {detalleModalCotizacion.detalles_json?.estructura || 'Hormigón'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Gama Acabados</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {detalleModalCotizacion.detalles_json?.acabados || 'Estándar'}
                  </span>
                </div>
              </div>

              {/* Distribución y Extras */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  Distribución y Espacios Incluidos
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    🛏️ {detalleModalCotizacion.detalles_json?.cuartosMaster || 1} Máster + {detalleModalCotizacion.detalles_json?.cuartosNormales || 2} Dorm.
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    🚿 {detalleModalCotizacion.detalles_json?.banosCompletos || 2} Baños completos + {detalleModalCotizacion.detalles_json?.mediosBanos || 1} Social
                  </span>
                  {detalleModalCotizacion.detalles_json?.zonaBbq && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      🔥 Zona BBQ
                    </span>
                  )}
                  {detalleModalCotizacion.detalles_json?.jacuzzi && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                      🫧 Jacuzzi
                    </span>
                  )}
                  {detalleModalCotizacion.detalles_json?.piscina && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                      🏊 Piscina
                    </span>
                  )}
                  {detalleModalCotizacion.detalles_json?.terrazaRooftop && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      🏢 Terraza Roof Top
                    </span>
                  )}
                  {detalleModalCotizacion.detalles_json?.cerramientoMl > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      🧱 {detalleModalCotizacion.detalles_json?.cerramientoMl} ml cerramiento
                    </span>
                  )}
                </div>
              </div>

              {/* Resumen Económico */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300 border-b border-white/10 pb-2">
                  <span>Módulo 1: Consultoría & Permisos GAD</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ${Number(detalleModalCotizacion.total_consultoria || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Módulo 2: Costo Directo de Obra (CD)</span>
                  <span className="font-mono text-slate-200">
                    ${Number(detalleModalCotizacion.detalles_json?.costo_directo || (Number(detalleModalCotizacion.total_obra || 0) * 0.833)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-amber-300 border-b border-white/10 pb-2">
                  <span>Módulo 2: Indirectos y Utilidad (AIU)</span>
                  <span className="font-mono text-amber-300 font-bold">
                    +${Number(detalleModalCotizacion.detalles_json?.monto_aiu_total || (Number(detalleModalCotizacion.total_obra || 0) * 0.167)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>Total Módulo 2 (Ejecución de Obra)</span>
                  <span className="font-mono text-white font-bold">
                    ${Number(detalleModalCotizacion.total_obra || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-white/15 text-amber-400">
                  <span>Gran Total con IVA (15%)</span>
                  <span className="font-mono text-base font-black">
                    ${Number(detalleModalCotizacion.detalles_json?.gran_total_con_iva || ((Number(detalleModalCotizacion.total_consultoria || 0) + Number(detalleModalCotizacion.total_obra || 0)) * 1.15)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => handleEliminarCotizacion(detalleModalCotizacion.id, detalleModalCotizacion.nombre_proyecto)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Eliminar Cotización
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetalleModalCotizacion(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => handleCargarCotizacionEnCotizador(detalleModalCotizacion)}
                  className="px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Edit3 size={14} /> Cargar y Editar en Cotizador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR CLIENTE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Crear Cuenta de Cliente</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nombre *</label>
                  <input required type="text" placeholder="Ej. Carlos" value={clientFormData.nombre} onChange={e => setClientFormData({ ...clientFormData, nombre: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Apellido *</label>
                  <input required type="text" placeholder="Ej. Mendoza" value={clientFormData.apellido} onChange={e => setClientFormData({ ...clientFormData, apellido: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Correo Electrónico *</label>
                <input required type="email" placeholder="carlos@ejemplo.com" value={clientFormData.email} onChange={e => setClientFormData({ ...clientFormData, email: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Teléfono / WhatsApp</label>
                <input type="text" placeholder="Ej. 098 765 4321" value={clientFormData.telefono} onChange={e => setClientFormData({ ...clientFormData, telefono: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Contraseña Temporal *</label>
                <input required type="text" placeholder="Ej. Sara2026" value={clientFormData.password} onChange={e => setClientFormData({ ...clientFormData, password: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl font-black text-xs transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Creando...' : 'Crear y Vincular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE LA RED DE AGENTES IA */}
      <CotizadorAgentNetworkModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        projectData={{
          nombreProyecto: cotizacion.nombreProyecto || `Proyecto en ${cotizacion.canton}`,
          nombreCliente: cotizacion.nombreCliente || "Cliente General",
          areaM2: Number(cotizacion.areaConstruccion) || 120,
          estructura: cotizacion.estructura,
          acabados: cotizacion.acabados,
          pisos: cotizacion.pisos,
          costoObra: resultados?.costoObra || 0,
          totalHonorarios: resultados?.totalHonorarios || 0,
          costoTotalConIva: Math.round(resultados?.granTotalConIva || 0)
        }}
      />
    </div>
  );
}
