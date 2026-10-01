const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

const regex = /const handleEnviarComprobante = async \(\) => \{[\s\S]*?setIsUploadingComprobante\(false\)\n\s*\}/;

const newFn = `const handleEnviarComprobante = async () => {
    if (!pagoInmueble || !comprobantePago) return
    setIsUploadingComprobante(true)
    try {
      const updatedInmueble = {
        ...pagoInmueble,
        promocion: {
          ...(pagoInmueble.promocion || {}),
          estadoPago: 'pendiente',
          comprobanteUrl: comprobantePago,
          metodoPago: 'Transferencia Bancaria'
        }
      }
      const res = await fetch("/api/inmobiliaria/inmuebles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inmueble: updatedInmueble })
      })
      if (res.ok) {
        alert("Comprobante enviado exitosamente. SARA Inmobiliaria validará tu pago para activar la publicación.")
        setPagoInmueble(null)
        setComprobantePago("")
        window.location.reload()
      } else {
        alert("Error al enviar comprobante")
      }
    } catch(err) {
      console.error(err)
      alert("Error de conexión")
    } finally {
      setIsUploadingComprobante(false)
    }
  }`;

if (regex.test(content)) {
  content = content.replace(regex, newFn);
  fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
  console.log('Success regex!');
} else {
  console.log('Failed regex');
}
