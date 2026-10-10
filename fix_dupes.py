import re

with open('src/app/modulos/fletes/mi-perfil/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

state_block = """  const [incomingRequest, setIncomingRequest] = useState<any>(null);
  const [tripAccepted, setTripAccepted] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);

  // Simular la llegada de un flete a los 5 segundos de abrir la app
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!incomingRequest && !tripAccepted) {
        setIncomingRequest({
          origen: 'Av. Simón Bolívar y Ruta Viva',
          destino: 'Plaza Lagos, Samborondón',
          cliente: 'Constructora Atlas S.A.',
          valorRef: 145.50
        });
        showToast('¡Nueva solicitud de flete en tu área!');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptTrip = () => {
    setIncomingRequest(null);
    setTripAccepted(true);
    setAccessCode('SARA-' + Math.floor(100 + Math.random() * 900));
    showToast('Flete aceptado. Dirígete al origen y presenta tu código de acceso.');
  };

"""
content = content.replace(state_block, "")
content = content.replace("// Estados Billetera", state_block + "  // Estados Billetera", 1)

with open('src/app/modulos/fletes/mi-perfil/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
