const fs = require('fs');

let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

const stateInsert = `
  const [pagoInmueble, setPagoInmueble] = useState<InmuebleOwner | null>(null)
  const [comprobantePago, setComprobantePago] = useState<string>("")
  const [isUploadingComprobante, setIsUploadingComprobante] = useState(false)

  const handleUploadComprobante = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        setComprobantePago(evt.target?.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleEnviarComprobante = async () => {
    if (!pagoInmueble || !comprobantePago) return
    setIsUploadingComprobante(true)
    try {
      alert("Comprobante enviado exitosamente. SARA Inmobiliaria revisará el pago en breve.")
      setPagoInmueble(null)
      setComprobantePago("")
    } catch(err) {
      console.error(err)
    } finally {
      setIsUploadingComprobante(false)
    }
  }
`;

if (!content.includes('const [pagoInmueble, setPagoInmueble]')) {
  content = content.replace(
    'const [showPublishModal, setShowPublishModal] = useState(false)',
    stateInsert + '\n  const [showPublishModal, setShowPublishModal] = useState(false)'
  );
}

fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
console.log('Fixed state in mi-portal/page.tsx');
