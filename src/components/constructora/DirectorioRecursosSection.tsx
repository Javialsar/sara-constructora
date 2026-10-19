'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  HardHat, 
  Truck, 
  ShoppingCart, 
  ShieldCheck, 
  Search, 
  Plus, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Eye,
  EyeOff,
  UserCheck,
  FileText,
  X,
  Layers,
  Award,
  History,
  Calendar,
  Send,
  Check,
  PackageCheck,
  Shield,
  Info,
  Boxes,
  HelpCircle,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Key,
  Copy,
  Lock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { exportarAExcel, exportarAPDF } from '@/lib/services/exportReports';

// -----------------------------------------------------------------------------
// INTERFACES DEL MODELO DE DATOS
// -----------------------------------------------------------------------------
export interface ProductoProveedor {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: string;
  unidad: string;
  precio_unitario: number;
  disponibilidad: string;
  norma_tecnica?: string;
  descuento_volumen?: string;
}

export interface HistorialObra {
  id: string;
  obra: string;
  ubicacion: string;
  rol: string;
  periodo: string;
  horas_registradas: number;
  fiscalizador: string;
  calificacion: number;
  dictamen: string;
}

export interface TrabajadorCompleto {
  id: string;
  nombre_completo: string;
  cedula: string;
  categoria_ocupacional: string;
  jornal_real: number;
  costo_horario: number;
  especialidad: string;
  estado_iess: string;
  calificacion: number;
  total_obras: number;
  anios_experiencia: number;
  acreditaciones: string[];
  habilidades_clave: string[];
  historial_obras: HistorialObra[];
  estado_requerimiento?: 'disponible' | 'requerido' | 'confirmado';
}

export interface ProveedorCompleto {
  id: string;
  razon_social: string;
  ruc: string;
  categoria: string;
  ciudad: string;
  dias_credito: number;
  contacto: string;
  calificacion: string;
  productos: ProductoProveedor[];
}

export interface ClienteCompleto {
  id: string;
  nombre: string;
  representante: string;
  identificacion: string;
  email: string;
  clave_acceso: string;
  obra_asignada: string;
  monto_contrato: number;
  estado: 'activo' | 'suspendido' | 'finalizado';
  telefono: string;
  fecha_registro?: string;
  acceso_portal_habilitado: boolean;
}

