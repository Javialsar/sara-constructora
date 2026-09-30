const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const patchCode = `        const inmueblesValidados = (data || []).map(inm => ({
          ...inm,
          promocion: inm.promocion || {
            plan: 'basico',
            nombrePlan: 'Plan Básico',
            tarifaMensual: 0,
            fechaInicio: new Date().toISOString().split('T')[0],
            fechaVencimiento: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
            estadoPago: 'vencido',
            ultimoMontoPagado: 0,
            metodoPago: 'Pendiente',
            totalRecaudado: 0
          },
          propietario: inm.propietario || {
            nombre: 'Propietario Temporal',
            email: 'temporal@example.com',
            telefono: '0000000000'
          },
          legalidad: inm.legalidad || {
            estado: 'pendiente'
          },
          cuentaBancaria: inm.cuentaBancaria || {
            banco: 'N/A',
            tipoCuenta: 'ahorros',
            numeroCuenta: '000000',
            cedulaTitular: '0000000000',
            qrTransferencia: ''
          }
        }))
        setInmuebles(inmueblesValidados)`;

content = content.replace('setInmuebles(data)', patchCode);

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
console.log('Injected root protection for setInmuebles!');
