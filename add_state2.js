const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

const configState = `
  const [planesConfig, setPlanesConfig] = useState<InmobiliariaConfigCompleta>(DEFAULT_INMOBILIARIA_CONFIG)
  React.useEffect(() => {
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

content = content.replace(
  'const geocodeTimer = useRef<NodeJS.Timeout | null>(null)',
  'const geocodeTimer = useRef<NodeJS.Timeout | null>(null)\n' + configState
);

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
console.log('Added planesConfig state!');
