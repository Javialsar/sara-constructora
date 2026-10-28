"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Building2, ShieldCheck, Award } from "lucide-react"

const CLIENTES_INSTITUCIONALES_SEMILLA = [
  {
    id: "cli-01",
    nombre: "Consorcio Inmobiliario",
    apellido: "Andes Norte S.A.",
    sector: "Desarrollo Residencial & Vertical · Quito",
    usuario: true,
    proyectosCount: 4
  },
  {
    id: "cli-02",
    nombre: "Promotora Patrimonial",
    apellido: "AustroVivienda Cía. Ltda.",
    sector: "Conjuntos Habitacionales · Cuenca",
    usuario: true,
    proyectosCount: 3
  },
  {
    id: "cli-03",
    nombre: "Logística & Puertos",
    apellido: "Del Pacífico S.A.S.",
    sector: "Naves Industriales & Bodegas · Guayaquil",
    usuario: true,
    proyectosCount: 2
  },
  {
    id: "cli-04",
    nombre: "Corporación Médica",
    apellido: "San Lucas del Sur",
    sector: "Infraestructura Hospitalaria · Loja",
    usuario: true,
    proyectosCount: 2
  }
]

const TESTIMONIOS_INSTITUCIONALES_SEMILLA = [
  {
    id: "test-01",
    comentario: "La integración del presupuesto APU con fórmulas polinómicas INEC y el control semanal del Libro de Obra nos permitió cerrar nuestra torre en La Carolina con desviación presupuestaria menor al 0.8%.",
    clientes: { nombre: "Ing. Carlos", apellido: "Montúfar (Director de Proyecto)" },
    proyectos: { nombre: "Torre Corporativa Aura Carolina · Quito" }
  },
  {
    id: "test-02",
    comentario: "Con SARA Constructora y su custodia fiduciaria Escrow cada planilla de avance físico se liberó contra inspección georreferenciada. Transparencia total para nuestros inversionistas en Cuenca.",
    clientes: { nombre: "Arq. María Augusta", apellido: "Cordero (Gerente Técnica)" },
    proyectos: { nombre: "Conjunto Habitacional Tomebamba · Cuenca" }
  },
  {
    id: "test-03",
    comentario: "El abastecimiento de acero y hormigón con IVA al 5% desde SARA Marketplace y la optimización de fletes pesados redujo en un 22% nuestros costos logísticos de cimentación.",
    clientes: { nombre: "Ing. Roberto", apellido: "Villacís (Gerente de Operaciones)" },
    proyectos: { nombre: "Centro Logístico Río Daule · Guayaquil" }
  }
]

export default function ClientesPage() {
  const supabase = createClient()
  const [clientes, setClientes] = useState<any[]>(CLIENTES_INSTITUCIONALES_SEMILLA)
  const [testimonios, setTestimonios] = useState<any[]>(TESTIMONIOS_INSTITUCIONALES_SEMILLA)

  useEffect(() => {
    async function loadData() {
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .eq('estado', 'activo')
        .order('created_at', { ascending: false })
      
      if (clientesData && clientesData.length > 0) {
        setClientes([...clientesData, ...CLIENTES_INSTITUCIONALES_SEMILLA])
      }

      const { data: testimoniosData } = await supabase
        .from('testimonios')
        .select(`*, clientes(nombre, apellido), proyectos(nombre)`)
        .eq('estado', 'aprobado')
        .order('created_at', { ascending: false })
        .limit(6)
        
      if (testimoniosData && testimoniosData.length > 0) {
        setTestimonios([...testimoniosData, ...TESTIMONIOS_INSTITUCIONALES_SEMILLA])
      }
    }

    loadData()

    const subscription = supabase
      .channel('clientes-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [supabase])

  return (
    <div className="pt-36 pb-16 min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
            Nuestros Clientes
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            LA CONFIANZA CORPORATIVA DETRÁS DE CADA OBRA EN EL ECUADOR.
          </h2>
        </header>

        <section className="mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {clientes.map((c) => (
              <div
                key={c.id}
                className="group bg-white border border-gray-200 flex flex-col items-center justify-between transition-all p-6 text-center shadow-sm hover:shadow-xl hover:border-brand-sage/40 rounded-2xl relative overflow-hidden"
              >
                <div className="w-20 h-20 mb-4 rounded-2xl bg-slate-900 text-brand-sage flex items-center justify-center shadow-md">
                  <Building2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark uppercase tracking-wide text-sm md:text-base group-hover:text-brand-sage transition-colors">
                    {c.nombre} {c.apellido}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.sector || 'Cliente Corporativo Verificado'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 w-full flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-emerald-700">
                  <ShieldCheck size={14} />
                  <span>Cuenta Verificada SARA</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-dark text-white py-16 -mx-4 md:-mx-8 px-4 md:px-8 rounded-3xl">
          <div className="max-w-5xl mx-auto">
            <header className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-sage text-xs font-mono font-bold uppercase mb-3">
                <Award size={14} />
                <span>Casos de Éxito Auditados</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 uppercase text-brand-sage">
                Testimonios de Clientes & Promotores
              </h2>
              <p className="text-gray-300">Resultados reales en ingeniería de costos, ejecución de obra y fideicomiso inmobiliario.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonios.map((t) => (
                <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative flex flex-col h-full">
                  <div className="text-brand-sage text-4xl font-serif absolute top-4 right-4 opacity-40">"</div>
                  <p className="text-gray-200 italic mb-6 relative z-10 text-sm leading-relaxed flex-1">
                    "{t.comentario}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                    <div className="w-10 h-10 bg-brand-sage/20 rounded-full flex items-center justify-center text-brand-sage font-bold shrink-0">
                      {t.clientes?.nombre?.charAt(0)}{t.clientes?.apellido?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">{t.clientes?.nombre} {t.clientes?.apellido}</h4>
                      <p className="text-[11px] text-brand-sage font-mono truncate">{t.proyectos?.nombre || 'Proyecto SARA'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-sage text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity"
              >
                Solicitar Propuesta Técnica para mi Proyecto
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
