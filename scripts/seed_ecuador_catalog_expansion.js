const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Faltan las variables de entorno de Supabase.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 1. PROVEEDORES VERIFICADOS DE ECUADOR
// ==========================================
const PROVEEDORES_DATA = [
  { razon_social: 'HOLCIM ECUADOR S.A.', ruc: '0990004199001', contacto_vendedor: 'Ing. Fabricio Morales - Ventas Corporativas', telefono: '04-370-9000', email: 'ventas.ecuador@holcim.com', direccion: 'Av. Barcelona y Av. Pdte. Carlos Julio Arosemena, Guayaquil', sitio_web: 'https://www.holcim.com.ec' },
  { razon_social: 'UNACEM ECUADOR S.A.', ruc: '1790016919001', contacto_vendedor: 'Ing. Roberto Dávalos - Comercialización Selvalegre', telefono: '02-393-2400', email: 'contacto@unacem.com.ec', direccion: 'Panamericana Norte Km 11 1/2, Quito', sitio_web: 'https://unacem.com.ec' },
  { razon_social: 'NOVACERO S.A.', ruc: '1790054365001', contacto_vendedor: 'Ing. Carlos Mendoza - Proyectos Industriales', telefono: '02-398-9200', email: 'servicioalcliente@novacero.com', direccion: 'Panamericana Sur Km 14.5, Guamaní, Quito', sitio_web: 'https://www.novacero.com' },
  { razon_social: 'ADELCA S.A. (Acería del Ecuador)', ruc: '1790082490001', contacto_vendedor: 'Arq. Gabriela Sánchez - Ventas Estructuras', telefono: '02-394-0800', email: 'ventas@adelca.com', direccion: 'Km 32 Vía a Daule / Aloag, Pichincha', sitio_web: 'https://www.adelca.com' },
  { razon_social: 'SEDEMI S.A.S.', ruc: '1791244303001', contacto_vendedor: 'Ing. Esteban Viteri - División Estructuras Metálicas', telefono: '02-233-0400', email: 'info@sedemi.com', direccion: 'Autopista General Rumiñahui Km 13, Sangolquí', sitio_web: 'https://sedemi.com' },
  { razon_social: 'DIPAC MANTA S.A.', ruc: '1390145293001', contacto_vendedor: 'Lcdo. Marcelo Aguirre - Red Mayorista Acero', telefono: '05-262-6700', email: 'ventas@dipacmanta.com', direccion: 'Vía Manta - Portoviejo Km 4.5', sitio_web: 'https://www.dipacmanta.com' },
  { razon_social: 'KUBIEC S.A.', ruc: '1791807383001', contacto_vendedor: 'Ing. Andrés Peña - Cubiertas y Paneles Drywall', telefono: '02-399-4000', email: 'soluciones@kubiec.com', direccion: 'Parque Industrial Turubamba, Quito', sitio_web: 'https://www.kubiec.com' },
  { razon_social: 'PLASTIGAMA WAVIN (Mexichem Ecuador S.A.)', ruc: '0990011985001', contacto_vendedor: 'Ing. Fernando Vaca - Redes Hidrosanitarias', telefono: '04-370-5200', email: 'atencionalcliente@plastigama.com', direccion: 'Km 4.5 Vía a Daule, Guayaquil', sitio_web: 'https://www.wavin.com/es-ec' },
  { razon_social: 'RIVAL TUBO SISTEMAS', ruc: '0190143807001', contacto_vendedor: 'Ing. Paulina Carrión - Alcantarillado y Presión', telefono: '07-410-3800', email: 'ventas@rival.com.ec', direccion: 'Parque Industrial, Cuenca', sitio_web: 'https://www.rival.com.ec' },
  { razon_social: 'SIKA ECUATORIANA S.A.', ruc: '0990055745001', contacto_vendedor: 'Ing. Marco Silva - Asesoría Técnica de Obra', telefono: '04-281-2700', email: 'servicio.cliente@ec.sika.com', direccion: 'Km 3.5 Vía Durán-Tambo, Guayas', sitio_web: 'https://ecu.sika.com' },
  { razon_social: 'INTACO ECUADOR S.A.', ruc: '0990848036001', contacto_vendedor: 'Ing. Diana Paredes - Morteros y Adhesivos Bondex', telefono: '04-216-0400', email: 'ventasecuador@intaco.com', direccion: 'Km 16.5 Vía a Daule, Guayaquil', sitio_web: 'https://www.intaco.com' },
  { razon_social: 'GRAIMAN CÍA. LTDA.', ruc: '0190135898001', contacto_vendedor: 'Dis. Santiago Alvarado - Grandes Proyectos Cerámicos', telefono: '07-280-4400', email: 'proyectos@graiman.com', direccion: 'Av. Gil Ramírez Dávalos y El Pedregal, Cuenca', sitio_web: 'https://www.graiman.com' },
  { razon_social: 'FV - ÁREA ANDINA S.A.', ruc: '1790055531001', contacto_vendedor: 'Ing. Mónica Serrano - Grifería y Sanitarios', telefono: '02-396-1800', email: 'ventas@fvandina.com.ec', direccion: 'Panamericana Norte Km 15, Calacalí, Quito', sitio_web: 'https://www.fvandina.com' },
  { razon_social: 'EDESA S.A. / BRIGGS', ruc: '1790022714001', contacto_vendedor: 'Arq. Luis Romero - Artefactos de Ahorro de Agua', telefono: '02-397-4200', email: 'atencionclientes@edesa.com.ec', direccion: 'Av. Eloy Alfaro y de los Álamos, Quito', sitio_web: 'https://www.edesa.com.ec' },
  { razon_social: 'PINTURAS CÓNDOR S.A.', ruc: '1790003183001', contacto_vendedor: 'Ing. Javier Cárdenas - Recubrimientos Arquitectónicos', telefono: '02-396-0300', email: 'servicioalcliente@condor.com.ec', direccion: 'Panamericana Sur Km 11, Quito', sitio_web: 'https://www.condor.com.ec' },
  { razon_social: 'PINTUCO ECUADOR S.A.', ruc: '1790014266001', contacto_vendedor: 'Ing. David Castro - Protección Anticorrosiva', telefono: '02-248-1800', email: 'contacto@pintuco.com.ec', direccion: 'Av. Galo Plaza Lasso N60-120, Quito', sitio_web: 'https://pintuco.com.ec' },
  { razon_social: 'IIASA CATERPILLAR ECUADOR', ruc: '0990004245001', contacto_vendedor: 'Ing. Pablo Noboa - Maquinaria y Renta Equipos', telefono: '04-216-2000', email: 'contacto@iiasa.com.ec', direccion: 'Km 5.5 Vía a Daule, Guayaquil / Av. Galo Plaza Lasso, Quito', sitio_web: 'https://www.iiasa.com.ec' },
  { razon_social: 'ALCOMAQ CÍA. LTDA.', ruc: '1791789229001', contacto_vendedor: 'Ing. Jorge Benítez - Alquiler y Venta Maquinaria Menor', telefono: '02-247-4900', email: 'ventas@alcomaq.com.ec', direccion: 'Av. 10 de Agosto N44-88, Quito', sitio_web: 'https://www.alcomaq.com.ec' },
  { razon_social: 'IMPTEK - CHOVA DEL ECUADOR S.A.', ruc: '1790514196001', contacto_vendedor: 'Ing. Raúl Gómez - Impermeabilización Asfáltica', telefono: '02-382-7900', email: 'contacto@imptek.com', direccion: 'Parque Industrial El Inga, Vía a Pifo, Quito', sitio_web: 'https://www.imptek.com' },
  { razon_social: 'KNAUF ECUADOR S.A.', ruc: '1792451388001', contacto_vendedor: 'Arq. Patricia Ortiz - Sistemas Drywall y Cielos Rasos', telefono: '02-394-1500', email: 'info.ecuador@knauf.com', direccion: 'Av. República del Salvador N34-229, Quito', sitio_web: 'https://www.knauf.com.ec' },
  { razon_social: 'DISENSA ECUADOR', ruc: '0991328907001', contacto_vendedor: 'Red Franquiciada de Materiales de Construcción', telefono: '1800-347367', email: 'red.disensa@holcim.com', direccion: 'Cobertura nacional en 24 provincias del Ecuador', sitio_web: 'https://www.disensa.com.ec' }
];

