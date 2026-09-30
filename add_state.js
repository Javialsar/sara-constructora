const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

const configState = `
  const [planesConfig, setPlanesConfig] = useState<InmobiliariaConfigCompleta>(DEFAULT_INMOBILIARIA_CONFIG)
  useEffect(() => {
    getInmobiliariaConfig().then(cfg => {
      setPlanesConfig(cfg)
      // Ajustar tarifa base en caso de ser necesario
      setFormInmueble(prev => ({
        ...prev,
        tarifaMensual: cfg.planes[prev.planPromocion]?.precioMensual || prev.tarifaMensual
      }))
    })
  }, [])
`;

if (!content.includes('const [planesConfig')) {
  content = content.replace(
    'const fileInputRef = useRef<HTMLInputElement>(null)',
    'const fileInputRef = useRef<HTMLInputElement>(null)\n' + configState
  );
}

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
console.log('Added planesConfig state!');
