import { Phone, Mail, ShieldCheck, Target, Award, CheckCircle2, Lightbulb, Users, Cpu, Layers } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Revalidación periódica en background (ISR)
export const revalidate = 300;

export const metadata = {
  title: "Nosotros | Grupo SARA - Holding de Ingeniería & Tecnología",
  description: "Conoce a Grupo SARA: holding multisectorial líder en ingeniería civil, arquitectura, bienes raíces, hospitalidad y software en Ecuador.",
}

export default async function NosotrosPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim() || "";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: {
      fetch: (url, init) => fetch(url, { ...init, signal: controller.signal })
    }
  });

  const [{ data: config }, { data: paramData }] = await Promise.all([
    supabase.from('configuracion_empresa').select('equipo_directivo, logo_url').limit(1).maybeSingle(),
    supabase.from('parametros_globales').select('indirectos_default').eq('id', 1).maybeSingle()
  ]).catch(() => [{ data: null }, { data: null }]);

  clearTimeout(timeoutId);
  
  const dbLogos = paramData?.indirectos_default?.logos_servicios || {}
  const logoUrl = dbLogos.grupo_sara || config?.logo_url || '/logo-hero.png'
  const equipo = config?.equipo_directivo && config.equipo_directivo.length > 0 ? config.equipo_directivo : [
    {
      id: "1",
      nombre: "Javier Sarango Gona",
      cargo: "GERENTE GENERAL",
      telefono: "+593 98 180 4023",
      email: "gerencia@gruposara.ec",
      imagen_url: "/images/team/javier.png"
    },
    {
      id: "2",
      nombre: "David Sarango M.",
      cargo: "DIRECTOR DE ARQUITECTURA",
      telefono: "+593 96 290 5439",
      email: "arquitectura@gruposara.ec",
      imagen_url: "/images/team/david.png"
    },
    {
      id: "3",
      nombre: "Kevin Sarango M.",
      cargo: "DIRECTOR DE INGENIERÍA CIVIL",
      telefono: "+593 99 186 7021",
      email: "ingenieria@gruposara.ec",
      imagen_url: "/images/team/kevin.png"
    }
  ]

  return (
    <div className="min-h-screen bg-transparent">
      
      {/* Hero Section Corporativo Grupo SARA */}
      <div className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-brand-dark overflow-hidden">
        {/* Subtle Background pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
          <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <div className="inline-block bg-brand-sage/20 border border-brand-sage/40 text-brand-sage text-xs font-mono font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Holding Multisectorial · Ecuador
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tighter mb-6 uppercase drop-shadow-md">
            GRUPO SARA <br className="hidden md:block"/>
            <span className="text-brand-sage">INGENIERÍA & TECNOLOGÍA INTEGRAL</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed">
            Consolidamos un ecosistema empresarial de vanguardia que integra ingeniería civil, diseño arquitectónico, inversión inmobiliaria, hospitalidad ejecutiva, software de presupuestos, suministros mayoristas, logística pesada y pasarelas de pago blindadas en todo el Ecuador.
          </p>
        </div>
      </div>

      {/* Main Content & Logo Oficial */}
      <div className="container mx-auto px-4 md:px-8 py-8 relative z-20">
        <div className="bg-white/90 backdrop-blur-md shadow-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row rounded-[2rem]">
          
          <div className="lg:w-1/2 relative min-h-[320px] sm:min-h-[360px] bg-white flex items-center justify-center p-8 lg:p-12 overflow-hidden group border-b lg:border-b-0 lg:border-r border-gray-100">
             <div className="relative z-10 w-full h-full flex items-center justify-center">
               <img 
                 src={logoUrl} 
                 alt="Grupo SARA Matriz Corporativa" 
                 className="max-h-[260px] sm:max-h-[300px] w-auto max-w-[85%] object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-700"
               />
             </div>
          </div>

          <div className="lg:w-1/2 p-8 md:p-10 lg:p-12 space-y-6 text-gray-600 text-base md:text-lg leading-relaxed font-light flex flex-col justify-center">
            <p>
              En <strong className="font-bold text-brand-dark">GRUPO SARA</strong> lideramos el desarrollo integral de proyectos en las 24 provincias de Ecuador. Nuestra estructura empresarial unifica experiencia técnica colegiada, ingeniería sismorresistente bajo norma NEC y plataformas digitales para garantizar precisión presupuestaria y respaldo patrimonial.
            </p>
            <p>
              Abarcamos todas las etapas del ciclo de edificación: desde la adquisición de terrenos de alta plusvalía y el modelado arquitectónico BIM, hasta la provisión mayorista de materiales sin intermediarios, la dirección de obra civil llave en mano y la gestión de alojamientos turísticos y corporativos de alto estándar.
            </p>
            <p className="font-medium text-brand-dark border-l-4 border-brand-sage pl-6 italic">
              "Para GRUPO SARA, liderar significa innovar con rigor técnico, proteger el capital de nuestros clientes y construir relaciones de confianza duradera que impulsen el crecimiento de nuestro país."
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-8">
        
        {/* Principios de Grupo SARA */}
        <div className="mb-16 relative bg-brand-sage rounded-[2.5rem] py-10 px-4 md:px-12 overflow-hidden shadow-2xl">
          {/* Grid Background Pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
            <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
          
          <div className="relative z-10 text-center mb-10">
            <h2 className="text-sm font-bold tracking-[0.2em] text-brand-dark bg-white/90 inline-block px-4 py-1.5 rounded-full uppercase mb-4 shadow-sm">
              Ejes Estratégicos
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">PRINCIPIOS CORPORATIVOS</h3>
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Tarjeta 1 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-dark text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <ShieldCheck size={32} />
              </div>
              <h4 className="font-bold text-lg text-brand-sage mb-2 px-2 leading-tight">SEGURIDAD TÉCNICA & LEGAL</h4>
              <div className="w-8 h-0.5 bg-brand-dark/20 rounded-full mb-4"></div>
              <p className="text-gray-500 font-light text-sm leading-relaxed">
                Cada obra, transacción inmobiliaria y proceso logístico cuenta con validación técnica colegiada, respaldo notarial y cumplimiento estricto de las normativas de construcción vigentes en Ecuador.
              </p>
            </div>
            
            {/* Tarjeta 2 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-dark text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Cpu size={32} />
              </div>
              <h4 className="font-bold text-lg text-brand-sage mb-2 px-2 leading-tight">TECNOLOGÍA & EFICIENCIA</h4>
              <div className="w-8 h-0.5 bg-brand-dark/20 rounded-full mb-4"></div>
              <p className="text-gray-500 font-light text-sm leading-relaxed">
                Desarrollamos soluciones digitales pioneras como SARA-APU y monitoreo satelital en fletes pesados para erradicar sobrecostos, optimizar cronogramas y brindar transparencia absoluta.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-dark text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Layers size={32} />
              </div>
              <h4 className="font-bold text-lg text-brand-sage mb-2 px-2 leading-tight">SINERGIA MULTISECTORIAL</h4>
              <div className="w-8 h-0.5 bg-brand-dark/20 rounded-full mb-4"></div>
              <p className="text-gray-500 font-light text-sm leading-relaxed">
                La integración coordinada de nuestras 8 divisiones permite que propietarios, contratistas e inversionistas cuenten con una solución completa de punta a punta con un solo grupo de confianza.
              </p>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-16 bg-brand-dark text-white p-10 md:p-16 rounded-[2.5rem] relative overflow-hidden">
           <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
            <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-sm font-bold tracking-[0.2em] text-brand-sage uppercase mb-4">Cultura Organizacional</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold">VALORES DE GRUPO SARA</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
              <div className="pt-8 md:pt-0 px-4">
                <h4 className="font-bold text-2xl text-brand-sage mb-4">INTEGRIDAD</h4>
                <p className="text-gray-300 font-light">
                  Actuamos con ética irreprochable, honestidad y total transparencia en cada presupuesto, contrato y auditoría de fondos en custodia.
                </p>
              </div>
              <div className="pt-8 md:pt-0 px-4">
                <h4 className="font-bold text-2xl text-brand-sage mb-4">RESPONSABILIDAD</h4>
                <p className="text-gray-300 font-light">
                  Asumimos la custodia del patrimonio de nuestros clientes con máxima rigurosidad, administrando eficientemente recursos, tiempos y estándares de calidad.
                </p>
              </div>
              <div className="pt-8 md:pt-0 px-4">
                <h4 className="font-bold text-2xl text-brand-sage mb-4">INNOVACIÓN</h4>
                <p className="text-gray-300 font-light">
                  Fusionamos la ingeniería civil clásica con la potencia del software y la automatización para resolver con agilidad los desafíos de la construcción moderna.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Esencia */}
        <div className="mb-12 text-center max-w-4xl mx-auto space-y-8">
          <h2 className="text-sm font-bold tracking-[0.2em] text-brand-sage uppercase mb-4">NUESTRA ESENCIA</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight leading-tight">
            Ingeniería para construir. <br/>Tecnología para optimizar. <br className="md:hidden"/>Confianza para crecer.
          </h3>
          <p className="text-xl text-gray-500 font-light">
            En GRUPO SARA, cada obra, proyecto inmobiliario y avance tecnológico representa nuestro compromiso irrenunciable con el desarrollo y la prosperidad de nuestro país.
          </p>
          <div className="pt-8 mt-8 border-t border-gray-200">
            <p className="font-bold text-brand-dark text-lg uppercase tracking-wider">GRUPO SARA</p>
            <p className="text-brand-sage text-sm font-bold tracking-widest uppercase mb-4">Constructora · Inmobiliaria · Stays · APU Software · Marketplace · Fletes · Talento · Pagos</p>
            <p className="italic text-gray-500">Tecnología e ingeniería que construyen realidades.</p>
          </div>
        </div>

        {/* Sección: Nuestro Equipo Directivo (Conservada Intacta desde la BD) */}
        <div className="pt-16">
          <header className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
              Nuestro Equipo Directivo
            </h2>
            <p className="text-brand-sage font-bold tracking-widest text-sm uppercase">
              Profesionales comprometidos con la excelencia y el liderazgo técnico
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {equipo.map((miembro: any, i: number) => {
              const phoneLink = miembro.telefono ? miembro.telefono.replace(/\D/g, '') : ''
              const fallbackImg = i === 0 ? '/images/team/javier.png' : i === 1 ? '/images/team/david.png' : '/images/team/kevin.png'
              const foto = miembro.imagen_url || fallbackImg

              return (
                <div key={miembro.id || i} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                  <div className="aspect-[3/4] bg-slate-900 relative overflow-hidden flex items-center justify-center">
                     <img 
                       src={foto}
                       alt={miembro.nombre}
                       className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-bold text-brand-dark text-lg mb-1 tracking-tight">{miembro.nombre}</h3>
                    <p className="text-brand-sage font-bold text-xs tracking-widest uppercase mb-4">{miembro.cargo}</p>
                    <div className="pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
                      {miembro.telefono && (
                        <a href={`https://wa.me/${phoneLink}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-sage font-medium transition-colors">
                          <Phone size={14} className="text-brand-sage" />
                          {miembro.telefono}
                        </a>
                      )}
                      {miembro.email && (
                        <a href={`mailto:${miembro.email}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-sage font-medium transition-colors">
                          <Mail size={14} className="text-brand-sage" />
                          {miembro.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
