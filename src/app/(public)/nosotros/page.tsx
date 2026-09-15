import { Phone, Mail, ShieldCheck, Target, Award, CheckCircle2, Lightbulb, Users } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Habilitar caché estático para esta página (revalida cada hora)
export const revalidate = 3600;

export default async function NosotrosPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: config } = await supabase.from('configuracion_empresa').select('equipo_directivo, logo_url').limit(1).single()
  const equipo = config?.equipo_directivo || []
  const logoUrl = config?.logo_url || '/images/logo-sra-constructora.png'

  return (
    <div className="min-h-screen bg-transparent">
      
      {/* Hero Section */}
      <div className="relative pt-28 pb-16 md:pt-32 md:pb-24 bg-brand-dark overflow-hidden">
        {/* Subtle Background pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
          <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tighter mb-6 uppercase drop-shadow-md">
            CONSTRUIMOS PROYECTOS. <br className="hidden md:block"/>
            <span className="text-brand-sage">CREAMOS CONFIANZA.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed">
            En SARA CONSTRUCTORA transformamos ideas y necesidades en proyectos de Ingeniería Civil, Arquitectura, Construcción y Consultoría, integrando conocimiento técnico, planificación, diseño, tecnología e innovación.
          </p>
        </div>
      </div>

      {/* Main Content & Image */}
      <div className="container mx-auto px-4 md:px-8 py-8 relative z-20">
        <div className="bg-white/80 backdrop-blur-md shadow-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row rounded-[2rem]">
          
          <div className="lg:w-1/2 relative min-h-[300px] bg-white flex items-center justify-center p-8 lg:p-12">
             <img 
               src={logoUrl} 
               alt="SARA Constructora Logo" 
               className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-700"
             />
          </div>

          <div className="lg:w-1/2 p-8 md:p-10 lg:p-12 space-y-6 text-gray-600 text-base md:text-lg leading-relaxed font-light flex flex-col justify-center">
            <p>
              Desarrollamos soluciones integrales para proyectos en todo el Ecuador, atendiendo obras residenciales, comerciales, institucionales y de infraestructura, con una visión orientada a la seguridad, funcionalidad, eficiencia y calidad.
            </p>
            <p>
              Acompañamos a nuestros clientes durante todo el proceso: desde los estudios preliminares, diseño y planificación, hasta la construcción, dirección, supervisión y entrega de la obra. Cada etapa es gestionada con responsabilidad y rigurosidad técnica para convertir una idea en una solución sólida y duradera.
            </p>
            <p className="font-medium text-brand-dark border-l-4 border-brand-sage pl-6 italic">
              "Para SARA CONSTRUCTORA, construir va más allá de ejecutar una obra: significa proteger una inversión, materializar una visión y construir relaciones de confianza que perduren en el tiempo."
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-8">
        
        {/* Principios */}
        <div className="mb-16 relative bg-brand-sage rounded-[2.5rem] py-10 px-4 md:px-12 overflow-hidden shadow-2xl">
          {/* Grid Background Pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
            <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
          
          <div className="relative z-10 text-center mb-10">
            <h2 className="text-sm font-bold tracking-[0.2em] text-brand-dark bg-white/90 inline-block px-4 py-1.5 rounded-full uppercase mb-4 shadow-sm">Lo que nos guía</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">PRINCIPIOS</h3>
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Tarjeta 1 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-dark text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <ShieldCheck size={32} />
              </div>
              <h4 className="font-bold text-lg text-brand-sage mb-2 px-2 leading-tight">SEGURIDAD TÉCNICA</h4>
              <div className="w-8 h-0.5 bg-brand-dark/20 rounded-full mb-4"></div>
              <p className="text-gray-500 font-light text-sm leading-relaxed">
                Cada proyecto se desarrolla sobre criterios de ingeniería, planificación y cumplimiento técnico. Construimos pensando en la seguridad de las personas, la estabilidad de las estructuras y la durabilidad de cada obra.
              </p>
            </div>
            
            {/* Tarjeta 2 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-dark text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Award size={32} />
              </div>
              <h4 className="font-bold text-lg text-brand-sage mb-2 px-2 leading-tight">CALIDAD EN CADA DETALLE</h4>
              <div className="w-8 h-0.5 bg-brand-dark/20 rounded-full mb-4"></div>
              <p className="text-gray-500 font-light text-sm leading-relaxed">
                Cuidamos cada etapa, desde la concepción y el diseño hasta los procesos constructivos y acabados. La calidad no es una opción: es nuestro estándar de trabajo.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-dark text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Users size={32} />
              </div>
              <h4 className="font-bold text-lg text-brand-sage mb-2 px-2 leading-tight">COMPROMISO CON EL CLIENTE</h4>
              <div className="w-8 h-0.5 bg-brand-dark/20 rounded-full mb-4"></div>
              <p className="text-gray-500 font-light text-sm leading-relaxed">
                Escuchamos, asesoramos y acompañamos al cliente durante todo el proyecto. Sus objetivos, su inversión y su confianza son también nuestra responsabilidad.
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
              <h2 className="text-sm font-bold tracking-[0.2em] text-brand-sage uppercase mb-4">Nuestra cultura</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold">VALORES</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
              <div className="pt-8 md:pt-0 px-4">
                <h4 className="font-bold text-2xl text-brand-sage mb-4">INTEGRIDAD</h4>
                <p className="text-gray-300 font-light">
                  Actuamos con ética, honestidad y transparencia, construyendo relaciones profesionales basadas en la confianza y en decisiones responsables.
                </p>
              </div>
              <div className="pt-8 md:pt-0 px-4">
                <h4 className="font-bold text-2xl text-brand-sage mb-4">RESPONSABILIDAD</h4>
                <p className="text-gray-300 font-light">
                  Asumimos cada proyecto con seriedad y compromiso, administrando responsablemente los recursos, costos, tiempos y procesos de ejecución.
                </p>
              </div>
              <div className="pt-8 md:pt-0 px-4">
                <h4 className="font-bold text-2xl text-brand-sage mb-4">INNOVACIÓN</h4>
                <p className="text-gray-300 font-light">
                  Integramos ingeniería, arquitectura y nuevas tecnologías para desarrollar soluciones modernas, eficientes y sostenibles, capaces de responder a los desafíos actuales de la construcción.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Esencia */}
        <div className="mb-12 text-center max-w-4xl mx-auto space-y-8">
          <h2 className="text-sm font-bold tracking-[0.2em] text-brand-sage uppercase mb-4">NUESTRA ESENCIA</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight leading-tight">
            Seguridad para construir. <br/>Calidad para perdurar. <br className="md:hidden"/>Confianza para crecer.
          </h3>
          <p className="text-xl text-gray-500 font-light">
            En SARA CONSTRUCTORA, cada proyecto representa nuestro compromiso con la excelencia y nuestra responsabilidad con quienes confían en nosotros.
          </p>
          <div className="pt-8 mt-8 border-t border-gray-200">
            <p className="font-bold text-brand-dark text-lg uppercase tracking-wider">SARA CONSTRUCTORA</p>
            <p className="text-brand-sage text-sm font-bold tracking-widest uppercase mb-4">Ingeniería · Arquitectura · Construcción · Consultoría</p>
            <p className="italic text-gray-500">Ideas que construyen realidades.</p>
          </div>
        </div>

        {/* Equipo */}
        <div className="pt-16">
          <header className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
              Nuestro Equipo
            </h2>
            <p className="text-brand-sage font-bold tracking-widest text-sm uppercase">
              Profesionales comprometidos con la excelencia
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {equipo.map((miembro: any, i: number) => {
              const phoneLink = miembro.telefono ? miembro.telefono.replace(/\D/g, '') : ''
              return (
                <div key={i} className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                     <div 
                       className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                       style={{ backgroundImage: `url(${miembro.imagen_url})` }} 
                     />
                     <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-bold text-brand-dark text-lg mb-1 tracking-tight">{miembro.nombre}</h3>
                    <p className="text-brand-sage font-bold text-xs tracking-widest uppercase mb-4">{miembro.cargo}</p>
                    <div className="pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
                      {miembro.telefono && (
                        <a href={`https://wa.me/${phoneLink}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-sage font-medium transition-colors">
                          <Phone size={14} />
                          {miembro.telefono}
                        </a>
                      )}
                      {miembro.email && (
                        <a href={`mailto:${miembro.email}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-sage font-medium transition-colors">
                          <Mail size={14} />
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
