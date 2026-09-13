import { ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Políticas de Privacidad - SARA Constructora",
  description: "Políticas de Privacidad y Tratamiento de Datos Personales de SARA Constructora.",
}

export default function PrivacidadPage() {
  return (
    <div className="pt-36 pb-24 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <header className="mb-12 text-center">
          <div className="w-16 h-16 mx-auto bg-brand-dark text-brand-sage rounded-full flex items-center justify-center mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
            Políticas de Privacidad
          </h1>
          <p className="text-gray-500 font-medium tracking-widest uppercase text-sm">
            Actualizado: {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </header>

        <div className="bg-white p-8 md:p-12 shadow-xl border border-gray-100 rounded-lg prose prose-lg prose-headings:text-brand-dark max-w-none text-gray-600">
          <h2>1. Información General</h2>
          <p>
            En SARA CONSTRUCTORA, valoramos y respetamos la privacidad de nuestros clientes, socios y usuarios de nuestro sitio web. 
            Esta política explica cómo recopilamos, utilizamos y protegemos su información personal cuando interactúa con nuestros servicios.
          </p>

          <h2>2. Recopilación de Datos</h2>
          <p>
            Recopilamos información que usted nos proporciona directamente cuando:
          </p>
          <ul>
            <li>Solicita una cotización a través de nuestro formulario web.</li>
            <li>Se registra en el Portal de Clientes.</li>
            <li>Se comunica con nosotros vía correo electrónico, teléfono o WhatsApp.</li>
          </ul>
          <p>
            Los datos pueden incluir: nombres, apellidos, correo electrónico, número de teléfono, ubicación del proyecto y detalles específicos de sus requerimientos.
          </p>

          <h2>3. Uso de la Información</h2>
          <p>
            La información recopilada se utiliza exclusivamente para:
          </p>
          <ul>
            <li>Procesar sus solicitudes de cotización y requerimientos de proyectos.</li>
            <li>Permitirle el acceso seguro a su cuenta en el Portal de Clientes.</li>
            <li>Contactarle para seguimiento de proyectos, avances de obra o consultas técnicas.</li>
            <li>Mejorar la calidad de nuestros servicios de ingeniería y arquitectura.</li>
          </ul>

          <h2>4. Protección de Datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, 
            alteración, divulgación o destrucción. Toda la información sensible es almacenada en bases de datos seguras y el acceso está restringido 
            únicamente al personal autorizado de SARA CONSTRUCTORA.
          </p>

          <h2>5. Compartición de Información</h2>
          <p>
            SARA CONSTRUCTORA <strong>no vende, alquila ni comercializa</strong> su información personal a terceros. Solo compartiremos 
            sus datos cuando sea estrictamente necesario para el cumplimiento de obligaciones legales o con proveedores de servicios de confianza 
            (como pasarelas de pago o servidores de alojamiento) bajo estrictos acuerdos de confidencialidad.
          </p>

          <h2>6. Derechos del Usuario</h2>
          <p>
            Usted tiene derecho a solicitar el acceso, rectificación, actualización o eliminación de sus datos personales en cualquier momento. 
            Para ejercer estos derechos, por favor contáctenos a través de nuestros canales oficiales.
          </p>

          <h2>7. Contacto</h2>
          <p>
            Si tiene alguna pregunta sobre nuestras Políticas de Privacidad, no dude en contactarnos:
          </p>
          <p>
            <strong>Email:</strong> contacto@saraconstructora.com<br />
            <strong>Ubicación:</strong> Ecuador
          </p>
        </div>
      </div>
    </div>
  )
}