// -----------------------------------------------------------------------------
// CATÁLOGO MAESTRO DE PRODUCTOS POR PROVEEDOR (GRUPO SARA & ECUADOR)
// -----------------------------------------------------------------------------
const CATALOGO_PROVEEDORES: Record<string, ProductoProveedor[]> = {
  'pr-01': [ // ADELCA Aceros del Ecuador C.A.
    {
      id: 'p-ad-01',
      codigo: 'AC-ADEL-10MM',
      descripcion: 'Varilla corrugada de acero 10mm x 12m soldable calidad ASTM A706 / Fy=420 MPa',
      tipo: 'Acero Estructural de Refuerzo',
      unidad: 'Varilla 12m',
      precio_unitario: 7.85,
      disponibilidad: 'En Bodega (1,450 varillas)',
      norma_tecnica: 'NTE INEN 2167 / ASTM A706',
      descuento_volumen: '5% a partir de 20 quintales'
    },
    {
      id: 'p-ad-02',
      codigo: 'AC-ADEL-12MM',
      descripcion: 'Varilla corrugada de acero 12mm x 12m soldable calidad ASTM A706 / Fy=420 MPa',
      tipo: 'Acero Estructural de Refuerzo',
      unidad: 'Varilla 12m',
      precio_unitario: 11.35,
      disponibilidad: 'En Bodega (2,100 varillas)',
      norma_tecnica: 'NTE INEN 2167 / ASTM A706',
      descuento_volumen: '7% a partir de 50 quintales'
    },
    {
      id: 'p-ad-03',
      codigo: 'AC-ADEL-16MM',
      descripcion: 'Varilla corrugada de acero 16mm x 12m para columnas principales y vigas sismorresistentes',
      tipo: 'Acero Estructural de Refuerzo',
      unidad: 'Varilla 12m',
      precio_unitario: 20.20,
      disponibilidad: 'En Bodega (850 varillas)',
      norma_tecnica: 'NTE INEN 2167 / ASTM A706',
      descuento_volumen: '6% a partir de 30 quintales'
    },
    {
      id: 'p-ad-04',
      codigo: 'AC-ADEL-AL18',
      descripcion: 'Alambre recocido negro calibre 18 para amarre de armaduras y estribos',
      tipo: 'Alambres y Fijación',
      unidad: 'Rollo 50kg',
      precio_unitario: 68.50,
      disponibilidad: 'Inmediato (90 rollos)',
      norma_tecnica: 'NTE INEN 1511',
      descuento_volumen: '3% por palet'
    },
    {
      id: 'p-ad-05',
      codigo: 'AC-ADEL-MR188',
      descripcion: 'Malla electrosoldada estándar R-188 (cuadrícula 15x15 cm - alambre 6mm)',
      tipo: 'Mallas Electrosoldadas',
      unidad: 'Panel 6.00 x 2.40m',
      precio_unitario: 38.90,
      disponibilidad: 'En Bodega (160 paneles)',
      norma_tecnica: 'NTE INEN 2209 / ASTM A1064',
      descuento_volumen: '8% en paquetes de 20 u.'
    },
    {
      id: 'p-ad-06',
      codigo: 'AC-ADEL-CLAVO',
      descripcion: 'Clavos de acero con cabeza 2.5" para encofrado y madera estructural',
      tipo: 'Fijación y Clavería',
      unidad: 'Caja 25kg',
      precio_unitario: 32.00,
      disponibilidad: 'Inmediato (110 cajas)',
      norma_tecnica: 'INEN 504',
      descuento_volumen: '5% a partir de 10 cajas'
    }
  ],
  'pr-02': [ // HOLCIM Ecuador S.A.
    {
      id: 'p-hl-01',
      codigo: 'CM-HOLC-F50',
      descripcion: 'Cemento Portland Tipo GU Especial Obra Holcim Fuerte 50kg (Mayor durabilidad y fraguado controlado)',
      tipo: 'Cemento y Aglomerantes',
      unidad: 'Saco 50kg',
      precio_unitario: 8.45,
      disponibilidad: 'Planta Loja / Despacho Diario',
      norma_tecnica: 'NTE INEN 2380 / ASTM C1157',
      descuento_volumen: '9% en pedidos > 1,000 sacos'
    },
    {
      id: 'p-hl-02',
      codigo: 'CM-HOLC-PREM',
      descripcion: 'Cemento Holcim Premium Alta Resistencia Temprana Tipo HE para desencofrado rápido en losas',
      tipo: 'Cemento Estructural',
      unidad: 'Saco 50kg',
      precio_unitario: 9.60,
      disponibilidad: 'Bajo Pedido (48h)',
      norma_tecnica: 'NTE INEN 2380 / ASTM C1157 Tipo HE',
      descuento_volumen: '5% a partir de 500 sacos'
    },
    {
      id: 'p-hl-03',
      codigo: 'HR-HOLC-210',
      descripcion: 'Hormigón Premezclado Bombeado f\'c = 210 kg/cm² (Asentamiento 4", Tamaño Máximo Árido 3/4")',
      tipo: 'Concreto Premezclado',
      unidad: 'm³ con Bomba',
      precio_unitario: 94.50,
      disponibilidad: 'Mixer 8m³ en Planta',
      norma_tecnica: 'ASTM C94 / NEC-SE-HM',
      descuento_volumen: 'Tarifa corporativa Grupo SARA'
    },
    {
      id: 'p-hl-04',
      codigo: 'HR-HOLC-280',
      descripcion: 'Hormigón Premezclado Bombeado f\'c = 280 kg/cm² para elementos sismo-resistentes y columnas',
      tipo: 'Concreto Premezclado',
      unidad: 'm³ con Bomba',
      precio_unitario: 105.00,
      disponibilidad: 'Mixer 8m³ en Planta',
      norma_tecnica: 'ASTM C94 / NEC-SE-HM',
      descuento_volumen: 'Tarifa corporativa Grupo SARA'
    },
    {
      id: 'p-hl-05',
      codigo: 'AG-HOLC-ARLA',
      descripcion: 'Arena Lavada Clasificada de Río para Mortero y Hormigón (Sin impurezas orgánicas)',
      tipo: 'Áridos y Agregados',
      unidad: 'm³',
      precio_unitario: 18.50,
      disponibilidad: 'Cantera Certificada',
      norma_tecnica: 'ASTM C33',
      descuento_volumen: 'Descuento por volqueta 14m³'
    },
    {
      id: 'p-hl-06',
      codigo: 'AG-HOLC-GR34',
      descripcion: 'Grava Triturada Basáltica Azul 3/4" limpia para mezclas estructurales',
      tipo: 'Áridos y Agregados',
      unidad: 'm³',
      precio_unitario: 22.00,
      disponibilidad: 'Cantera Certificada',
      norma_tecnica: 'ASTM C33',
      descuento_volumen: 'Descuento por volqueta 14m³'
    }
  ],
  'pr-03': [ // DISENSA Red de Materiales Loja
    {
      id: 'p-ds-01',
      codigo: 'BQ-DIS-1520',
      descripcion: 'Bloque de Concreto Vibroprensado 15x20x40cm Resistencia Carga 3.5 MPa',
      tipo: 'Mampostería y Bloques',
      unidad: 'Unidad',
      precio_unitario: 0.65,
      disponibilidad: 'En Patio (14,000 unidades)',
      norma_tecnica: 'NTE INEN 643',
      descuento_volumen: '$0.59 a partir de 3,000 u.'
    },
    {
      id: 'p-ds-02',
      codigo: 'BQ-DIS-2020',
      descripcion: 'Bloque Estructural de Concreto 20x20x40cm Resistencia Carga 5.0 MPa',
      tipo: 'Mampostería Estructural',
      unidad: 'Unidad',
      precio_unitario: 0.85,
      disponibilidad: 'En Patio (7,200 unidades)',
      norma_tecnica: 'NTE INEN 643',
      descuento_volumen: '$0.78 a partir de 2,000 u.'
    },
    {
      id: 'p-ds-03',
      codigo: 'LD-DIS-MAMB',
      descripcion: 'Ladrillo Cerámico Prensado Mambrón Rústico 6x12x24cm para Muros Vistos',
      tipo: 'Mampostería Cerámica',
      unidad: 'Unidad',
      precio_unitario: 0.28,
      disponibilidad: 'En Stock (25,000 unidades)',
      norma_tecnica: 'NTE INEN 293',
      descuento_volumen: 'Envío incluido > 5,000 u.'
    },
    {
      id: 'p-ds-04',
      codigo: 'TU-DIS-SAN110',
      descripcion: 'Tubería Sanitaria PVC Pesada 110mm x 3m Unión Espiga/Campana con Anillo de Caucho',
      tipo: 'Tuberías y Evacuación',
      unidad: 'Tubo 3m',
      precio_unitario: 14.20,
      disponibilidad: 'En Bodega (280 tubos)',
      norma_tecnica: 'NTE INEN 1374',
      descuento_volumen: '10% por atado de 10 u.'
    },
    {
      id: 'p-ds-05',
      codigo: 'TU-DIS-DES50',
      descripcion: 'Tubería PVC Desagüe 50mm x 3m (2") para lavamanos, duchas y fregaderos',
      tipo: 'Tuberías y Evacuación',
      unidad: 'Tubo 3m',
      precio_unitario: 6.90,
      disponibilidad: 'En Bodega (420 tubos)',
      norma_tecnica: 'NTE INEN 1374',
      descuento_volumen: '8% en atado'
    },
    {
      id: 'p-ds-06',
      codigo: 'QU-DIS-PEGPVC',
      descripcion: 'Soldadura Líquida Pegamento para PVC Tarro 1/4 Galón (946ml) con aplicador',
      tipo: 'Adhesivos y Químicos',
      unidad: 'Tarro 946ml',
      precio_unitario: 12.50,
      disponibilidad: 'En Bodega (80 unidades)',
      norma_tecnica: 'ASTM D2564',
      descuento_volumen: '5% por caja de 6'
    }
  ],
  'pr-04': [ // RIVAL Sistemas Plásticos
    {
      id: 'p-rv-01',
      codigo: 'TU-RIV-PR12',
      descripcion: 'Tubería PVC Presión 1/2" (21mm) RDE 13.5 x 6m para Red de Agua Potable Fría',
      tipo: 'Agua Potable Presión',
      unidad: 'Tubo 6m',
      precio_unitario: 5.40,
      disponibilidad: 'En Bodega Central',
      norma_tecnica: 'NTE INEN 1373',
      descuento_volumen: '10% por atado de 25 u.'
    },
    {
      id: 'p-rv-02',
      codigo: 'TU-RIV-PR34',
      descripcion: 'Tubería PVC Presión 3/4" (26mm) RDE 17 x 6m para acometidas principales',
      tipo: 'Agua Potable Presión',
      unidad: 'Tubo 6m',
      precio_unitario: 7.80,
      disponibilidad: 'En Bodega Central',
      norma_tecnica: 'NTE INEN 1373',
      descuento_volumen: '10% por atado de 20 u.'
    },
    {
      id: 'p-rv-03',
      codigo: 'TK-RIV-1000',
      descripcion: 'Tanque de Reserva de Agua Polietileno Tricapa Antibacterial 1000 Litros',
      tipo: 'Tanques y Almacenamiento',
      unidad: 'Unidad',
      precio_unitario: 135.00,
      disponibilidad: 'Stock Inmediato (35 tanques)',
      norma_tecnica: 'Grado Alimenticio FDA',
      descuento_volumen: 'Envío sin costo a obra'
    }
  ],
  'pr-05': [ // GRAIMAN Cerámicas y Porcelanatos
    {
      id: 'p-gr-01',
      codigo: 'PO-GRA-6060',
      descripcion: 'Porcelanato Esmaltado Rectificado 60x60cm Tráfico Comercial Alto Color Hueso/Gris',
      tipo: 'Pisos y Porcelanatos',
      unidad: 'm² (Caja 1.44m²)',
      precio_unitario: 16.50,
      disponibilidad: 'En Stock (950 m²)',
      norma_tecnica: 'ISO 13006 / INEN',
      descuento_volumen: '12% en compras > 200 m²'
    },
    {
      id: 'p-gr-02',
      codigo: 'PE-GRA-BLANCO',
      descripcion: 'Mortero Pegante Extra Fuerte Pegablanco Flexible para Porcelanatos y Mármol',
      tipo: 'Adhesivos y Pegantes',
      unidad: 'Saco 25kg',
      precio_unitario: 8.90,
      disponibilidad: 'En Bodega (450 sacos)',
      norma_tecnica: 'Norma C1TE / INEN',
      descuento_volumen: '8% por palet'
    }
  ],
  'pr-06': [ // PINTUCO Pinturas y Recubrimientos
    {
      id: 'p-pt-01',
      codigo: 'PT-PIN-VIN5',
      descripcion: 'Pintura Látex Viniltex Acrílica Tipo 1 Blanco Super Lavable Muros y Tumbados',
      tipo: 'Pinturas Arquitectónicas',
      unidad: 'Caneca 5 Galones',
      precio_unitario: 62.00,
      disponibilidad: 'En Bodega (95 canecas)',
      norma_tecnica: 'NTE INEN 1544 Tipo 1',
      descuento_volumen: '7% a partir de 5 canecas'
    },
    {
      id: 'p-pt-02',
      codigo: 'PT-PIN-ANTIC',
      descripcion: 'Pintura Anticorrosiva Alquídica Rojo Óxido para Protección de Estructuras Metálicas',
      tipo: 'Protección Anticorrosiva',
      unidad: 'Galón',
      precio_unitario: 19.50,
      disponibilidad: 'En Bodega (120 galones)',
      norma_tecnica: 'Resistencia Intemperie',
      descuento_volumen: '5% por caja de 4 galones'
    }
  ]
};

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------------------------
export function DirectorioRecursosSection({ user, initialSubTab = 'trabajadores' }: { user: any; initialSubTab?: 'trabajadores' | 'proveedores' | 'clientes' }) {
  const [subTab, setSubTab] = useState<'trabajadores' | 'proveedores' | 'clientes'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
  }, [initialSubTab]);

  const [trabajadores, setTrabajadores] = useState<TrabajadorCompleto[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorCompleto[]>([]);
  const [clientes, setClientes] = useState<ClienteCompleto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de interacción Agéntica
  const [agentNotice, setAgentNotice] = useState<string | null>(null);

  // Estados para Creación de Clientes y Credenciales de Acceso al Portal
  const [modalNuevoClienteOpen, setModalNuevoClienteOpen] = useState(false);
  const [showPasswordNewClient, setShowPasswordNewClient] = useState(false);
  const [showPasswordCard, setShowPasswordCard] = useState<Record<string, boolean>>({});
  const [credencialCopiadaId, setCredencialCopiadaId] = useState<string | null>(null);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [formNuevoCliente, setFormNuevoCliente] = useState({
    nombre: '',
    identificacion: '',
    representante: '',
    email: '',
    clave_acceso: '',
    telefono: '',
    obra_asignada: 'Edificio Residencial El Mirador (Loja)',
    monto_contrato: '',
    enviarNotificacion: true
  });

  // ---------------------------------------------------------------------------
  // ESTADOS PARA MODALES
  // ---------------------------------------------------------------------------
  // 1. Modal "Mis Productos" de Proveedor
  const [modalProductosOpen, setModalProductosOpen] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<ProveedorCompleto | null>(null);
  const [filtroProducto, setFiltroProducto] = useState('');
  const [noticiaProductoAgregado, setNoticiaProductoAgregado] = useState<string | null>(null);

  // 2. Modal "Flete Pesado MTOP"
  const [modalFleteOpen, setModalFleteOpen] = useState(false);
  const [proveedorParaFlete, setProveedorParaFlete] = useState<ProveedorCompleto | null>(null);
  const [obraDestinoFlete, setObraDestinoFlete] = useState('Edificio Residencial El Mirador (Loja)');
  const [tipoTransporteFlete, setTipoTransporteFlete] = useState<'volqueta_14m3' | 'plataforma_30t' | 'mixer_8m3'>('volqueta_14m3');
  const [fleteCalculadoExitoso, setFleteCalculadoExitoso] = useState(false);

  // 3. Modal "Ver Perfil & Historial del Profesional" (2 Viñetas)
  const [modalPerfilOpen, setModalPerfilOpen] = useState(false);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<TrabajadorCompleto | null>(null);
  const [vinetaPerfil, setVinetaPerfil] = useState<'ficha_tecnica' | 'historial_obras'>('ficha_tecnica');

  // 4. Modal "Requerir en Obra" (Conexión con SARA Talento)
  const [modalRequerirOpen, setModalRequerirOpen] = useState(false);
  const [trabajadorParaRequerir, setTrabajadorParaRequerir] = useState<TrabajadorCompleto | null>(null);
  const [obraDestinoRequerimiento, setObraDestinoRequerimiento] = useState('Edificio Residencial El Mirador (Loja)');
  const [fechaInicioRequerimiento, setFechaInicioRequerimiento] = useState('2026-11-01');
  const [duracionRequerimiento, setDuracionRequerimiento] = useState('3 meses (Fase Estructuras)');
  const [eppRequerido, setEppRequerido] = useState(true);
  const [enviandoRequerimiento, setEnviandoRequerimiento] = useState(false);
  const [requerimientoConfirmado, setRequerimientoConfirmado] = useState<{ id: string; fecha: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchDirectorioData();
  }, []);

  const fetchDirectorioData = async () => {
    setLoading(true);
    try {
      // 1. Trabajadores / Cuadrillas Enriquecidas con Calificaciones e Historial de Obras
      const trabsDefault: TrabajadorCompleto[] = [
        {
          id: 'tr-01',
          nombre_completo: 'Ing. Luis Castro',
          cedula: '112548****',
          categoria_ocupacional: 'Residente de Obra / Ing. Civil',
          jornal_real: 39.12,
          costo_horario: 4.89,
          especialidad: 'Control de Ensayos, Fiscalización & Cómputos BIM',
          estado_iess: 'Afiliado Sectorial Construcción CICS',
          calificacion: 4.9,
          total_obras: 18,
          anios_experiencia: 9,
          acreditaciones: [
            'Colegio de Ingenieros Civiles del Ecuador (CICE)',
            'Certificación Fiscalización de Obra Pública SERCOP',
            'Prevención de Riesgos IESS CD 513'
          ],
          habilidades_clave: [
            'Ensayos de Rotura de Probetas de Hormigón (ASTM C39)',
            'Control de Asentamiento Slump Test',
            'Cierre de Planillas de Avance con Fórmula Polinómica',
            'Modelado IFC 4 y compatibilización estructural'
          ],
          historial_obras: [
            {
              id: 'ho-01',
              obra: 'Edificio Residencial El Mirador (Loja)',
              ubicacion: 'Loja, San Cayetano',
              rol: 'Residente Principal de Estructuras',
              periodo: 'Nov 2025 - Ago 2026 (9 meses)',
              horas_registradas: 1580,
              fiscalizador: 'Ing. Gonzalo Benítez (SARA Fiscaliza)',
              calificacion: 5.0,
              dictamen: 'Excelente gestión de vaciados y tolerancias dimensionales en losas postensadas. Cero no-conformidades en fiscalización.'
            },
            {
              id: 'ho-02',
              obra: 'Torre Diamante Corporativa',
              ubicacion: 'Cuenca, El Vergel',
              rol: 'Ingeniero de Calidad y Ensayos',
              periodo: 'Ene 2025 - Oct 2025 (10 meses)',
              horas_registradas: 1720,
              fiscalizador: 'Arq. Mariana Vélez (Fiscalizadora General)',
              calificacion: 4.8,
              dictamen: 'Riguroso cumplimiento del plan de aseguramiento de calidad ASTM. Gestión óptima de bitácora electrónica.'
            }
          ],
          estado_requerimiento: 'disponible'
        },
        {
          id: 'tr-02',
          nombre_completo: 'Ing. Marcelo Valarezo',
          cedula: '123456****',
          categoria_ocupacional: 'Ingeniero Eléctrico / Redes Obra',
          jornal_real: 39.12,
          costo_horario: 4.89,
          especialidad: 'Instalaciones Media Tensión, Tableros & Puesta a Tierra',
          estado_iess: 'Afiliado Sectorial Construcción CICS',
          calificacion: 4.8,
          total_obras: 14,
          anios_experiencia: 8,
          acreditaciones: [
            'Ingeniero Eléctrico Registrado SENESCYT',
            'Acreditación Homologada EEASA / EERSSA',
            'Certificación Tableros Industriales Schneider / Siemens'
          ],
          habilidades_clave: [
            'Cálculo de Caída de Tensión y Mallas de Tierra',
            'Montaje de Transformadores Pad-Mounted',
            'Cableado Estructurado Certificado Categoría 6A/7',
            'Pruebas de Megado y Aislamiento Dieléctrico'
          ],
          historial_obras: [
            {
              id: 'ho-03',
              obra: 'Conjunto Habitacional Las Acacias (Cariamanga)',
              ubicacion: 'Calvas, Loja',
              rol: 'Jefe de Instalaciones Eléctricas e Iluminación',
              periodo: 'Feb 2025 - Sep 2025 (7 meses)',
              horas_registradas: 1240,
              fiscalizador: 'Ing. Rodrigo Paredes (Fiscalizador Eléctrico)',
              calificacion: 4.9,
              dictamen: 'Conexión impecable de transformador trifásico 75 kVA y acometidas subterráneas sin demoras en recepción técnica.'
            },
            {
              id: 'ho-04',
              obra: 'Centro Logístico SARA Fletes Sur',
              ubicacion: 'Catamayo, Parque Industrial',
              rol: 'Supervisor Eléctrico de Fuerza',
              periodo: 'Jun 2024 - Dic 2024 (6 meses)',
              horas_registradas: 980,
              fiscalizador: 'Ing. Luis Castro (Residente)',
              calificacion: 4.7,
              dictamen: 'Instalación de alimentadores para generador de emergencia 120 kVA cumpliendo código eléctrico NEC.'
            }
          ],
          estado_requerimiento: 'disponible'
        },
        {
          id: 'tr-03',
          nombre_completo: 'Andrea Tamayo',
          cedula: '111202****',
          categoria_ocupacional: 'Maestro de Obra General',
          jornal_real: 35.15,
          costo_horario: 4.39,
          especialidad: 'Encofrados Metálicos, Hormigones & Cuadrillas Pesadas',
          estado_iess: 'Certificación SECAP Vigente Nivel Experto',
          calificacion: 5.0,
          total_obras: 26,
          anios_experiencia: 14,
          acreditaciones: [
            'Certificado de Competencia Laboral SECAP - Maestro Mayor',
            'Certificado Andamios Seguros y Trabajos en Altura OSHA 30h',
            'Primeros Auxilios en Obras Civiles Cruz Roja'
          ],
          habilidades_clave: [
            'Liderazgo y dirección simultánea de 4 cuadrillas (22 obreros)',
            'Aplome y nivelación láser milimétrica en encofrados',
            'Control de desperdicio de hormigón a menos del 1.5%',
            'Cumplimiento de metas diarias de rendimiento APU'
          ],
          historial_obras: [
            {
              id: 'ho-05',
              obra: 'Urbanización Privada Las Palmeras',
              ubicacion: 'Loja, Sector La Argelia',
              rol: 'Maestro General de Obra Gruesa',
              periodo: 'Ene 2025 - Ago 2025 (8 meses)',
              horas_registradas: 1420,
              fiscalizador: 'Dra. María Elena Carrión (Gerente de Obra)',
              calificacion: 5.0,
              dictamen: 'Rendimiento superior al 115% del cronograma valorado. Cero accidentes laborales en 8 meses de trabajo continuo.'
            },
            {
              id: 'ho-06',
              obra: 'Hospital Básico Catamayo (Ampliación Pabellón)',
              ubicacion: 'Catamayo',
              rol: 'Maestro de Encofrados y Mampostería',
              periodo: 'Mar 2024 - Dic 2024 (9 meses)',
              horas_registradas: 1540,
              fiscalizador: 'Ing. Marcelo Valarezo',
              calificacion: 5.0,
              dictamen: 'Calidad inmejorable en caras de hormigón visto y colocación de mampostería modulada.'
            }
          ],
          estado_requerimiento: 'disponible'
        },
        {
          id: 'tr-04',
          nombre_completo: 'Carlos Morocho',
          cedula: '110398****',
          categoria_ocupacional: 'Fierrero Especialista / Armador',
          jornal_real: 28.50,
          costo_horario: 3.56,
          especialidad: 'Cortes, Doblez y Armado de Acero Estructural de Alta Dureza',
          estado_iess: 'Afiliado IESS Planilla 10/2026',
          calificacion: 4.7,
          total_obras: 19,
          anios_experiencia: 11,
          acreditaciones: [
            'Acreditación SECAP Armador de Estructuras de Hierro',
            'Capacitación Técnica ADELCA en Soldabilidad de Barras A706'
          ],
          habilidades_clave: [
            'Interpretación rápida de planos de planillas de hierros',
            'Optimización de despuntes de varillas (desperdicio < 3%)',
            'Armado de canastillas para zapatas y cabezales de pilotes',
            'Colocación precisa de separadores y recubrimientos mínimos'
          ],
          historial_obras: [
            {
              id: 'ho-07',
              obra: 'Puente Paso Lateral Loja - Tramo II',
              ubicacion: 'Loja Norte',
              rol: 'Fierrero Líder de Vigas Postensadas',
              periodo: 'May 2025 - Nov 2025 (6 meses)',
              horas_registradas: 1050,
              fiscalizador: 'Ing. MTOP Regional 7',
              calificacion: 4.8,
              dictamen: 'Precisión exacta en espaciamiento de estribos confinados bajo norma sismo-resistente NEC.'
            },
            {
              id: 'ho-08',
              obra: 'Edificio Residencial El Mirador (Loja)',
              ubicacion: 'San Cayetano',
              rol: 'Armador de Muros de Contención y Columnas',
              periodo: 'Nov 2025 - Mar 2026 (5 meses)',
              horas_registradas: 840,
              fiscalizador: 'Ing. Luis Castro (Residente)',
              calificacion: 4.7,
              dictamen: 'Excelente velocidad y prolijidad en el amarre de mallas dobles en sótanos.'
            }
          ],
          estado_requerimiento: 'disponible'
        }
      ];

      setTrabajadores(trabsDefault);

      // 2. Proveedores con Catálogo Enlazado
      const provsDefault: ProveedorCompleto[] = [
        {
          id: 'pr-01',
          razon_social: 'ADELCA Aceros del Ecuador C.A.',
          ruc: '1790012345001',
          categoria: 'Acero de Refuerzo & Mallas Electrosoldadas',
          ciudad: 'Quito / Distribución Sur Loja',
          dias_credito: 45,
          contacto: 'Ing. Rodrigo Paredes',
          calificacion: 'Proveedor Certificado INEN 2167',
          productos: CATALOGO_PROVEEDORES['pr-01'] || []
        },
        {
          id: 'pr-02',
          razon_social: 'HOLCIM Ecuador S.A.',
          ruc: '0990004589001',
          categoria: 'Cemento Portland & Hormigón Premezclado',
          ciudad: 'Guayaquil / Planta Loja',
          dias_credito: 30,
          contacto: 'Arq. Mariana Vélez',
          calificacion: 'Planta Calibrada ASTM C94 / INEN 2380',
          productos: CATALOGO_PROVEEDORES['pr-02'] || []
        },
        {
          id: 'pr-03',
          razon_social: 'DISENSA Red de Materiales Loja',
          ruc: '1102938475001',
          categoria: 'Bloques, Áridos, Tubería PVC & Pegantes',
          ciudad: 'Loja',
          dias_credito: 15,
          contacto: 'Lcdo. Jorge Sarango',
          calificacion: 'Despacho Inmediato a Pie de Obra',
          productos: CATALOGO_PROVEEDORES['pr-03'] || []
        },
        {
          id: 'pr-04',
          razon_social: 'RIVAL Sistemas Plásticos & Tuberías',
          ruc: '0190123485001',
          categoria: 'Tuberías PVC Presión, Desagüe & Tanques',
          ciudad: 'Cuenca / Despacho a Todo el País',
          dias_credito: 30,
          contacto: 'Ing. Fabrizzio Morales',
          calificacion: 'Calidad Hidráulica Certificada INEN 1373',
          productos: CATALOGO_PROVEEDORES['pr-04'] || []
        },
        {
          id: 'pr-05',
          razon_social: 'GRAIMAN Porcelanatos & Revestimientos',
          ruc: '0190034871001',
          categoria: 'Porcelanatos de Alto Tráfico & Pegantes C1TE',
          ciudad: 'Cuenca / Tiendas Nacionales',
          dias_credito: 30,
          contacto: 'Arq. Pamela Cárdenas',
          calificacion: 'Sello de Exportación ISO 13006',
          productos: CATALOGO_PROVEEDORES['pr-05'] || []
        },
        {
          id: 'pr-06',
          razon_social: 'PINTUCO Pinturas y Recubrimientos',
          ruc: '1790045982001',
          categoria: 'Látex Viniltex, Anticorrosivos & Selladores',
          ciudad: 'Quito / Loja',
          dias_credito: 30,
          contacto: 'Ing. Xavier Montalvo',
          calificacion: 'Líder en Pinturas Arquitectónicas INEN',
          productos: CATALOGO_PROVEEDORES['pr-06'] || []
        }
      ];

      setProveedores(provsDefault);

      // 3. Clientes Titulares con Credenciales Autenticadas Directas
      const clisDefault: ClienteCompleto[] = [
        {
          id: 'cl-01',
          nombre: 'Fideicomiso Inmobiliario El Mirador',
          representante: 'Dra. María Elena Carrión',
          identificacion: '1191728394001',
          email: 'elmirador.fideicomiso@gruposara.ec',
          clave_acceso: 'Sara-Mirador2026*',
          obra_asignada: 'Edificio Residencial El Mirador (Loja)',
          monto_contrato: 485200.0,
          estado: 'activo',
          telefono: '0998127364',
          fecha_registro: '2026-02-15',
          acceso_portal_habilitado: true
        },
        {
          id: 'cl-02',
          nombre: 'Asociación de Empleados de Calvas',
          representante: 'Ing. Gonzalo Benítez',
          identificacion: '1102938471',
          email: 'asoc.calvas@empleados.ec',
          clave_acceso: 'Sara-Calvas2026#',
          obra_asignada: 'Conjunto Habitacional Las Acacias (Cariamanga)',
          monto_contrato: 215000.0,
          estado: 'activo',
          telefono: '0981928374',
          fecha_registro: '2026-04-10',
          acceso_portal_habilitado: true
        },
      ];
      setClientes(clisDefault);

    } catch (e) {
      console.error('Error fetching directorio data:', e);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // MANEJADORES DE PROVEEDORES & PRODUCTOS
  // ---------------------------------------------------------------------------
  const handleAbrirMisProductos = (prov: ProveedorCompleto) => {
    setProveedorSeleccionado(prov);
    setFiltroProducto('');
    setNoticiaProductoAgregado(null);
    setModalProductosOpen(true);
  };

  const handleAgregarProductoCotizacion = (prod: ProductoProveedor) => {
    setNoticiaProductoAgregado(`✅ Insumo "${prod.codigo} - ${prod.descripcion.substring(0, 32)}..." agregado a la requisición corporativa.`);
    setAgentNotice(`🛒 SARA_PREDICTIVE_PURCHASE: Registrada intención de compra de "${prod.codigo}" (${prod.unidad}) a precio de lista $${prod.precio_unitario.toFixed(2)}.`);
    setTimeout(() => {
      setNoticiaProductoAgregado(null);
    }, 4000);
  };

  const handleAbrirFlete = (prov: ProveedorCompleto) => {
    setProveedorParaFlete(prov);
    setFleteCalculadoExitoso(false);
    setModalFleteOpen(true);
  };

  const handleCalcularFletePesado = () => {
    setFleteCalculadoExitoso(true);
    setAgentNotice(`🚚 SARA_HEAVY_FREIGHT: Ruta calculada para ${proveedorParaFlete?.razon_social} ➔ ${obraDestinoFlete} con camión ${tipoTransporteFlete.replace('_', ' ').toUpperCase()}. Se aplicó ahorro de retorno (Backhaul MTOP).`);
  };

  // ---------------------------------------------------------------------------
  // MANEJADORES DE TRABAJADORES (PERFIL & REQUERIR EN OBRA)
  // ---------------------------------------------------------------------------
  const handleAbrirPerfilTrabajador = (trab: TrabajadorCompleto, tabInicial: 'ficha_tecnica' | 'historial_obras' = 'ficha_tecnica') => {
    setTrabajadorSeleccionado(trab);
    setVinetaPerfil(tabInicial);
    setModalPerfilOpen(true);
  };

  const handleAbrirRequerirEnObra = (trab: TrabajadorCompleto) => {
    setTrabajadorParaRequerir(trab);
    setRequerimientoConfirmado(null);
    setModalRequerirOpen(true);
  };

  const handleConfirmarRequerimientoSARA = () => {
    if (!trabajadorParaRequerir) return;

    setEnviandoRequerimiento(true);

    setTimeout(() => {
      const nuevoIdReq = `REQ-TAL-${Date.now().toString().slice(-6)}`;
      const fechaActual = new Date().toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' });

      // Actualizar estado en el listado local de trabajadores
      setTrabajadores(prev => prev.map(t => {
        if (t.id === trabajadorParaRequerir.id) {
          return { ...t, estado_requerimiento: 'requerido' };
        }
        return t;
      }));

      setRequerimientoConfirmado({
        id: nuevoIdReq,
        fecha: fechaActual
      });

      setEnviandoRequerimiento(false);

      // Notificación agéntica global
      setAgentNotice(`📡 EVENTO SARA_TALENTO: Emitido requerimiento ${nuevoIdReq} para "${trabajadorParaRequerir.nombre_completo}" con destino a "${obraDestinoRequerimiento}". Mensaje SMS/WhatsApp institucional enviado al profesional para confirmación de plaza laboral.`);
    }, 1200);
  };

  // ===========================================================================
  // GESTIÓN DE CLIENTES & GENERACIÓN DE CLAVES DE ACCESO AL PORTAL
  // ===========================================================================
  const generarClaveAleatoria = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const clave = `Sara-${new Date().getFullYear()}-${rand}`;
    setFormNuevoCliente(prev => ({ ...prev, clave_acceso: clave }));
  };

  const handleAbrirModalNuevoCliente = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const claveInicial = `Sara-${new Date().getFullYear()}-${rand}`;
    setFormNuevoCliente({
      nombre: '',
      identificacion: '',
      representante: '',
      email: '',
      clave_acceso: claveInicial,
      telefono: '',
      obra_asignada: 'Edificio Residencial El Mirador (Loja)',
      monto_contrato: '',
      enviarNotificacion: true
    });
    setShowPasswordNewClient(true);
    setModalNuevoClienteOpen(true);
  };

  const handleGuardarNuevoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNuevoCliente.nombre.trim() || !formNuevoCliente.identificacion.trim() || !formNuevoCliente.email.trim() || !formNuevoCliente.clave_acceso.trim()) {
      alert('Por favor completa los campos obligatorios: Razón Social, RUC/Cédula, Email y Clave de acceso.');
      return;
    }

    const nuevoId = `cl-${Date.now().toString().slice(-4)}`;
    const nuevoCliente: ClienteCompleto = {
      id: nuevoId,
      nombre: formNuevoCliente.nombre.trim(),
      identificacion: formNuevoCliente.identificacion.trim(),
      representante: formNuevoCliente.representante.trim() || formNuevoCliente.nombre.trim(),
      email: formNuevoCliente.email.trim(),
      clave_acceso: formNuevoCliente.clave_acceso.trim(),
      telefono: formNuevoCliente.telefono.trim() || '0990000000',
      obra_asignada: formNuevoCliente.obra_asignada,
      monto_contrato: Number(formNuevoCliente.monto_contrato) || 0,
      estado: 'activo',
      fecha_registro: new Date().toLocaleDateString('es-EC'),
      acceso_portal_habilitado: true
    };

    setClientes(prev => [nuevoCliente, ...prev]);
    setModalNuevoClienteOpen(false);

    setAgentNotice(`🏛 SARA CLIENTES: Cliente "${nuevoCliente.nombre}" dado de alta con éxito. Usuario: ${nuevoCliente.email} | Clave: ${nuevoCliente.clave_acceso}. Ingreso directo activo al Portal de Clientes sin necesidad de autoregistro.`);
    alert(`¡Cliente "${nuevoCliente.nombre}" registrado exitosamente!\n\nCredenciales generadas para el portal:\n• Usuario (Email): ${nuevoCliente.email}\n• Contraseña de Acceso: ${nuevoCliente.clave_acceso}\n• Obra Asignada: ${nuevoCliente.obra_asignada}\n\nCon estos datos el cliente puede ingresar directamente al portal y no requiere realizar ningún proceso de registro.`);
  };

  const handleCopiarCredenciales = (c: ClienteCompleto) => {
    const texto = `🏛 CREDENCIALES OFICIALES DE ACCESO - PORTAL GRUPO SARA\n` +
      `==================================================\n` +
      `Cliente: ${c.nombre}\n` +
      `Representante: ${c.representante}\n` +
      `Identificación / RUC: ${c.identificacion}\n` +
      `Obra Asignada: ${c.obra_asignada}\n` +
      `Portal Web: https://sara-constructora.vercel.app/portal\n` +
      `Usuario (Email): ${c.email}\n` +
      `Clave de Acceso: ${c.clave_acceso}\n` +
      `Estado: Acceso Inmediato Activo (Sin registro previo)\n` +
      `==================================================`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(texto).then(() => {
        setCredencialCopiadaId(c.id);
        setTimeout(() => setCredencialCopiadaId(null), 2500);
      }).catch(() => {
        alert(texto);
      });
    } else {
      alert(texto);
    }
  };

  const handleToggleVerPassword = (clienteId: string) => {
    setShowPasswordCard(prev => ({
      ...prev,
      [clienteId]: !prev[clienteId]
    }));
  };

  // ===========================================================================
  // REPORTES OFICIALES EXCEL & PDF CON FIRMAS DE EMPRESA CONFIGURADAS
  // ===========================================================================
  const handleExportarPersonal = (formato: 'excel' | 'pdf') => {
    if (trabajadores.length === 0) return alert('No hay trabajadores para exportar.');
    if (formato === 'excel') {
      const datosExcel = trabajadores.map(t => ({
        'ID': t.id,
        'Nombre Completo': t.nombre_completo,
        'Cédula / Identificación': t.cedula,
        'Categoría Ocupacional': t.categoria_ocupacional,
        'Especialidad': t.especialidad,
        'Jornal Real ($)': t.jornal_real.toFixed(2),
        'Costo Hora ($)': t.costo_horario.toFixed(2),
        'Calificación (Estrellas)': `${t.calificacion} / 5.0`,
        'Total Obras': t.total_obras,
        'Años Experiencia': t.anios_experiencia,
        'Estado IESS / SECAP': t.estado_iess
      }));
      exportarAExcel(datosExcel, 'Nomina_Personal_Obra_SARA', 'Personal_Obra', 'obras');
    } else {
      const encabezados = ['Nombre', 'Categoría', 'Especialidad', 'Jornal ($)', 'Costo/H', 'Calificación', 'Acreditación'];
      const filas = trabajadores.map(t => [
        t.nombre_completo,
        t.categoria_ocupacional,
        t.especialidad,
        `$${t.jornal_real.toFixed(2)}`,
        `$${t.costo_horario.toFixed(2)}`,
        `★ ${t.calificacion}`,
        t.estado_iess
      ]);
      exportarAPDF('NÓMINA OFICIAL DE PERSONAL CALIFICADO DE OBRA', encabezados, filas, 'Nomina_Personal_Obra_SARA', 'Directorio de Especialistas, Cuadrillas y Homologación Laboral SECAP/IESS', 'obras');
    }
  };

  const handleExportarProveedores = (formato: 'excel' | 'pdf') => {
    if (proveedores.length === 0) return alert('No hay proveedores para exportar.');
    if (formato === 'excel') {
      const datosExcel = proveedores.map(p => ({
        'ID': p.id,
        'Razón Social': p.razon_social,
        'RUC': p.ruc,
        'Categoría / Rubro': p.categoria,
        'Ciudad / Planta': p.ciudad,
        'Días Crédito': p.dias_credito,
        'Contacto': p.contacto,
        'Calificación Homologada': p.calificacion,
        'Catálogo Insumos': `${p.productos.length} productos`
      }));
      exportarAExcel(datosExcel, 'Directorio_Proveedores_SARA', 'Proveedores', 'compras');
    } else {
      const encabezados = ['Razón Social', 'RUC', 'Categoría', 'Ciudad', 'Crédito', 'Calificación Homologada'];
      const filas = proveedores.map(p => [
        p.razon_social,
        p.ruc,
        p.categoria,
        p.ciudad,
        `${p.dias_credito} días`,
        p.calificacion
      ]);
      exportarAPDF('DIRECTORIO OFICIAL DE PROVEEDORES HOMOLOGADOS', encabezados, filas, 'Directorio_Proveedores_SARA', 'Red de Suministros Pesados, Aceros, Hormigones y Acabados de la Construcción', 'compras');
    }
  };

  const handleExportarClientes = (formato: 'excel' | 'pdf') => {
    if (clientes.length === 0) return alert('No hay clientes para exportar.');
    if (formato === 'excel') {
      const datosExcel = clientes.map(c => ({
        'ID': c.id,
        'Cliente / Razón Social': c.nombre,
        'Identificación / RUC': c.identificacion,
        'Representante Legal': c.representante,
        'Email (Usuario Portal)': c.email || 'cliente@portal.ec',
        'Teléfono / WhatsApp': c.telefono,
        'Obra Asignada': c.obra_asignada,
        'Monto Contractual ($)': Number(c.monto_contrato ?? 0).toFixed(2),
        'Acceso al Portal': c.acceso_portal_habilitado ? 'Habilitado (Directo)' : 'Inactivo',
        'Estado': c.estado
      }));
      exportarAExcel(datosExcel, 'Directorio_Clientes_Contratos_SARA', 'Clientes_Contratos', 'contabilidad');
    } else {
      const encabezados = ['Cliente / Titular', 'RUC / Cédula', 'Representante', 'Obra Asignada', 'Monto Contractual', 'Usuario Portal', 'Estado'];
      const filas = clientes.map(c => [
        c.nombre,
        c.identificacion,
        c.representante,
        c.obra_asignada,
        `$${Number(c.monto_contrato ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`,
        c.email || 'cliente@portal.ec',
        c.estado === 'activo' ? 'Activo' : c.estado
      ]);
      exportarAPDF('CATASTRO OFICIAL DE CLIENTES Y CONTRATOS CIVILES', encabezados, filas, 'Directorio_Clientes_Contratos_SARA', 'Titulares de Obra, Credenciales de Acceso al Portal y Garantías Contractuales', 'contabilidad');
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* CABECERA & SUB-NAVEGACIÓN                                          */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Directorio Central & Red Agéntica Conectada
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
            <Users className="w-5 h-5 text-amber-500" />
            Directorio de Recursos de Obra
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administración de Personal Calificado (con SARA Talento), Proveedores de Insumos Pesados y Clientes Titulares.
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('trabajadores')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subTab === 'trabajadores'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Personal de Obra ({trabajadores.length})</span>
          </button>
          <button
            onClick={() => setSubTab('proveedores')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subTab === 'proveedores'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Proveedores ({proveedores.length})</span>
          </button>
          <button
            onClick={() => setSubTab('clientes')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subTab === 'clientes'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Clientes & Contratos ({clientes.length})</span>
          </button>
        </div>

        {/* Botones Oficiales de Descarga Excel y PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (subTab === 'trabajadores') handleExportarPersonal('excel');
              else if (subTab === 'proveedores') handleExportarProveedores('excel');
              else handleExportarClientes('excel');
            }}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Descargar datos en formato Excel con membrete y firmas oficiales"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Excel</span>
          </button>
          <button
            onClick={() => {
              if (subTab === 'trabajadores') handleExportarPersonal('pdf');
              else if (subTab === 'proveedores') handleExportarProveedores('pdf');
              else handleExportarClientes('pdf');
            }}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Descargar informe en formato PDF con membrete y firmas oficiales"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Notificación Agéntica Reactiva */}
      {agentNotice && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-spin" />
            <span>{agentNotice}</span>
          </div>
          <button 
            onClick={() => setAgentNotice(null)}
            className="text-amber-400/70 hover:text-amber-300 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VISTA 1: PERSONAL DE OBRA (CONTRATACIÓN SARA TALENTO)               */}
      {/* ------------------------------------------------------------------- */}
      {subTab === 'trabajadores' && (
        <div className="space-y-4">
          {/* Banner Explicativo de Gobernanza Laboral */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Nómina Calificada de Profesionales & Protocolo de Reclutamiento SARA Talento
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  El contratista evalúa las calificaciones por estrellas y el historial de obras pasadas. Al presionar <strong>"Requerir en Obra"</strong>, el sistema conecta con <strong>SARA Talento</strong> y envía el aviso formal al profesional para su aceptación laboral. Para proteger la intermediación, los números directos y correos se mantienen bajo custodia institucional.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
              <button
                onClick={() => handleExportarPersonal('excel')}
                className="px-2.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar nómina a Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExportarPersonal('pdf')}
                className="px-2.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar nómina a PDF"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>

              <button
                onClick={() => {
                  setAgentNotice(`🤖 SARA_TALENTO: Escaneando base nacional de 142 operarios calificados con certificación SECAP vigente.`);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Sincronizar SARA Talento</span>
              </button>
            </div>
          </div>

          {/* Tabla de Profesionales */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">PROFESIONAL & ESPECIALIDAD</th>
                    <th className="px-5 py-3.5 font-semibold text-center">CALIFICACIÓN</th>
                    <th className="px-5 py-3.5 font-semibold">CATEGORÍA / IDENTIFICACIÓN</th>
                    <th className="px-5 py-3.5 font-semibold text-right">JORNAL REAL</th>
                    <th className="px-5 py-3.5 font-semibold text-right">COSTO HORA</th>
                    <th className="px-5 py-3.5 font-semibold text-center">ACREDITACIÓN IESS / SECAP</th>
                    <th className="px-5 py-3.5 font-semibold text-center">ACCIONES DE CONTRATACIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {trabajadores.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{t.nombre_completo}</span>
                          {t.estado_requerimiento === 'requerido' && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                              Requerimiento Emitido
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                          {t.especialidad}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Contacto protegido por SARA Talento</span>
                        </div>
                      </td>

                      {/* Calificación por Estrellas */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                              {t.calificacion.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            {t.total_obras} obras previas
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] block w-fit mb-1">
                          {t.categoria_ocupacional}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {t.cedula}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white tabular-nums text-xs">
                        ${Number(t.jornal_real).toFixed(2)}
                      </td>

                      <td className="px-5 py-3.5 text-right font-bold text-amber-500 tabular-nums text-xs">
                        ${Number(t.costo_horario).toFixed(2)}/h
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{t.estado_iess}</span>
                        </span>
                      </td>

                      {/* Acciones Reales: Ver Perfil (2 Viñetas) y Requerir en Obra */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAbrirPerfilTrabajador(t, 'ficha_tecnica')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm"
                            title="Ver Ficha Técnica Profesional e Historial de Obras"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>Ver Perfil</span>
                          </button>

                          <button
                            onClick={() => handleAbrirRequerirEnObra(t)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm ${
                              t.estado_requerimiento === 'requerido'
                                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                            }`}
                            title="Contratar y notificar a SARA Talento"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>{t.estado_requerimiento === 'requerido' ? 'Requerido en Obra' : 'Requerir en Obra'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VISTA 2: PROVEEDORES & CATÁLOGO "MIS PRODUCTOS"                     */}
      {/* ------------------------------------------------------------------- */}
      {subTab === 'proveedores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Catálogo de Proveedores Homologados de Materiales & Insumos Pesados
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                24 Provincias
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportarProveedores('excel')}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar directorio de proveedores a Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExportarProveedores('pdf')}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar directorio de proveedores a PDF"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proveedores.map((prov) => (
              <div key={prov.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                      Crédito: {prov.dias_credito} días
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{prov.ciudad}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {prov.razon_social}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mb-2">RUC: {prov.ruc}</p>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] font-mono space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rubro:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{prov.categoria}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Certificación:</span>
                      <span className="text-emerald-500 font-medium text-[10px]">{prov.calificacion}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-slate-400">Catálogo:</span>
                      <span className="text-amber-500 font-bold">{prov.productos.length} insumos dados de alta</span>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción Funcionales */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  {/* Botón Principal: MIS PRODUCTOS */}
                  <button
                    onClick={() => handleAbrirMisProductos(prov)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Mis Productos ({prov.productos.length})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAbrirMisProductos(prov)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold font-mono transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3 text-slate-400" />
                      <span>Cotizar Insumo</span>
                    </button>
                    <button
                      onClick={() => handleAbrirFlete(prov)}
                      className="py-1.5 px-2.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 hover:text-white text-sky-400 text-[11px] font-bold font-mono transition-colors flex items-center gap-1"
                      title="Calcular Flete Pesado con SARA Fletes"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Flete MTOP</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VISTA 3: CLIENTES TITULARES & ACCESO DIRECTO AL PORTAL              */}
      {/* ------------------------------------------------------------------- */}
      {subTab === 'clientes' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros, Búsqueda y Botón para Crear Cliente con Claves */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  placeholder="Buscar por cliente, RUC, email u obra..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
                Mostrando {clientes.filter(c => 
                  c.nombre.toLowerCase().includes(filtroCliente.toLowerCase()) ||
                  c.identificacion.toLowerCase().includes(filtroCliente.toLowerCase()) ||
                  c.obra_asignada.toLowerCase().includes(filtroCliente.toLowerCase()) ||
                  (c.email || '').toLowerCase().includes(filtroCliente.toLowerCase())
                ).length} cliente(s)
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => handleExportarClientes('excel')}
                className="px-2.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar clientes y contratos a Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExportarClientes('pdf')}
                className="px-2.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar clientes y contratos a PDF"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>

              <button
                onClick={handleAbrirModalNuevoCliente}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} />
                <span>+ Crear Nuevo Cliente & Generar Acceso</span>
              </button>
            </div>
          </div>

          {/* Banner Explicativo de Autenticación de Clientes */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Gobernanza de Acceso al Portal: Los clientes dados de alta ingresan directamente con su Usuario y Contraseña generada. No requieren proceso de autoregistro.</span>
            </span>
          </div>

          {/* Grid de Tarjetas de Clientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientes
              .filter(c => 
                c.nombre.toLowerCase().includes(filtroCliente.toLowerCase()) ||
                c.identificacion.toLowerCase().includes(filtroCliente.toLowerCase()) ||
                c.obra_asignada.toLowerCase().includes(filtroCliente.toLowerCase()) ||
                (c.email || '').toLowerCase().includes(filtroCliente.toLowerCase())
              )
              .map((c) => {
                const isPasswordVisible = !!showPasswordCard[c.id];
                const isCopiado = credencialCopiadaId === c.id;

                return (
                  <div 
                    key={c.id} 
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Encabezado del Cliente */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 inline-flex items-center gap-1 mb-1">
                            <ShieldCheck size={11} />
                            <span>CLIENTE TITULAR CERTIFICADO</span>
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                            {c.nombre}
                          </h3>
                        </div>
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shrink-0">
                          RUC: {c.identificacion}
                        </span>
                      </div>

                      {/* Obra y Representante */}
                      <div className="space-y-1 text-xs">
                        <p className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                          <Building2 size={13} />
                          <span>Obra: {c.obra_asignada}</span>
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          Representante Legal: <strong>{c.representante}</strong> • Tel: {c.telefono}
                        </p>
                      </div>

                      {/* Recuadro de Credenciales de Autenticación al Portal */}
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/60 dark:border-slate-800 pb-1.5">
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-bold">
                            <Key size={12} className="text-amber-500" />
                            <span>Credenciales de Autenticación al Portal</span>
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            ● Ingreso Directo Habilitado
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Usuario (Email):</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block select-all">
                              {c.email || 'cliente@portal.ec'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px]">Contraseña de Acceso:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-amber-600 dark:text-amber-400 select-all">
                                {isPasswordVisible ? c.clave_acceso : '••••••••••••'}
                              </span>
                              <button
                                onClick={() => handleToggleVerPassword(c.id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                                title={isPasswordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
                              >
                                {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Botón Copiar Credenciales */}
                        <div className="pt-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            El cliente no requiere registrarse
                          </span>
                          <button
                            onClick={() => handleCopiarCredenciales(c)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isCopiado
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isCopiado ? <Check size={12} /> : <Copy size={12} />}
                            <span>{isCopiado ? '¡Credenciales Copiadas!' : 'Copiar Credenciales'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer de la tarjeta con Monto Contractual */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Monto Contractual</span>
                        <strong className="text-sm font-extrabold text-slate-900 dark:text-white">
                          ${Number(c.monto_contrato ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                          Contrato Activo
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {clientes.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No hay clientes registrados en este momento. Presiona <strong>"+ Crear Nuevo Cliente & Generar Acceso"</strong> para dar de alta al primer cliente.
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: "MIS PRODUCTOS" (CATÁLOGO DETALLADO DEL PROVEEDOR)         */}
      {/* =================================================================== */}
      {modalProductosOpen && proveedorSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Encabezado del Modal */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Catálogo de Insumos: {proveedorSeleccionado.razon_social}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                      RUC: {proveedorSeleccionado.ruc}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Precios unitarios oficiales de lista • Homologación {proveedorSeleccionado.calificacion} • {proveedorSeleccionado.ciudad}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalProductosOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notificación dentro del Modal al Agregar */}
            {noticiaProductoAgregado && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{noticiaProductoAgregado}</span>
              </div>
            )}

            {/* Barra de Búsqueda y Filtro */}
            <div className="p-5 pb-3 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por código, descripción o categoría (ej: 12mm, Cemento, Bloque)..."
                  value={filtroProducto}
                  onChange={(e) => setFiltroProducto(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <span className="text-xs font-mono text-slate-400 shrink-0">
                Mostrando {proveedorSeleccionado.productos.filter(p => 
                  p.descripcion.toLowerCase().includes(filtroProducto.toLowerCase()) ||
                  p.codigo.toLowerCase().includes(filtroProducto.toLowerCase()) ||
                  p.tipo.toLowerCase().includes(filtroProducto.toLowerCase())
                ).length} insumos
              </span>
            </div>

            {/* Tabla de Productos del Proveedor */}
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">CÓDIGO</th>
                      <th className="px-4 py-3 font-semibold">DESCRIPCIÓN DEL INSUMO</th>
                      <th className="px-4 py-3 font-semibold">TIPO / RUBRO</th>
                      <th className="px-4 py-3 font-semibold text-center">UNIDAD</th>
                      <th className="px-4 py-3 font-semibold text-right">PRECIO UNITARIO</th>
                      <th className="px-4 py-3 font-semibold text-center">DISPONIBILIDAD</th>
                      <th className="px-4 py-3 font-semibold text-center">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {proveedorSeleccionado.productos
                      .filter(p => 
                        p.descripcion.toLowerCase().includes(filtroProducto.toLowerCase()) ||
                        p.codigo.toLowerCase().includes(filtroProducto.toLowerCase()) ||
                        p.tipo.toLowerCase().includes(filtroProducto.toLowerCase())
                      )
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-amber-500">
                            {prod.codigo}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {prod.descripcion}
                            </span>
                            {prod.norma_tecnica && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Norma: {prod.norma_tecnica}
                              </span>
                            )}
                            {prod.descuento_volumen && (
                              <span className="text-[9px] text-emerald-500 font-semibold block mt-0.5">
                                Escala: {prod.descuento_volumen}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                              {prod.tipo}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 font-bold">
                            {prod.unidad}
                          </td>
                          <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white tabular-nums text-sm">
                            ${prod.precio_unitario.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{prod.disponibilidad}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleAgregarProductoCotizacion(prod)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm mx-auto"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Cotizar</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pie del Modal */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                Precios no incluyen IVA • Aplican condiciones de flete pesado y tiempos de descarga según normativa MTOP.
              </span>
              <button
                onClick={() => setModalProductosOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold font-mono text-xs shadow-sm hover:opacity-90 transition-all"
              >
                Cerrar Catálogo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: "FLETE PESADO MTOP"                                        */}
      {/* =================================================================== */}
      {modalFleteOpen && proveedorParaFlete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Calcular Flete Pesado con SARA Fletes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Despacho desde: {proveedorParaFlete.razon_social} ({proveedorParaFlete.ciudad})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalFleteOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">
                  Obra de Destino:
                </label>
                <select
                  value={obraDestinoFlete}
                  onChange={(e) => setObraDestinoFlete(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                >
                  <option value="Edificio Residencial El Mirador (Loja)">Edificio Residencial El Mirador (Loja)</option>
                  <option value="Conjunto Habitacional Las Acacias (Cariamanga)">Conjunto Habitacional Las Acacias (Cariamanga)</option>
                  <option value="Torre San Sebastián (Loja Centro)">Torre San Sebastián (Loja Centro)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">
                  Tipo de Vehículo Pesado:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoTransporteFlete('volqueta_14m3')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      tipoTransporteFlete === 'volqueta_14m3'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    Volqueta 14m³
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoTransporteFlete('plataforma_30t')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      tipoTransporteFlete === 'plataforma_30t'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    Plataforma 30T
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoTransporteFlete('mixer_8m3')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      tipoTransporteFlete === 'mixer_8m3'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    Mixer 8m³
                  </button>
                </div>
              </div>

              {/* Resultado del cálculo */}
              {fleteCalculadoExitoso && (
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>Distancia Estimada:</span>
                    <strong className="text-white">18.5 km (Corredor Vial Sur)</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Peajes MTOP:</span>
                    <strong className="text-white">$3.00 USD</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Ahorro por Retorno (Backhaul):</span>
                    <strong className="text-emerald-400">-28% de Descuento</strong>
                  </div>
                  <div className="pt-2 border-t border-sky-500/20 flex justify-between items-center text-sm">
                    <span className="font-bold">Tarifa Neta de Flete:</span>
                    <span className="text-base font-extrabold text-white">$65.00 USD / Viaje</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalFleteOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold font-mono text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCalcularFletePesado}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{fleteCalculadoExitoso ? 'Flete Programado' : 'Calcular Tarifa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: "VER PERFIL & HISTORIAL DEL PROFESIONAL" (2 VIÑETAS)       */}
      {/* =================================================================== */}
      {modalPerfilOpen && trabajadorSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header del Perfil */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <HardHat className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {trabajadorSeleccionado.nombre_completo}
                    </h3>
                    <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-amber-500 text-xs">{trabajadorSeleccionado.calificacion.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {trabajadorSeleccionado.categoria_ocupacional} • {trabajadorSeleccionado.anios_experiencia} años de experiencia comprobada
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalPerfilOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de las 2 VIÑETAS */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-850/30 px-5 pt-2">
              <button
                onClick={() => setVinetaPerfil('ficha_tecnica')}
                className={`px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                  vinetaPerfil === 'ficha_tecnica'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Viñeta 1: Ficha Técnica Profesional</span>
              </button>

              <button
                onClick={() => setVinetaPerfil('historial_obras')}
                className={`px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                  vinetaPerfil === 'historial_obras'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Viñeta 2: Historial de Obras en Grupo SARA ({trabajadorSeleccionado.historial_obras.length})</span>
              </button>
            </div>

            {/* Contenido de las Viñetas */}
            <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs font-mono">
              {/* ------------------------------------------------------------- */}
              {/* VIÑETA 1: DATOS PERSONALES & FICHA TÉCNICA (SIN TELÉFONO/EMAIL) */}
              {/* ------------------------------------------------------------- */}
              {vinetaPerfil === 'ficha_tecnica' && (
                <div className="space-y-4">
                  {/* Banner de Protección de Datos */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-start gap-3">
                    <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Privacidad & Intermediación Segura SARA Talento:</strong>
                      <span className="text-[11px] text-slate-400">
                        Los teléfonos celulares directos y correos personales no se exponen al contratista para garantizar el cumplimiento de la ley laboral y la contratación mediante la red formal de GRUPO SARA.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Identificación Laboral</span>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Cédula Profesional:</span>
                        <strong className="text-slate-900 dark:text-white">{trabajadorSeleccionado.cedula}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Categoría Sectorial:</span>
                        <strong className="text-slate-900 dark:text-white">{trabajadorSeleccionado.categoria_ocupacional}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Afiliación IESS:</span>
                        <span className="text-emerald-500 font-bold">{trabajadorSeleccionado.estado_iess}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Canal de Contacto:</span>
                        <span className="text-amber-500 font-bold">SARA Talento Humano</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Tarifas & Rendimiento APU</span>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Jornal Diario Real:</span>
                        <strong className="text-slate-900 dark:text-white">${trabajadorSeleccionado.jornal_real.toFixed(2)} USD</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Costo Horario de Obra:</span>
                        <strong className="text-amber-500">${trabajadorSeleccionado.costo_horario.toFixed(2)} USD/h</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500">Obras Completadas:</span>
                        <strong className="text-slate-900 dark:text-white">{trabajadorSeleccionado.total_obras} Proyectos</strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Calificación de Fiscalización:</span>
                        <span className="text-amber-500 font-extrabold">{trabajadorSeleccionado.calificacion.toFixed(1)} / 5.0 ⭐</span>
                      </div>
                    </div>
                  </div>

                  {/* Certificaciones y Acreditaciones */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Certificaciones & Acreditaciones Homologadas
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {trabajadorSeleccionado.acreditaciones.map((acred, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{acred}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Habilidades Técnicas */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">
                      Competencias y Habilidades Prácticas
                    </span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      {trabajadorSeleccionado.habilidades_clave.map((hab, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{hab}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* VIÑETA 2: HISTORIAL DE TRABAJOS ANTERIORES EN GRUPO SARA      */}
              {/* ------------------------------------------------------------- */}
              {vinetaPerfil === 'historial_obras' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Historial auditado de obras donde este profesional prestó sus servicios técnicos bajo el seguimiento de los residentes y fiscalizadores de GRUPO SARA:
                  </div>

                  <div className="space-y-3">
                    {trabajadorSeleccionado.historial_obras.map((obra) => (
                      <div key={obra.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-amber-500" />
                            <span>{obra.obra}</span>
                          </h4>
                          <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-amber-500 font-bold self-start sm:self-auto">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{obra.calificacion.toFixed(1)} / 5.0</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          <div>
                            <span className="block text-[10px] text-slate-400">Ubicación:</span>
                            <strong className="text-slate-700 dark:text-slate-300">{obra.ubicacion}</strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">Rol de Obra:</span>
                            <strong className="text-slate-700 dark:text-slate-300">{obra.rol}</strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">Duración:</span>
                            <strong className="text-slate-700 dark:text-slate-300">{obra.periodo}</strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">Horas Auditadas:</span>
                            <strong className="text-emerald-400">{obra.horas_registradas} h</strong>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="text-[10px] font-bold text-amber-500 block mb-0.5">
                            Evaluación Técnica de Fiscalización ({obra.fiscalizador}):
                          </span>
                          <em>"{obra.dictamen}"</em>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer con el Botón "Requerir en Obra" */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 flex items-center justify-between gap-3">
              <button
                onClick={() => setModalPerfilOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold font-mono text-xs"
              >
                Cerrar Perfil
              </button>

              <button
                onClick={() => {
                  setModalPerfilOpen(false);
                  handleAbrirRequerirEnObra(trabajadorSeleccionado);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold font-mono text-xs shadow-sm flex items-center gap-2 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Requerir en Obra Ahora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: "REQUERIR EN OBRA" (ENVÍO A SARA TALENTO & TRABAJADOR)     */}
      {/* =================================================================== */}
      {modalRequerirOpen && trabajadorParaRequerir && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Requerir Personal en Obra
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Profesional: {trabajadorParaRequerir.nombre_completo} ({trabajadorParaRequerir.categoria_ocupacional})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalRequerirOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Si ya se confirmó el requerimiento */}
            {requerimientoConfirmado ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-sm">¡Requerimiento Emitido con Éxito!</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    Se generó la solicitud formal <strong className="text-white">{requerimientoConfirmado.id}</strong>. SARA Talento ha notificado al profesional mediante el canal institucional para su aceptación de la plaza laboral en <strong className="text-white">{obraDestinoRequerimiento}</strong>.
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 pt-1">
                    Fecha y Hora del Sistema: {requerimientoConfirmado.fecha}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalRequerirOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold font-mono text-xs shadow-sm hover:opacity-90"
                >
                  Entendido y Volver a Nómina
                </button>
              </div>
            ) : (
              /* Formulario de Requerimiento */
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1">
                    Proyecto / Obra de Destino:
                  </label>
                  <select
                    value={obraDestinoRequerimiento}
                    onChange={(e) => setObraDestinoRequerimiento(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  >
                    <option value="Edificio Residencial El Mirador (Loja)">Edificio Residencial El Mirador (Loja)</option>
                    <option value="Conjunto Habitacional Las Acacias (Cariamanga)">Conjunto Habitacional Las Acacias (Cariamanga)</option>
                    <option value="Torre San Sebastián (Loja Centro)">Torre San Sebastián (Loja Centro)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">
                      Fecha Estimada de Inicio:
                    </label>
                    <input
                      type="date"
                      value={fechaInicioRequerimiento}
                      onChange={(e) => setFechaInicioRequerimiento(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">
                      Duración Prevista:
                    </label>
                    <select
                      value={duracionRequerimiento}
                      onChange={(e) => setDuracionRequerimiento(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    >
                      <option value="1 mes (Fase Cimentación)">1 mes (Fase Cimentación)</option>
                      <option value="3 meses (Fase Estructuras)">3 meses (Fase Estructuras)</option>
                      <option value="6 meses (Obra Gruesa)">6 meses (Obra Gruesa)</option>
                      <option value="Proyecto Completo (12 meses)">Proyecto Completo (12 meses)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jornal Diario Vigente:</span>
                    <strong className="text-slate-900 dark:text-white">${trabajadorParaRequerir.jornal_real.toFixed(2)} USD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Costo Horario:</span>
                    <strong className="text-amber-500">${trabajadorParaRequerir.costo_horario.toFixed(2)} USD/h</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Aseguramiento:</span>
                    <span className="text-emerald-500 font-bold">{trabajadorParaRequerir.estado_iess}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="epp-check"
                    checked={eppRequerido}
                    onChange={(e) => setEppRequerido(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 dark:border-slate-700"
                  />
                  <label htmlFor="epp-check" className="text-slate-600 dark:text-slate-300 text-[11px] cursor-pointer">
                    Exigir Kit de EPP Homologado (Casco Tipo 1, Calzado Dieléctrico con Punta de Acero y Chaleco Reflectivo)
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalRequerirOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold font-mono text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={enviandoRequerimiento}
                    onClick={handleConfirmarRequerimientoSARA}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {enviandoRequerimiento ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Notificando a SARA Talento...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirmar & Notificar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: "CREAR NUEVO CLIENTE & GENERAR ACCESO AL PORTAL"           */}
      {/* =================================================================== */}
      {modalNuevoClienteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Encabezado del Modal */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Registrar Nuevo Cliente & Generar Acceso
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Alta directa en la empresa con credenciales para el Portal sin autoregistro.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalNuevoClienteOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario de Alta y Generación de Credenciales */}
            <form onSubmit={handleGuardarNuevoCliente} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono">
              
              {/* Razón Social / Nombre */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Razón Social / Nombre del Cliente Titular *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Consorcio Inmobiliario Los Rosales"
                  value={formNuevoCliente.nombre}
                  onChange={(e) => setFormNuevoCliente(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* RUC / Cédula y Representante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    RUC o Cédula de Identidad *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    placeholder="1191728394001"
                    value={formNuevoCliente.identificacion}
                    onChange={(e) => setFormNuevoCliente(prev => ({ ...prev, identificacion: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Representante Legal
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ing. Patricio Cárdenas"
                    value={formNuevoCliente.representante}
                    onChange={(e) => setFormNuevoCliente(prev => ({ ...prev, representante: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Email (Usuario) y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Correo Electrónico (Usuario del Portal) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@empresa.ec"
                    value={formNuevoCliente.email}
                    onChange={(e) => setFormNuevoCliente(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0994812938"
                    value={formNuevoCliente.telefono}
                    onChange={(e) => setFormNuevoCliente(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Obra Asignada y Monto Contractual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Obra Asignada de la Empresa *
                  </label>
                  <select
                    value={formNuevoCliente.obra_asignada}
                    onChange={(e) => setFormNuevoCliente(prev => ({ ...prev, obra_asignada: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Edificio Residencial El Mirador (Loja)">Edificio Residencial El Mirador (Loja)</option>
                    <option value="Conjunto Habitacional Las Acacias (Cariamanga)">Conjunto Habitacional Las Acacias (Cariamanga)</option>
                    <option value="Torre Diamante Corporativa">Torre Diamante Corporativa</option>
                    <option value="Centro Logístico SARA Fletes Sur">Centro Logístico SARA Fletes Sur</option>
                    <option value="Rincón Campestre JV">Rincón Campestre JV</option>
                    <option value="Puente Paso Lateral Loja - Tramo II">Puente Paso Lateral Loja - Tramo II</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Monto Contractual ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="150000.00"
                    value={formNuevoCliente.monto_contrato}
                    onChange={(e) => setFormNuevoCliente(prev => ({ ...prev, monto_contrato: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* BLOQUE DE GENERACIÓN DE CLAVE PARA AUTENTICACIÓN */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Key size={14} className="text-amber-500" />
                    <span>Generación de Claves para Autenticación Directa *</span>
                  </span>
                  <button
                    type="button"
                    onClick={generarClaveAleatoria}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                  >
                    <Sparkles size={12} />
                    <span>Generar Otra Clave</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPasswordNewClient ? 'text' : 'password'}
                    required
                    value={formNuevoCliente.clave_acceso}
                    onChange={(e) => setFormNuevoCliente(prev => ({ ...prev, clave_acceso: e.target.value }))}
                    className="w-full pr-10 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white font-bold tracking-wider"
                    placeholder="Contraseña segura"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordNewClient(!showPasswordNewClient)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showPasswordNewClient ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPasswordNewClient ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div className="text-[11px] text-amber-900/80 dark:text-amber-300/80 flex items-start gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Con estos datos ingresa el cliente directamente y ya no tiene que realizar ningún proceso de autoregistro. Sus accesos quedan activados en la base de datos de Grupo SARA.
                  </span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNuevoClienteOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold font-mono text-xs cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Dar de Alta & Generar Acceso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
