const fs = require('fs');
let c = fs.readFileSync('src/app/admin/proveedores/[id]/page.tsx', 'utf8');

const searchLogic = `  // Auto-search effect
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      executeSearch(searchTerm);
    }, 350); // 350ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, catalogo]);

  const executeSearch = async (term: string) => {
    setSearching(true);
    const { data } = await supabase
      .from('insumos')
      .select('*')
      .ilike('nombre', \`%\${term}%\`)
      .limit(50);
      
    if (data) {
      const existingIds = catalogo.map(c => c.insumo_id);
      setSearchResults(data.filter(ins => !existingIds.includes(ins.id)));
    }
    setSearching(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };`;

// Replace handleSearch entirely
c = c.replace(/const handleSearch = async \(e: React\.FormEvent\) => \{[\s\S]*?setSearching\(false\)\s*\}/, searchLogic);

fs.writeFileSync('src/app/admin/proveedores/[id]/page.tsx', c);
console.log('Fixed real-time search');