// ==========================================
// 2. INSUMOS MAESTROS VERIFICADOS (2026)
// ==========================================
const INSUMOS_DATA = [
  // MATERIALES PÉTREOS Y AGLOMERANTES
  { codigo: 'MAT-EC-001', nombre: 'Arena lavada de río para hormigón (m³)', unidad: 'm3', tipo: 'material', precio: 16.50, prov: 'HOLCIM ECUADOR S.A.', subfam: 'SF1343' },
  { codigo: 'MAT-EC-002', nombre: 'Ripio triturado 3/4" basáltico para hormigón (m³)', unidad: 'm3', tipo: 'material', precio: 18.50, prov: 'HOLCIM ECUADOR S.A.', subfam: 'SF1343' },
  { codigo: 'MAT-EC-003', nombre: 'Piedra bola de río seleccionada d=15-30 cm (m³)', unidad: 'm3', tipo: 'material', precio: 14.50, prov: 'HOLCIM ECUADOR S.A.', subfam: 'SF1343' },
  { codigo: 'MAT-EC-004', nombre: 'Subbase granular Clase 3 MTOP para mejoramiento (m³)', unidad: 'm3', tipo: 'material', precio: 11.20, prov: 'HOLCIM ECUADOR S.A.', subfam: 'SF1343' },
  { codigo: 'MAT-EC-005', nombre: 'Cemento Holcim Fuerte Tipo GU saco 50 kg', unidad: 'saco', tipo: 'material', precio: 7.95, prov: 'HOLCIM ECUADOR S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-006', nombre: 'Cemento Selvalegre Especial Tipo GU saco 50 kg', unidad: 'saco', tipo: 'material', precio: 7.80, prov: 'UNACEM ECUADOR S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-007', nombre: 'Hormigón premezclado f\'c=210 kg/cm² bombeable (m³)', unidad: 'm3', tipo: 'material', precio: 89.50, prov: 'HOLCIM ECUADOR S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-008', nombre: 'Hormigón premezclado f\'c=280 kg/cm² sismorresistente bombeable (m³)', unidad: 'm3', tipo: 'material', precio: 97.00, prov: 'HOLCIM ECUADOR S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-009', nombre: 'Hormigón premezclado f\'c=350 kg/cm² para muros de corte (m³)', unidad: 'm3', tipo: 'material', precio: 118.00, prov: 'HOLCIM ECUADOR S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-010', nombre: 'Curador químico de hormigón Antisol / SikaCurador (Litro)', unidad: 'L', tipo: 'material', precio: 3.20, prov: 'SIKA ECUATORIANA S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-011', nombre: 'Aditivo plastificante reductor de agua Sika Plastiment (Galón)', unidad: 'gal', tipo: 'material', precio: 12.80, prov: 'SIKA ECUATORIANA S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-012', nombre: 'Mortero Grout sin retracción de alta resistencia 60 MPa (Saco 25 kg)', unidad: 'saco', tipo: 'material', precio: 18.50, prov: 'SIKA ECUATORIANA S.A.', subfam: 'SF13656' },

  // ACEROS Y ESTRUCTURAS
  { codigo: 'MAT-EC-013', nombre: 'Acero de refuerzo en varilla corrugada fy=4200 kg/cm² (kg)', unidad: 'kg', tipo: 'material', precio: 1.05, prov: 'NOVACERO S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-014', nombre: 'Alambre recocido de amarre N° 18 (kg)', unidad: 'kg', tipo: 'material', precio: 1.45, prov: 'ADELCA S.A. (Acería del Ecuador)', subfam: 'SF13656' },
  { codigo: 'MAT-EC-015', nombre: 'Malla electrosoldada 150x150x5.0 mm (m²)', unidad: 'm2', tipo: 'material', precio: 2.65, prov: 'NOVACERO S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-016', nombre: 'Perfiles de acero estructural laminado IPE / HEA / W (kg)', unidad: 'kg', tipo: 'material', precio: 1.48, prov: 'SEDEMI S.A.S.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-017', nombre: 'Perfil metálico tipo G / Correa costanera 100x50x15x2 mm (kg)', unidad: 'kg', tipo: 'material', precio: 1.55, prov: 'DIPAC MANTA S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-018', nombre: 'Lámina de acero colaborante Novalosa / Metaldeck cal. 22 (m²)', unidad: 'm2', tipo: 'material', precio: 13.80, prov: 'NOVACERO S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-019', nombre: 'Panel sándwich de cubierta PUR e=40 mm prepintado (m²)', unidad: 'm2', tipo: 'material', precio: 23.50, prov: 'KUBIEC S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-020', nombre: 'Perno de anclaje de alta resistencia ASTM A325 d=3/4" L=500 mm (u)', unidad: 'u', tipo: 'material', precio: 9.80, prov: 'SEDEMI S.A.S.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-021', nombre: 'Pintura anticorrosiva epóxica industrial de altos sólidos (Galón)', unidad: 'gal', tipo: 'material', precio: 32.00, prov: 'PINTUCO ECUADOR S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-022', nombre: 'Electrodo para soldadura estructural E-7018 (kg)', unidad: 'kg', tipo: 'material', precio: 4.80, prov: 'NOVACERO S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-023', nombre: 'Tablero contrachapado fenólico 18 mm para encofrado (m²)', unidad: 'm2', tipo: 'material', precio: 14.50, prov: 'DISENSA ECUADOR', subfam: 'SF13656' },

  // INSTALACIONES HIDROSANITARIAS
  { codigo: 'MAT-EC-024', nombre: 'Tubería PPR termofusión PN-20 DN 20 mm (1/2") x 4 m', unidad: 'u', tipo: 'material', precio: 4.20, prov: 'PLASTIGAMA WAVIN (Mexichem Ecuador S.A.)', subfam: 'SF1742' },
  { codigo: 'MAT-EC-025', nombre: 'Tubería PPR termofusión PN-20 DN 25 mm (3/4") x 4 m', unidad: 'u', tipo: 'material', precio: 5.75, prov: 'PLASTIGAMA WAVIN (Mexichem Ecuador S.A.)', subfam: 'SF1742' },
  { codigo: 'MAT-EC-026', nombre: 'Tubería PVC desagüe sanitario espiga campana 110 mm (4") x 3 m', unidad: 'u', tipo: 'material', precio: 9.20, prov: 'PLASTIGAMA WAVIN (Mexichem Ecuador S.A.)', subfam: 'SF1742' },
  { codigo: 'MAT-EC-027', nombre: 'Tubería PVC alcantarillado unión Z elastomérica DN 200 mm (8") x 6 m', unidad: 'm', tipo: 'material', precio: 18.50, prov: 'RIVAL TUBO SISTEMAS', subfam: 'SF1742' },
  { codigo: 'MAT-EC-028', nombre: 'Marco y tapa redonda de pozo de revisión hierro dúctil D400 d=600 mm', unidad: 'u', tipo: 'material', precio: 165.00, prov: 'RIVAL TUBO SISTEMAS', subfam: 'SF1742' },
  { codigo: 'MAT-EC-029', nombre: 'Rejilla sumidero calzada hierro dúctil D400 con bisagra 90x40 cm', unidad: 'u', tipo: 'material', precio: 135.00, prov: 'RIVAL TUBO SISTEMAS', subfam: 'SF1742' },
  { codigo: 'MAT-EC-030', nombre: 'Inodoro ecológico doble descarga de alta eficiencia 4.8/3.0 L', unidad: 'u', tipo: 'material', precio: 88.00, prov: 'EDESA S.A. / BRIGGS', subfam: 'SF1742' },
  { codigo: 'MAT-EC-031', nombre: 'Lavamanos sobremueble con grifería monomando cromo FV', unidad: 'jgo', tipo: 'material', precio: 68.00, prov: 'FV - ÁREA ANDINA S.A.', subfam: 'SF1742' },

  // ACABADOS Y CONSTRUCCIÓN LIVIANA
  { codigo: 'MAT-EC-032', nombre: 'Porcelanato rectificado esmaltado alto tráfico 60x60 / 60x120 cm (m²)', unidad: 'm2', tipo: 'material', precio: 15.80, prov: 'GRAIMAN CÍA. LTDA.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-033', nombre: 'Mortero adhesivo con polímeros Bondex Plus saco 25 kg', unidad: 'saco', tipo: 'material', precio: 7.10, prov: 'INTACO ECUADOR S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-034', nombre: 'Plancha de Gypsum estándar 1/2" (1.22 x 2.44 m)', unidad: 'plancha', tipo: 'material', precio: 9.60, prov: 'KNAUF ECUADOR S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-035', nombre: 'Perfil montante de acero galvanizado para drywall 65x38x0.45 mm x 3 m', unidad: 'u', tipo: 'material', precio: 2.90, prov: 'KUBIEC S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-036', nombre: 'Pintura elastomérica impermeable para exteriores fachada (Caneca 5 gal)', unidad: 'caneca', tipo: 'material', precio: 78.00, prov: 'PINTURAS CÓNDOR S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-037', nombre: 'Pintura látex vinilacrílica Suprema lavable interiores (Caneca 5 gal)', unidad: 'caneca', tipo: 'material', precio: 52.00, prov: 'PINTURAS CÓNDOR S.A.', subfam: 'SF13656' },
  { codigo: 'MAT-EC-038', nombre: 'Mezcla asfáltica en caliente MTOP tipo 1 (m³)', unidad: 'm3', tipo: 'material', precio: 95.00, prov: 'HOLCIM ECUADOR S.A.', subfam: 'SF13656' },

  // MANO DE OBRA (MDT - CAMICON 2026)
  { codigo: 'MO-EC-001', nombre: 'Maestro Mayor / Inspector de Obra Civil (MDT Cat. C1)', unidad: 'hora', tipo: 'mano_de_obra', precio: 5.10, prov: 'GRUPO-SARA', subfam: 'SF429' },
  { codigo: 'MO-EC-002', nombre: 'Albañil calificado / Encofrador / Fierrero (MDT Cat. D2)', unidad: 'hora', tipo: 'mano_de_obra', precio: 4.35, prov: 'GRUPO-SARA', subfam: 'SF429' },
  { codigo: 'MO-EC-003', nombre: 'Soldador homologado en estructuras metálicas 3G/4G/6G (MDT Cat. C2)', unidad: 'hora', tipo: 'mano_de_obra', precio: 5.85, prov: 'GRUPO-SARA', subfam: 'SF429' },
  { codigo: 'MO-EC-004', nombre: 'Plomero instalador hidrosanitario / termofusión (MDT Cat. D2)', unidad: 'hora', tipo: 'mano_de_obra', precio: 4.30, prov: 'GRUPO-SARA', subfam: 'SF429' },
  { codigo: 'MO-EC-005', nombre: 'Pintor especializado de acabados y fachadas (MDT Cat. D2)', unidad: 'hora', tipo: 'mano_de_obra', precio: 4.35, prov: 'GRUPO-SARA', subfam: 'SF429' },
  { codigo: 'MO-EC-006', nombre: 'Operador de equipo pesado (Excavadora / Motoniveladora) (MDT Cat. C1)', unidad: 'hora', tipo: 'mano_de_obra', precio: 5.15, prov: 'GRUPO-SARA', subfam: 'SF429' },
  { codigo: 'MO-EC-007', nombre: 'Peón de obra civil y ayudante general (MDT Cat. E2)', unidad: 'hora', tipo: 'mano_de_obra', precio: 3.85, prov: 'GRUPO-SARA', subfam: 'SF429' },

  // EQUIPOS Y MAQUINARIA (TARIFAS HORARIAS ECUADOR 2026)
  { codigo: 'EQ-EC-001', nombre: 'Retroexcavadora 4x4 CAT 420 / JD 310 (Tarifa horaria)', unidad: 'hora', tipo: 'equipo', precio: 34.00, prov: 'IIASA CATERPILLAR ECUADOR', subfam: 'SF157' },
  { codigo: 'EQ-EC-002', nombre: 'Volqueta 8 m³ para desalojo y acarreo urbano (Tarifa horaria)', unidad: 'hora', tipo: 'equipo', precio: 26.00, prov: 'IIASA CATERPILLAR ECUADOR', subfam: 'SF157' },
  { codigo: 'EQ-EC-003', nombre: 'Volqueta doble troque 12-14 m³ (Tarifa horaria)', unidad: 'hora', tipo: 'equipo', precio: 35.00, prov: 'IIASA CATERPILLAR ECUADOR', subfam: 'SF157' },
  { codigo: 'EQ-EC-004', nombre: 'Rodillo compactador autopropulsado 10-12 Ton (Tarifa horaria)', unidad: 'hora', tipo: 'equipo', precio: 42.00, prov: 'IIASA CATERPILLAR ECUADOR', subfam: 'SF157' },
  { codigo: 'EQ-EC-005', nombre: 'Concretera mecánica de 1 saco a gasolina (Tarifa horaria)', unidad: 'hora', tipo: 'equipo', precio: 4.50, prov: 'ALCOMAQ CÍA. LTDA.', subfam: 'SF157' },
  { codigo: 'EQ-EC-006', nombre: 'Vibrador de hormigón a gasolina con aguja 38-45 mm (Tarifa horaria)', unidad: 'hora', tipo: 'equipo', precio: 3.20, prov: 'ALCOMAQ CÍA. LTDA.', subfam: 'SF157' },
  { codigo: 'EQ-EC-007', nombre: 'Placa compactadora vibratoria / Vibroapisonador (Tarifa horaria)', unidad: 'hora', tipo: 'equipo', precio: 3.80, prov: 'ALCOMAQ CÍA. LTDA.', subfam: 'SF157' },
  { codigo: 'EQ-EC-008', nombre: 'Soldadora eléctrica inversora industrial 250A (Tarifa horaria)', unidad: 'hora', tipo: 'equipo', precio: 3.50, prov: 'ALCOMAQ CÍA. LTDA.', subfam: 'SF157' },
  { codigo: 'EQ-EC-009', nombre: 'Camión grúa / Grúa telescópica de montaje (Tarifa horaria)', unidad: 'hora', tipo: 'equipo', precio: 42.00, prov: 'IIASA CATERPILLAR ECUADOR', subfam: 'SF157' },
  { codigo: 'EQ-EC-010', nombre: 'Bomba de hormigón telescópica montada en camión (Tarifa m³ bombeado)', unidad: 'm3', tipo: 'equipo', precio: 12.50, prov: 'HOLCIM ECUADOR S.A.', subfam: 'SF157' },
  { codigo: 'EQ-EC-011', nombre: 'Termofusora digital para tubería PPR (Tarifa horaria)', unidad: 'hora', tipo: 'equipo', precio: 1.50, prov: 'ALCOMAQ CÍA. LTDA.', subfam: 'SF157' },

  // TRANSPORTE
  { codigo: 'TRA-EC-001', nombre: 'Acarreo y desalojo de excavación en volqueta D <= 1 km (m³)', unidad: 'm3', tipo: 'transporte', precio: 1.45, prov: 'GRUPO-SARA', subfam: 'SF13656' },
  { codigo: 'TRA-EC-002', nombre: 'Sobreacarreo de material pétreo o desalojo en volqueta D > 1 km (m³·km)', unidad: 'm3-km', tipo: 'transporte', precio: 0.27, prov: 'GRUPO-SARA', subfam: 'SF13656' }
];

