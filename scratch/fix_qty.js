const fs = require('fs');

let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. Add order to fetchRubroInsumos
c = c.replace(
  /\.eq\('rubro_id', rubro_id\)/g,
  `.eq('rubro_id', rubro_id).order('id', { ascending: true })`
);

const componentStr = `
const QuantityInput = ({ item, handleUpdateCantidad }: { item: any, handleUpdateCantidad: any }) => {
  const [val, setVal] = useState(item.cantidad.toString());

  useEffect(() => {
    if (parseFloat(val) !== parseFloat(item.cantidad)) {
      setVal(item.cantidad.toString());
    }
  }, [item.cantidad]);

  const commit = (newVal) => {
    const num = parseFloat(newVal);
    if (!isNaN(num)) handleUpdateCantidad(item.id, num);
  };

  const onStep = (dir) => {
    const newValStr = Math.max(0, parseFloat((parseFloat(val||'0') + dir * 0.01).toFixed(6))).toString();
    setVal(newValStr);
    commit(newValStr);
  };

  return (
    <div className="flex items-center justify-end gap-0">
      <button onClick={() => onStep(-1)} className="w-7 h-9 flex items-center justify-center rounded-l-md border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors">
        <Minus size={12} />
      </button>
      <input 
        type="text"
        inputMode="decimal"
        value={val}
        onChange={(e) => {
          let v = e.target.value;
          if (v.startsWith('.')) v = '0' + v;
          if (v === '' || /^\\d*\\.?\\d*$/.test(v)) {
            setVal(v);
            commit(v);
          }
        }}
        className="w-28 h-9 text-center border-y border-gray-300 outline-none text-sm font-semibold text-gray-800 focus:border-blue-400 focus:bg-blue-50" 
      />
      <button onClick={() => onStep(1)} className="w-7 h-9 flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors">
        <Plus size={12} />
      </button>
    </div>
  );
};
`;

// Replace the inline div with the new component BEFORE inserting componentStr
const targetDiv = `        <td className="px-4 py-2.5">
          <div className="flex items-center justify-end gap-0">
            <button onClick={() => stepCantidad(item.id, item.cantidad, -1)} className="w-7 h-9 flex items-center justify-center rounded-l-md border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors">
              <Minus size={12} />
            </button>
            <input 
              type="text"
              inputMode="decimal"
              value={item.cantidad} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '.' || /^\\d*\\.?\\d*$/.test(val)) {
                  handleUpdateCantidad(item.id, parseFloat(val) || 0)
                }
              }}
              className="w-28 h-9 text-center border-y border-gray-300 outline-none text-sm font-semibold text-gray-800 focus:border-blue-400 focus:bg-blue-50" 
            />
            <button onClick={() => stepCantidad(item.id, item.cantidad, 1)} className="w-7 h-9 flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors">
              <Plus size={12} />
            </button>
          </div>
        </td>`;

const replacementDiv = `        <td className="px-4 py-2.5">
          <QuantityInput item={item} handleUpdateCantidad={handleUpdateCantidad} />
        </td>`;

c = c.replace(targetDiv, replacementDiv);

// Inject component before renderInsumoRow
if (!c.includes('const QuantityInput')) {
  c = c.replace(
    /const renderInsumoRow = \(item: any\) => \(/,
    componentStr + '\n  const renderInsumoRow = (item: any) => ('
  );
}

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
