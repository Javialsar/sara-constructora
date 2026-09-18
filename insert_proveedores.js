const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const proveedores = [
  { razon_social: 'Acesco Ecuador', direccion: 'Km. 16.5 vía Daule, Guayaquil', telefono: '(04) 3701500', sitio_web: 'https://acesco.com.ec/', contacto_vendedor: 'Ventas Acesco' },
  { razon_social: 'ACIMCO Cia. Ltda.', direccion: 'De los Eucaliptos E10-180 y Av. Eloy Alfaro, Quito', telefono: '(02) 600 3160', sitio_web: 'https://www.acimco.com/', contacto_vendedor: 'Envolventes Arquitectonicos' },
  { razon_social: 'ADELCA S.A.', direccion: 'Km. 10 ½ vía Daule, Guayaquil', telefono: '098 682 3541', sitio_web: 'https://www.adelca.com/', contacto_vendedor: 'Ventas Adelca' },
  { razon_social: 'AGA Distribuidora', direccion: 'Av. Cuxibamba y Cañar, Loja', telefono: '07 2561349', sitio_web: 'https://distribuidoraga.wordpress.com/', contacto_vendedor: 'Ventas AGA' },
  { razon_social: 'ANDEC S.A. - Fuerza Interior', direccion: 'Av. Las Esclusas Solar 9 Primer Pasaje 12C SE Mz.2009, Guayaquil', telefono: '2904-3815', sitio_web: 'https://www.andec.com.ec/', contacto_vendedor: 'Servicio al Cliente' },
  { razon_social: 'APUCONS Software', direccion: 'Ave. Carlos Julio Arosemena Km 2.5 y Las Monjas, Guayaquil', telefono: '098-760-2241', sitio_web: 'https://www.apucons.com', contacto_vendedor: 'Soporte Apucons' },
  { razon_social: 'ARQUIMAC S.A. Constructora', direccion: 'Inglaterra y Republica, Quito', telefono: '0993307837', sitio_web: 'https://arquimac-ec.com/', contacto_vendedor: 'Ventas Arquimac' },
  { razon_social: 'BEATLECH', direccion: 'Urb. Oporto Mz 1457 Villa 19', telefono: '0981683697', sitio_web: 'https://www.beatlech.com', contacto_vendedor: 'Servicios Web' },
  { razon_social: 'BEST VALUE', direccion: '3505 NW 107th Ave Miami, FL 33178', telefono: '+1 (305) 728-8577', sitio_web: 'https://www.best-value.net/', contacto_vendedor: 'Importaciones' },
  { razon_social: 'CALIDAD CLOUD', direccion: 'Av. El Bosque Nte. 0107, Of 32, Providencia, Chile', telefono: '+56 9 4273 1373', sitio_web: 'https://www.calidadcloud.com/', contacto_vendedor: 'Software Calidad' },
  { razon_social: 'Cámara de la Construcción de Guayaquil', direccion: 'Av. Francisco de Orellana y Miguel H. Alcívar, Guayaquil', telefono: '(04) 268 2340', sitio_web: 'https://camaraconstrucciongye.org/', contacto_vendedor: 'Administración' },
  { razon_social: 'CONSTRUDIPRO S.A.', direccion: 'A la salida norte del Aeropuerto José Joaquín de Olmedo, Guayaquil', telefono: '+593 4 4607500', sitio_web: 'https://construdipro.com/', contacto_vendedor: 'Ventas Construdipro' },
  { razon_social: 'CONSTRULOJA', direccion: 'Mireya Espinosa Carrión, Loja', telefono: '098 000 5958', sitio_web: 'https://www.instagram.com/construlojacl/', contacto_vendedor: 'Atención al Cliente' },
  { razon_social: 'CORPORACIÓN ACEROS AREQUIPA AA S.A.S.', direccion: 'Vía Durán Tampo KM. 8.5 Durán', telefono: '+593 98 635 9258', sitio_web: 'https://acerosarequipa.com/ec/', contacto_vendedor: 'Ventas Acero' },
  { razon_social: 'DISENSA Franquiciado BARTON S.A.', direccion: 'KM 3 VIA DURAN-TAMBO #37-B', telefono: '043710720', sitio_web: 'https://disensa.com.ec', contacto_vendedor: 'Ventas Disensa' },
  { razon_social: 'DISTRIFLEX S.A.', direccion: 'Mapasingue Oeste, Calle primera y avenida segunda #201', telefono: '+593 99 887 3845', sitio_web: 'https://distriflex.com.ec/', contacto_vendedor: 'Productos Elastomericos' },
  { razon_social: 'DOLMEN S.A.', direccion: 'Av. Juan Tanca Marengo Km 2.5 Centro Comercial Dicentro', telefono: '0989717813', sitio_web: 'https://dolmen.com.ec/', contacto_vendedor: 'Ventas Dolmen' },
  { razon_social: 'EASYMAX', direccion: 'Calle Cobre & Av. Rosavín, Vía a Daule Km.16, Guayaquil', telefono: '099 295 0514', sitio_web: 'https://www.easymax.com.ec', contacto_vendedor: 'Ventas Easymax' },
  { razon_social: 'ECOLIVING', direccion: 'Av. República del Salvador N34-140, Quito', telefono: '+593 99 886 9416', sitio_web: 'https://www.ecolivingec.com/', contacto_vendedor: 'Especialistas Steel Framing' },
  { razon_social: 'Ecuacerámica', direccion: 'Riobamba, Chimborazo', telefono: '(03) 296-1948', sitio_web: 'https://ecuaceramica.com/', contacto_vendedor: 'Ventas Nacionales' },
  { razon_social: 'EDIMCA', direccion: 'Av José Gómez Gault 105-107, Guayaquil', telefono: '04-2252540', sitio_web: 'https://edimca.com.ec/', contacto_vendedor: 'Ventas Madera' },
  { razon_social: 'ELECTROCABLES S.A.', direccion: 'Parque Industrial El Sauce Km. 11 1/2 vía a Daule, Guayaquil', telefono: '(04) 3705460', sitio_web: 'http://www.electrocable.com/', contacto_vendedor: 'Ventas Cables' },
  { razon_social: 'ESAB (Bohman)', direccion: 'Km 6 1/2 Vía a Daule, Ave. Principal, Guayaquil', telefono: '096-931-3993', sitio_web: 'https://www.bohman.com.ec/', contacto_vendedor: 'Ventas Soldadura' },
  { razon_social: 'ESTRUCTURAS KLAERE', direccion: 'Durán, Guayas', telefono: '093 978 1816', sitio_web: 'http://www.estructurasklaere.com/', contacto_vendedor: 'Estructuras Metálicas' },
  { razon_social: 'ETINAR S.A.', direccion: 'Av. Joaquin Orrantia, Edif. Agora 21 Piso 8, Guayaquil', telefono: '099 072 4769', sitio_web: 'https://www.etinar.com/', contacto_vendedor: 'Ventas Etinar' },
  { razon_social: 'FV Area Andina S.A.', direccion: 'Centro Comercial Albán Borja Local #79, Guayaquil', telefono: '(04) 220-5897', sitio_web: 'https://fvandina.com/', contacto_vendedor: 'Grifería y Sanitarios' },
  { razon_social: 'Holcim / GacoFlex', direccion: 'Av. Barcelona y Calle José Rodríguez Bonín, Edificio El Caimán', telefono: '(04) 370-9000', sitio_web: 'https://www.holcim.com.ec/', contacto_vendedor: 'Soluciones Holcim' },
  { razon_social: 'HORMIPISOS', direccion: 'Autopista Cuenca - Azogues, Cuenca', telefono: '(07) 288-4222', sitio_web: 'https://www.hormipisos.com/', contacto_vendedor: 'Ventas Cuenca' },
  { razon_social: 'IDEAL ALAMBREC', direccion: 'Quito, Ecuador', telefono: '(01800) 252 627', sitio_web: 'https://idealalambrec.bekaert.com/', contacto_vendedor: 'Atención al Cliente' },
  { razon_social: 'IMPTEK (Chova)', direccion: 'Planta Industrial Imptek', telefono: '(02) 600-3450', sitio_web: 'https://www.imptekcorp.com/', contacto_vendedor: 'Impermeabilización' },
  { razon_social: 'INDURA', direccion: 'Km 14.5 Vía Daule, Guayaquil', telefono: '(01800) 463 872', sitio_web: 'https://www.facebook.com/soldadura.gas.ecuador/', contacto_vendedor: 'Gases y Soldaduras' },
  { razon_social: 'INGEOMAT S.A.', direccion: 'LA GARZOTA II MANZANA 135 SOLAR 16', telefono: '099 828 2397', sitio_web: 'http://ingeomatsa.com/', contacto_vendedor: 'Estudios de Suelos' },
  { razon_social: 'INTACO', direccion: 'Km 5.5 vía a Daule, Guayaquil', telefono: '(04) 373-1555', sitio_web: 'https://www.intaco.com/ecuador/', contacto_vendedor: 'Ventas Intaco' },
  { razon_social: 'IPAC', direccion: 'Km. 10.5 Via Daule, Guayaquil', telefono: '(04) 370-2120', sitio_web: 'https://ipac-acero.com/', contacto_vendedor: 'Ventas Acero' },
  { razon_social: 'KÄRCHER ECUADOR S.A.', direccion: 'Av. Juan Tanca Marengo No. SOLAR 24, Guayaquil', telefono: '(04) 600-5867', sitio_web: 'https://www.kaercher.com/int/', contacto_vendedor: 'Equipos Limpieza' },
  { razon_social: 'KUBIEC', direccion: 'Av. Huayanay Ñan OE1 – 476 Panamericana Sur Km 10, Quito', telefono: '(02) 720 1700', sitio_web: 'https://kubiec.com/', contacto_vendedor: 'Ventas Acero' },
  { razon_social: 'LAIMEDCON S.A.', direccion: 'AVENIDA JUAN TANCA MARENGO NRO.VILLA 39', telefono: '0968489873', sitio_web: 'https://ec.linkedin.com/company/laimedec', contacto_vendedor: 'Consultoría' },
  { razon_social: 'LEDEX', direccion: 'Los Arcos Plaza, km. 1.5 vía Samborondón', telefono: '(04) 380 5630', sitio_web: 'https://almacenesmarriott.com/ledex/', contacto_vendedor: 'Iluminación' },
  { razon_social: 'MACON', direccion: 'Mapasingue Este Cl 8ava 107 y Av 1era, Guayaquil', telefono: '0998744098', sitio_web: 'https://www.edina.com.ec/andamios...', contacto_vendedor: 'Alquiler Andamios' },
  { razon_social: 'MAVIJU S.A.', direccion: 'Km 4.5 Vía a Daule #103, Guayaquil', telefono: '(04) 371 2520', sitio_web: 'https://maviju.com/', contacto_vendedor: 'Ventas Maviju' },
  { razon_social: 'MAVISA S.A.', direccion: 'Durán, Urb. Democrática sur y Av. León-Febres Cordero', telefono: '(04) 280-5124', sitio_web: 'https://mavisa.ec/', contacto_vendedor: 'Prefabricados' },
  { razon_social: 'Medifra Cia. Ltda.', direccion: 'E14-A y Olivos, San Isidro del Inca, Quito', telefono: '(02) 241 7963', sitio_web: 'https://medifraecuador.com/', contacto_vendedor: 'Salud Ocupacional' },
  { razon_social: 'Mi Flota', direccion: 'Ave. Juan Tanca Marengo Km 5, Guayaquil', telefono: '099 276 0357', sitio_web: 'https://www.miflota.com/inicio', contacto_vendedor: 'Gestión de Flotas' },
  { razon_social: 'NOVACERO S.A.', direccion: 'Cdla Santa Leonor Mz 5 Sl 16, Guayaquil', telefono: '(04) 3800600', sitio_web: 'https://www.novacero.com/', contacto_vendedor: 'Ventas Novacero' },
  { razon_social: 'PEARL', direccion: 'Vía a Samborondón en el KM 14.5 – El P.A.N. Guayaquil', telefono: '096 927 5866', sitio_web: 'https://www.pearlwatersystems.com/', contacto_vendedor: 'Sistemas de Agua' },
  { razon_social: 'PINTURAS UNIDAS', direccion: 'Km 16.5 via Daule, Guayaquil', telefono: '(04) 2590280', sitio_web: 'https://pinturasunidas.com/', contacto_vendedor: 'Ventas Pinturas' },
  { razon_social: 'PLASTIDOR', direccion: 'La Aurora, Edificio Brickell Tower Daule', telefono: '(04) 225-0370', sitio_web: 'https://www.plastidor.com/', contacto_vendedor: 'Tuberías' },
  { razon_social: 'PLASTIGAMA WAVIN', direccion: 'Km 4,5 Vía Durán-Tambo Durán', telefono: '(04) 3716900', sitio_web: 'https://www.wavin.com/es-ec', contacto_vendedor: 'Tuberías y Conexiones' },
  { razon_social: 'PRECRETO', direccion: 'Km 19 Vía a la Costa, Guayaquil', telefono: '09 9641 6037', sitio_web: 'https://precreto.com/', contacto_vendedor: 'Prefabricados' },
  { razon_social: 'Sika Ecuador', direccion: 'Km. 3.5 vía Durán-Tambo Durán', telefono: '098 750 0438', sitio_web: 'https://ecu.sika.com/', contacto_vendedor: 'Aditivos Químicos' },
  { razon_social: 'SYLVANIA', direccion: 'Km. 7 1/2 vía Daule, bodegas Hilantex, Guayaquil', telefono: '(04) 265 1922', sitio_web: 'https://sylvania.com.ec/', contacto_vendedor: 'Iluminación' },
  { razon_social: 'TUBOS PACIFICO S.A.', direccion: 'Km. 23 1/2 de la Vía Perimetral. Guayaquil', telefono: '(04) 509 8826', sitio_web: 'http://www.tubospacifico.com/', contacto_vendedor: 'Tubos' },
  { razon_social: 'WURTH (Bohman)', direccion: 'Km 6 1/2 Vía a Daule, Guayaquil', telefono: '096-931-3993', sitio_web: 'https://www.bohman.com.ec/', contacto_vendedor: 'Herramientas' }
];

async function seed() {
  const { data, error } = await supabase
    .from('proveedores')
    .insert(proveedores)
    .select();
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Successfully inserted', data.length, 'proveedores');
  }
}

seed();