// ==========================================
// 3. RUBROS MAESTROS Y APUS VERIFICADOS
// ==========================================
const RUBROS_DATA = [
  // CATEGORIA 1: ESTRUCTURAS SISMORRESISTENTES (NEC-SE-DS)
  {
    codigo: 'RUB-EC-001',
    nombre: 'Hormigón sismorresistente f\'c=280 kg/cm² en vigas y columnas (incluye bombeo y aditivo plastificante)',
    categoria: 'Estructura de hormigón',
    familia_id: 'FAM-LR7UY6UJ7',
    unidad: 'm3',
    rendimiento: 0.35,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-008', cantidad: 1.05 }, // Hormigon f'c=280
      { codigo: 'EQ-EC-010', cantidad: 1.00 },  // Bomba de hormigon
      { codigo: 'MAT-EC-010', cantidad: 0.25 }, // Curador quimico
      { codigo: 'MO-EC-001', cantidad: 0.15 },  // Maestro mayor
      { codigo: 'MO-EC-002', cantidad: 0.70 },  // Albanil
      { codigo: 'MO-EC-007', cantidad: 2.10 },  // Peon
      { codigo: 'EQ-EC-006', cantidad: 0.35 }   // Vibrador
    ]
  },
  {
    codigo: 'RUB-EC-002',
    nombre: 'Hormigón sismorresistente f\'c=350 kg/cm² en muros de corte y núcleos de ascensor',
    categoria: 'Estructura de hormigón',
    familia_id: 'FAM-LR7UY6UJ7',
    unidad: 'm3',
    rendimiento: 0.40,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-009', cantidad: 1.05 }, // Hormigon f'c=350
      { codigo: 'EQ-EC-010', cantidad: 1.00 },  // Bomba
      { codigo: 'MAT-EC-010', cantidad: 0.25 }, // Curador
      { codigo: 'MO-EC-001', cantidad: 0.20 },  // Maestro
      { codigo: 'MO-EC-002', cantidad: 0.80 },  // Albanil
      { codigo: 'MO-EC-007', cantidad: 2.40 },  // Peon
      { codigo: 'EQ-EC-006', cantidad: 0.40 }   // Vibrador
    ]
  },
  {
    codigo: 'RUB-EC-003',
    nombre: 'Acero de refuerzo sismorresistente fy=4200 kg/cm² (ASTM A706 Gr. 60) figurado, cortado y colocado',
    categoria: 'Estructura de hormigón',
    familia_id: 'FAM-LR7UY6UJ7',
    unidad: 'kg',
    rendimiento: 0.05,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-013', cantidad: 1.05 }, // Varilla corrugada
      { codigo: 'MAT-EC-014', cantidad: 0.035 }, // Alambre recocido
      { codigo: 'MO-EC-001', cantidad: 0.005 }, // Maestro
      { codigo: 'MO-EC-002', cantidad: 0.045 }, // Fierrero
      { codigo: 'MO-EC-007', cantidad: 0.045 }  // Peon
    ]
  },
  {
    codigo: 'RUB-EC-004',
    nombre: 'Encofrado y desencofrado fenólico modulado para vigas, columnas y muros',
    categoria: 'Estructura de hormigón',
    familia_id: 'FAM-LR7UY6UJ7',
    unidad: 'm2',
    rendimiento: 0.90,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-023', cantidad: 0.20 }, // Tablero fenolico amortizado
      { codigo: 'MO-EC-001', cantidad: 0.10 },  // Maestro
      { codigo: 'MO-EC-002', cantidad: 0.90 },  // Encofrador
      { codigo: 'MO-EC-007', cantidad: 0.90 }   // Peon
    ]
  },
  {
    codigo: 'RUB-EC-005',
    nombre: 'Hormigón ciclópeo f\'c=180 kg/cm² + 40% piedra bola para cimientos corridos y muros',
    categoria: 'Estructura de hormigón',
    familia_id: 'FAM-LR7UY6UJ7',
    unidad: 'm3',
    rendimiento: 2.20,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-005', cantidad: 5.50 }, // 5.5 sacos cemento
      { codigo: 'MAT-EC-001', cantidad: 0.38 }, // Arena
      { codigo: 'MAT-EC-002', cantidad: 0.45 }, // Ripio
      { codigo: 'MAT-EC-003', cantidad: 0.45 }, // Piedra bola
      { codigo: 'MO-EC-001', cantidad: 0.20 },  // Maestro
      { codigo: 'MO-EC-002', cantidad: 1.80 },  // Albanil
      { codigo: 'MO-EC-007', cantidad: 5.40 },  // Peon
      { codigo: 'EQ-EC-005', cantidad: 1.50 },  // Concretera
      { codigo: 'EQ-EC-006', cantidad: 0.80 }   // Vibrador
    ]
  },

  // CATEGORIA 2: ESTRUCTURAS METÁLICAS Y CUBIERTAS
  {
    codigo: 'RUB-EC-006',
    nombre: 'Estructura metálica en perfiles IPE/HEA con soldadura homologada y pintura anticorrosiva epóxica',
    categoria: '05 Estructuras metálicas',
    familia_id: 'FAM-FVY8GQ77S',
    unidad: 'kg',
    rendimiento: 0.08,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-016', cantidad: 1.05 }, // Perfil IPE/HEA
      { codigo: 'MAT-EC-022', cantidad: 0.04 }, // Soldadura E7018
      { codigo: 'MAT-EC-021', cantidad: 0.025 }, // Pintura epoxica
      { codigo: 'MO-EC-001', cantidad: 0.010 }, // Maestro
      { codigo: 'MO-EC-003', cantidad: 0.045 }, // Soldador homologado
      { codigo: 'MO-EC-007', cantidad: 0.060 }, // Peon
      { codigo: 'EQ-EC-008', cantidad: 0.060 }, // Soldadora
      { codigo: 'EQ-EC-009', cantidad: 0.020 }  // Camion grua
    ]
  },
  {
    codigo: 'RUB-EC-007',
    nombre: 'Cubierta industrial con panel sándwich de poliuretano inyectado (PUR e=40 mm) prepintado',
    categoria: '05 Estructuras metálicas',
    familia_id: 'FAM-FVY8GQ77S',
    unidad: 'm2',
    rendimiento: 0.40,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-019', cantidad: 1.05 }, // Panel PUR 40mm
      { codigo: 'MO-EC-001', cantidad: 0.05 },  // Maestro
      { codigo: 'MO-EC-002', cantidad: 0.40 },  // Montador
      { codigo: 'MO-EC-007', cantidad: 0.40 }   // Peon
    ]
  },
  {
    codigo: 'RUB-EC-008',
    nombre: 'Pernos de anclaje de alta resistencia ASTM A325 d=3/4" L=500 mm con placa base y mortero Grout',
    categoria: '05 Estructuras metálicas',
    familia_id: 'FAM-FVY8GQ77S',
    unidad: 'u',
    rendimiento: 0.60,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-020', cantidad: 1.00 }, // Perno A325
      { codigo: 'MAT-EC-012', cantidad: 0.25 }, // Grout (saco 25kg / 4)
      { codigo: 'MO-EC-001', cantidad: 0.10 },  // Maestro
      { codigo: 'MO-EC-003', cantidad: 0.50 },  // Mecanico
      { codigo: 'MO-EC-007', cantidad: 0.50 }   // Peon
    ]
  },
  {
    codigo: 'RUB-EC-009',
    nombre: 'Correas metálicas tipo "G" conformadas en frío (100x50x15x2 mm) con pintura anticorrosiva',
    categoria: '05 Estructuras metálicas',
    familia_id: 'FAM-FVY8GQ77S',
    unidad: 'kg',
    rendimiento: 0.07,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-017', cantidad: 1.04 }, // Perfil G
      { codigo: 'MAT-EC-021', cantidad: 0.015 }, // Anticorrosivo
      { codigo: 'MO-EC-001', cantidad: 0.01 },  // Maestro
      { codigo: 'MO-EC-003', cantidad: 0.04 },  // Soldador
      { codigo: 'MO-EC-007', cantidad: 0.05 }   // Peon
    ]
  },
  {
    codigo: 'RUB-EC-010',
    nombre: 'Losa mixta colaborante con lámina Novalosa / Steel Deck cal. 22 e=15 cm con malla electrosoldada',
    categoria: '05 Estructuras metálicas',
    familia_id: 'FAM-FVY8GQ77S',
    unidad: 'm2',
    rendimiento: 0.55,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-018', cantidad: 1.05 }, // Novalosa
      { codigo: 'MAT-EC-015', cantidad: 1.05 }, // Malla electrosoldada
      { codigo: 'MAT-EC-007', cantidad: 0.10 }, // 10cm hormigon f'c 210
      { codigo: 'MO-EC-001', cantidad: 0.08 },  // Maestro
      { codigo: 'MO-EC-002', cantidad: 0.50 },  // Albanil
      { codigo: 'MO-EC-007', cantidad: 0.80 },  // Peon
      { codigo: 'EQ-EC-006', cantidad: 0.20 }   // Vibrador
    ]
  },

  // CATEGORIA 3: INSTALACIONES HIDROSANITARIAS Y ALCANTARILLADO
  {
    codigo: 'RUB-EC-011',
    nombre: 'Tubería de termofusión PPR PN-20 DN 25 mm (3/4") empotrada para agua fría y caliente con accesorios',
    categoria: '14 Instalaciones hidrosanitarias',
    familia_id: 'FAM-YB3QCGPPL',
    unidad: 'm',
    rendimiento: 0.45,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-025', cantidad: 0.27 }, // Tramos de 4m
      { codigo: 'MO-EC-001', cantidad: 0.03 },  // Maestro
      { codigo: 'MO-EC-004', cantidad: 0.40 },  // Plomero termofusion
      { codigo: 'MO-EC-007', cantidad: 0.40 },  // Peon
      { codigo: 'EQ-EC-011', cantidad: 0.35 }   // Termofusora
    ]
  },
  {
    codigo: 'RUB-EC-012',
    nombre: 'Punto de agua potable empotrado en PPR PN-20 DN 20 mm con terminal de bronce roscado',
    categoria: '14 Instalaciones hidrosanitarias',
    familia_id: 'FAM-YB3QCGPPL',
    unidad: 'pto',
    rendimiento: 1.50,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-024', cantidad: 0.75 }, // Tramos de tuberia PPR
      { codigo: 'MO-EC-001', cantidad: 0.10 },  // Maestro
      { codigo: 'MO-EC-004', cantidad: 1.20 },  // Plomero
      { codigo: 'MO-EC-007', cantidad: 1.20 },  // Peon
      { codigo: 'EQ-EC-011', cantidad: 0.80 }   // Termofusora
    ]
  },
  {
    codigo: 'RUB-EC-013',
    nombre: 'Punto de desagüe sanitario PVC 110 mm (4") para inodoro con codo y ventilación',
    categoria: '14 Instalaciones hidrosanitarias',
    familia_id: 'FAM-YB3QCGPPL',
    unidad: 'pto',
    rendimiento: 1.80,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-026', cantidad: 0.60 }, // Tubo PVC 110mm
      { codigo: 'MO-EC-001', cantidad: 0.10 },  // Maestro
      { codigo: 'MO-EC-004', cantidad: 1.40 },  // Plomero
      { codigo: 'MO-EC-007', cantidad: 1.50 }   // Peon
    ]
  },
  {
    codigo: 'RUB-EC-014',
    nombre: 'Red colectora de alcantarillado sanitario/pluvial PVC unión Z elastomérica DN 200 mm (8")',
    categoria: '14 Instalaciones hidrosanitarias',
    familia_id: 'FAM-YB3QCGPPL',
    unidad: 'm',
    rendimiento: 0.35,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-027', cantidad: 1.03 }, // Tubo PVC alcantarillado 200mm
      { codigo: 'MAT-EC-001', cantidad: 0.04 }, // Cama de arena
      { codigo: 'MO-EC-001', cantidad: 0.04 },  // Maestro
      { codigo: 'MO-EC-004', cantidad: 0.35 },  // Plomero
      { codigo: 'MO-EC-007', cantidad: 0.70 }   // Peon
    ]
  },
  {
    codigo: 'RUB-EC-015',
    nombre: 'Pozo de revisión de alcantarillado H=1.50 m con cuerpo de H.S. f\'c=210 kg/cm² y tapa hierro dúctil D400',
    categoria: '14 Instalaciones hidrosanitarias',
    familia_id: 'FAM-YB3QCGPPL',
    unidad: 'u',
    rendimiento: 12.00,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-007', cantidad: 1.65 }, // Hormigon f'c 210
      { codigo: 'MAT-EC-028', cantidad: 1.00 }, // Tapa hierro ductil D400
      { codigo: 'MO-EC-001', cantidad: 1.20 },  // Maestro
      { codigo: 'MO-EC-002', cantidad: 6.00 },  // Albanil
      { codigo: 'MO-EC-007', cantidad: 12.00 }, // Peon
      { codigo: 'EQ-EC-005', cantidad: 3.50 },  // Concretera
      { codigo: 'EQ-EC-006', cantidad: 2.00 }   // Vibrador
    ]
  },
  {
    codigo: 'RUB-EC-016',
    nombre: 'Sumidero de calzada tipo rejilla con cuerpo de H.S. f\'c=210 kg/cm² y rejilla hierro dúctil D400 con bisagra',
    categoria: '14 Instalaciones hidrosanitarias',
    familia_id: 'FAM-YB3QCGPPL',
    unidad: 'u',
    rendimiento: 6.00,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-007', cantidad: 0.65 }, // Hormigon f'c 210
      { codigo: 'MAT-EC-029', cantidad: 1.00 }, // Rejilla hierro ductil D400
      { codigo: 'MO-EC-001', cantidad: 0.60 },  // Maestro
      { codigo: 'MO-EC-002', cantidad: 3.00 },  // Albanil
      { codigo: 'MO-EC-007', cantidad: 6.00 },  // Peon
      { codigo: 'EQ-EC-005', cantidad: 1.50 }   // Concretera
    ]
  },
  {
    codigo: 'RUB-EC-017',
    nombre: 'Suministro e instalación de inodoro ecológico de bajo consumo 4.8 L con asiento y accesorios',
    categoria: '14 Instalaciones hidrosanitarias',
    familia_id: 'FAM-YB3QCGPPL',
    unidad: 'u',
    rendimiento: 1.80,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-030', cantidad: 1.00 }, // Inodoro ecologico
      { codigo: 'MO-EC-001', cantidad: 0.15 },  // Maestro
      { codigo: 'MO-EC-004', cantidad: 1.50 },  // Plomero
      { codigo: 'MO-EC-007', cantidad: 0.80 }   // Peon
    ]
  },
  {
    codigo: 'RUB-EC-018',
    nombre: 'Suministro e instalación de lavamanos con mezcladora monomando cromo FV y desagüe',
    categoria: '14 Instalaciones hidrosanitarias',
    familia_id: 'FAM-YB3QCGPPL',
    unidad: 'jgo',
    rendimiento: 1.50,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-031', cantidad: 1.00 }, // Juego lavamanos + griferia
      { codigo: 'MO-EC-001', cantidad: 0.10 },  // Maestro
      { codigo: 'MO-EC-004', cantidad: 1.20 },  // Plomero
      { codigo: 'MO-EC-007', cantidad: 0.60 }   // Peon
    ]
  },

  // CATEGORIA 4: ACABADOS DE PRIMERA Y CONSTRUCCIÓN LIVIANA
  {
    codigo: 'RUB-EC-019',
    nombre: 'Piso de porcelanato rectificado 60x60 / 60x120 cm alto tráfico instalado con mortero Bondex Plus',
    categoria: '08 Pisos y revestimientos',
    familia_id: 'FAM-ZCA295CJV',
    unidad: 'm2',
    rendimiento: 0.85,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-032', cantidad: 1.05 }, // Porcelanato 60x60
      { codigo: 'MAT-EC-033', cantidad: 0.20 }, // 5kg mortero Bondex (saco 25kg / 5)
      { codigo: 'MO-EC-001', cantidad: 0.05 },  // Maestro
      { codigo: 'MO-EC-002', cantidad: 0.70 },  // Ceramista
      { codigo: 'MO-EC-007', cantidad: 0.70 }   // Peon
    ]
  },
  {
    codigo: 'RUB-EC-020',
    nombre: 'Cielo raso / Tumbado de Gypsum estándar 1/2" con estructura de perfiles galvanizados y empaste',
    categoria: '09 Construcción liviana',
    familia_id: 'FAM-NGZV1TUDC',
    unidad: 'm2',
    rendimiento: 0.75,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-034', cantidad: 0.37 }, // Plancha Gypsum 1.22x2.44
      { codigo: 'MAT-EC-035', cantidad: 0.70 }, // Perfiles montantes
      { codigo: 'MO-EC-001', cantidad: 0.05 },  // Maestro
      { codigo: 'MO-EC-002', cantidad: 0.60 },  // Instalador gypsum
      { codigo: 'MO-EC-007', cantidad: 0.60 }   // Peon
    ]
  },
  {
    codigo: 'RUB-EC-021',
    nombre: 'Pintura elastomérica impermeable exterior en fachadas (3 manos) con sellador antialcalino',
    categoria: '13 Pinturas',
    familia_id: 'FAM-0ALSBXIS1',
    unidad: 'm2',
    rendimiento: 0.30,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-036', cantidad: 0.035 }, // Caneca 5 gal / 140 m2
      { codigo: 'MO-EC-001', cantidad: 0.03 },   // Maestro
      { codigo: 'MO-EC-005', cantidad: 0.30 },   // Pintor
      { codigo: 'MO-EC-007', cantidad: 0.25 }    // Peon
    ]
  },

  // CATEGORIA 5: VIALIDAD Y URBANISMO
  {
    codigo: 'RUB-EC-022',
    nombre: 'Carpeta asfáltica en caliente e=7.5 cm (Mezcla Asfáltica MTOP) extendida y compactada al 98%',
    categoria: '19 Urbanización y vialidad',
    familia_id: 'FAM-08SG9TWRQ',
    unidad: 'm2',
    rendimiento: 0.04,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-038', cantidad: 0.08 }, // 0.075 m3 + merma
      { codigo: 'MO-EC-001', cantidad: 0.01 },  // Maestro
      { codigo: 'MO-EC-006', cantidad: 0.03 },  // Operador maquinaria
      { codigo: 'MO-EC-007', cantidad: 0.06 },  // Rastrillero / peon
      { codigo: 'EQ-EC-004', cantidad: 0.02 }   // Rodillo compactador
    ]
  },
  {
    codigo: 'RUB-EC-023',
    nombre: 'Subbase granular Clase 3 MTOP extendida y compactada al 100% Proctor Modificado e=20 cm',
    categoria: '19 Urbanización y vialidad',
    familia_id: 'FAM-08SG9TWRQ',
    unidad: 'm3',
    rendimiento: 0.08,
    herramienta_menor_pct: 5,
    insumos: [
      { codigo: 'MAT-EC-004', cantidad: 1.25 }, // Subbase granular con factor esponjamiento/compactacion
      { codigo: 'MO-EC-001', cantidad: 0.02 },  // Maestro
      { codigo: 'MO-EC-006', cantidad: 0.06 },  // Operador motoniveladora/rodillo
      { codigo: 'MO-EC-007', cantidad: 0.10 },  // Peon
      { codigo: 'EQ-EC-004', cantidad: 0.05 },  // Rodillo
      { codigo: 'TRA-EC-001', cantidad: 1.00 }  // Acarreo inicial
    ]
  }
];

