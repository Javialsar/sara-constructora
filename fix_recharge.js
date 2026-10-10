const fs = require('fs');
let c = fs.readFileSync('src/app/admin/fletes/page.tsx', 'utf8');

if(!c.includes('const [rechargeAmount, setRechargeAmount] = useState<string>("20");')) {
    c = c.replace(
        'const [toastMessage, setToastMessage] = useState<string | null>(null);',
        `const [toastMessage, setToastMessage] = useState<string | null>(null);\n  const [rechargeAmount, setRechargeAmount] = useState<string>("20");`
    );
}

const handleRechargeCode = `
  const handleValidateRecharge = (id: string, amount: string) => {
    const numericAmount = parseFloat(amount);
    if(isNaN(numericAmount) || numericAmount <= 0) {
      showToast("Ingrese un monto válido");
      return;
    }
    const updatedDrivers = drivers.map((d): Driver => {
      if (d.id === id) {
        return { ...d, walletBalance: d.walletBalance + numericAmount };
      }
      return d;
    });
    setDrivers(updatedDrivers);
    if (selectedDriver && selectedDriver.id === id) {
      setSelectedDriver(updatedDrivers.find(d => d.id === id) || null);
    }
    setRechargeAmount("20");
    showToast(\`Recarga de $\${numericAmount.toFixed(2)} validada exitosamente\`);
  };
`;

if(!c.includes('const handleValidateRecharge')) {
    c = c.replace(
        '  const showToast = (msg: string) => {',
        handleRechargeCode + '\n  const showToast = (msg: string) => {'
    );
}

const uiToReplace = `<p className="text-xs text-slate-500 mt-2 leading-tight">SARA descontará su comisión de esta billetera virtual en cada viaje concretado de forma automática.</p>`;

const uiReplacement = `<p className="text-xs text-slate-500 mt-2 leading-tight">SARA descontará su comisión de esta billetera virtual en cada viaje concretado de forma automática.</p>
                    
                    <div className="mt-5 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-2">Validar Transferencia / Pago</p>
                      <div className="flex gap-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-slate-400 font-bold">$</span>
                          <input type="number" value={rechargeAmount} onChange={(e) => setRechargeAmount(e.target.value)} className="w-24 pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500 font-bold bg-white shadow-sm" />
                        </div>
                        <button onClick={() => handleValidateRecharge(selectedDriver.id, rechargeAmount)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-md shadow-emerald-500/20 transition-colors">
                          <CheckCircle className="w-4 h-4 mr-1"/> Validar Recarga
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">Confirme el pago en las cuentas de SARA antes de validar. Esto habilitará al vehículo en el radar de fletes.</p>
                    </div>`;

c = c.replace(uiToReplace, uiReplacement);

fs.writeFileSync('src/app/admin/fletes/page.tsx', c, 'utf8');