async function seed() {
  console.log('--- INICIANDO EXPANSIÓN DE CATÁLOGO GRUPO SARA (ECUADOR 2026) ---');

  // 1. PROVEEDORES
  console.log('\n1. Procesando Proveedores...');
  const provMap = {}; // nombre -> id

  for (const prov of PROVEEDORES_DATA) {
    // Buscar si existe por RUC o razon_social
    const { data: existing } = await supabase
      .from('proveedores')
      .select('id, razon_social')
      .or(`ruc.eq.${prov.ruc},razon_social.ilike.%${prov.razon_social.split(' ')[0]}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      provMap[prov.razon_social] = existing[0].id;
      // Actualizar datos si es necesario
      await supabase.from('proveedores').update({
        razon_social: prov.razon_social,
        contacto_vendedor: prov.contacto_vendedor,
        telefono: prov.telefono,
        email: prov.email,
        direccion: prov.direccion,
        sitio_web: prov.sitio_web,
        estado: true
      }).eq('id', existing[0].id);
      console.log(`  [OK] Proveedor actualizado: ${prov.razon_social}`);
    } else {
      const { data: inserted, error: insErr } = await supabase.from('proveedores').insert([{
        razon_social: prov.razon_social,
        ruc: prov.ruc,
        contacto_vendedor: prov.contacto_vendedor,
        telefono: prov.telefono,
        email: prov.email,
        direccion: prov.direccion,
        sitio_web: prov.sitio_web,
        estado: true
      }]).select('id');

      if (insErr) {
        console.error(`  [ERROR] Al insertar proveedor ${prov.razon_social}:`, insErr.message);
      } else if (inserted && inserted[0]) {
        provMap[prov.razon_social] = inserted[0].id;
        console.log(`  [INSERT] Nuevo proveedor creado: ${prov.razon_social}`);
      }
    }
  }

  // 2. INSUMOS
  console.log('\n2. Procesando Insumos Maestros...');
  const insumoMap = {}; // codigo -> { id, precio }

  for (const ins of INSUMOS_DATA) {
    const provId = provMap[ins.prov] || null;

    // Buscar si ya existe por codigo
    const { data: existing } = await supabase
      .from('insumos')
      .select('id, codigo, precio_sin_iva')
      .eq('codigo', ins.codigo)
      .limit(1);

    if (existing && existing.length > 0) {
      const id = existing[0].id;
      await supabase.from('insumos').update({
        nombre: ins.nombre,
        unidad: ins.unidad,
        tipo: ins.tipo,
        precio_sin_iva: ins.precio,
        proveedor_id: provId,
        subfamilia_id: ins.subfam,
        es_maestro: true,
        is_global: true,
        user_id: null,
        estado: true
      }).eq('id', id);

      insumoMap[ins.codigo] = { id, precio: ins.precio, nombre: ins.nombre, unidad: ins.unidad, tipo: ins.tipo };
      console.log(`  [OK] Insumo actualizado: ${ins.codigo} - ${ins.nombre} ($${ins.precio})`);
    } else {
      const { data: inserted, error: insErr } = await supabase.from('insumos').insert([{
        codigo: ins.codigo,
        nombre: ins.nombre,
        unidad: ins.unidad,
        tipo: ins.tipo,
        precio_sin_iva: ins.precio,
        proveedor_id: provId,
        subfamilia_id: ins.subfam,
        es_maestro: true,
        is_global: true,
        user_id: null,
        estado: true
      }]).select('id');

      if (insErr) {
        console.error(`  [ERROR] Insumo ${ins.codigo}:`, insErr.message);
      } else if (inserted && inserted[0]) {
        const id = inserted[0].id;
        insumoMap[ins.codigo] = { id, precio: ins.precio, nombre: ins.nombre, unidad: ins.unidad, tipo: ins.tipo };
        console.log(`  [INSERT] Insumo creado: ${ins.codigo} - ${ins.nombre} ($${ins.precio})`);
      }
    }
  }

  // 3. RUBROS Y SUS APUS (RECETAS)
  console.log('\n3. Procesando Rubros y Recetas de APU...');
  
  // Buscar subfamilias "General" para cada familia_id de rubros
  const subfamCache = {};
  for (const rub of RUBROS_DATA) {
    if (!subfamCache[rub.familia_id]) {
      const { data: sub } = await supabase
        .from('subfamilias')
        .select('id')
        .eq('familia_id', rub.familia_id)
        .limit(1);
      if (sub && sub[0]) {
        subfamCache[rub.familia_id] = sub[0].id;
      }
    }
  }

  const rubrosCreados = [];

  for (const rub of RUBROS_DATA) {
    const subId = subfamCache[rub.familia_id] || null;

    // Calcular costo directo unitario basado en los insumos y % herramienta menor
    let subtotalMat = 0;
    let subtotalMO = 0;
    let subtotalEq = 0;

    for (const item of rub.insumos) {
      const insObj = insumoMap[item.codigo];
      if (insObj) {
        const cost = insObj.precio * item.cantidad;
        if (insObj.tipo === 'material' || insObj.tipo === 'transporte') subtotalMat += cost;
        else if (insObj.tipo === 'mano_de_obra') subtotalMO += cost;
        else if (insObj.tipo === 'equipo') subtotalEq += cost;
      }
    }

    const herramientaMenorCosto = subtotalMO * (rub.herramienta_menor_pct / 100);
    const totalCostoDirecto = Number((subtotalMat + subtotalMO + subtotalEq + herramientaMenorCosto).toFixed(4));

    // Buscar o insertar rubro
    const { data: existingRub } = await supabase
      .from('rubros')
      .select('id')
      .eq('codigo', rub.codigo)
      .limit(1);

    let rubroId;
    if (existingRub && existingRub.length > 0) {
      rubroId = existingRub[0].id;
      await supabase.from('rubros').update({
        nombre: rub.nombre,
        categoria: rub.categoria,
        unidad: rub.unidad,
        rendimiento: rub.rendimiento,
        herramienta_menor_pct: rub.herramienta_menor_pct,
        total_costo_directo: totalCostoDirecto,
        subfamilia_id: subId,
        es_maestro: true,
        is_global: true,
        user_id: null,
        estado: true
      }).eq('id', rubroId);
      console.log(`  [OK] Rubro actualizado: ${rub.codigo} - ${rub.nombre} ($${totalCostoDirecto.toFixed(2)})`);
    } else {
      const { data: inserted, error: rErr } = await supabase.from('rubros').insert([{
        codigo: rub.codigo,
        nombre: rub.nombre,
        categoria: rub.categoria,
        unidad: rub.unidad,
        rendimiento: rub.rendimiento,
        herramienta_menor_pct: rub.herramienta_menor_pct,
        total_costo_directo: totalCostoDirecto,
        subfamilia_id: subId,
        es_maestro: true,
        is_global: true,
        user_id: null,
        estado: true
      }]).select('id');

      if (rErr) {
        console.error(`  [ERROR] Rubro ${rub.codigo}:`, rErr.message);
        continue;
      }
      rubroId = inserted[0].id;
      console.log(`  [INSERT] Rubro creado: ${rub.codigo} - ${rub.nombre} ($${totalCostoDirecto.toFixed(2)})`);
    }

    // Limpiar insumos antiguos de la receta y reinsertar receta limpia
    await supabase.from('rubro_insumos').delete().eq('rubro_id', rubroId);

    const recipeRows = [];
    for (const item of rub.insumos) {
      const insObj = insumoMap[item.codigo];
      if (insObj) {
        recipeRows.push({
          rubro_id: rubroId,
          insumo_id: insObj.id,
          cantidad: item.cantidad,
          user_id: null
        });
      }
    }

    if (recipeRows.length > 0) {
      const { error: recErr } = await supabase.from('rubro_insumos').insert(recipeRows);
      if (recErr) {
        console.error(`  [ERROR] Receta rubro ${rub.codigo}:`, recErr.message);
      } else {
        console.log(`    -> ${recipeRows.length} insumos vinculados en receta de APU.`);
      }
    }

    rubrosCreados.push({
      codigo: rub.codigo,
      nombre: rub.nombre,
      categoria: rub.categoria,
      unidad: rub.unidad,
      rendimiento: rub.rendimiento,
      costo_directo: totalCostoDirecto,
      insumos_count: recipeRows.length,
      desglose: {
        materiales: subtotalMat,
        mano_obra: subtotalMO,
        equipos: subtotalEq,
        herramienta_menor: herramientaMenorCosto
      }
    });
  }

  // Guardar archivo JSON estructurado para el generador del PDF
  const reportData = {
    fecha_generacion: new Date().toISOString(),
    total_proveedores: PROVEEDORES_DATA.length,
    total_insumos: INSUMOS_DATA.length,
    total_rubros: rubrosCreados.length,
    proveedores: PROVEEDORES_DATA,
    insumos: INSUMOS_DATA,
    rubros: rubrosCreados
  };

  fs.writeFileSync('scripts/catalogo_ecuador_report_data.json', JSON.stringify(reportData, null, 2), 'utf-8');
  console.log('\n[ÉXITO] Datos guardados en scripts/catalogo_ecuador_report_data.json');
  console.log(`Resumen: ${PROVEEDORES_DATA.length} Proveedores | ${INSUMOS_DATA.length} Insumos | ${rubrosCreados.length} Rubros con APU.`);
}

seed().catch(console.error);
