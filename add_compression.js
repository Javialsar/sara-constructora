const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

const compressionFunc = `
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIM = 1200;
          if (width > height && width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  }
`;

content = content.replace(
  'const handleUploadLegalFile = (key: keyof typeof formInmueble.legalidad, e: React.ChangeEvent<HTMLInputElement>) => {',
  compressionFunc + '\n  const handleUploadLegalFile = (key: keyof typeof formInmueble.legalidad, e: React.ChangeEvent<HTMLInputElement>) => {'
);

// Now replace all `reader.readAsDataURL(file)` logic with `compressImage(file)`

// 1. Legal files:
content = content.replace(
  `        reader.onload = (event) => {
          if (event.target?.result) {
            setFormInmueble(prev => ({
              ...prev,
              legalidad: { ...prev.legalidad, [key]: event.target!.result as string }
            }))
          }
        }
        reader.readAsDataURL(file)`,
  `        if (file.type.startsWith('image/')) {
          compressImage(file).then(base64 => {
            setFormInmueble(prev => ({ ...prev, legalidad: { ...prev.legalidad, [key]: base64 } }))
          })
        } else {
          reader.onload = (event) => {
            if (event.target?.result) {
              setFormInmueble(prev => ({ ...prev, legalidad: { ...prev.legalidad, [key]: event.target!.result as string } }))
            }
          }
          reader.readAsDataURL(file)
        }`
);

// 2. Galeria Imagenes:
content = content.replace(
  `        reader.onload = (event) => {
          if (event.target?.result) {
            const url = event.target.result as string
            setFormInmueble(prev => {
              const list = [...(prev.galeriaImagenes || []), url]
              return {
                ...prev,
                galeriaImagenes: list,
                imagenUrl: prev.imagenUrl || url
              }
            })
          }
        }
        reader.readAsDataURL(file)`,
  `        if (file.type.startsWith('image/')) {
          compressImage(file).then(url => {
            setFormInmueble(prev => {
              const list = [...(prev.galeriaImagenes || []), url]
              return { ...prev, galeriaImagenes: list, imagenUrl: prev.imagenUrl || url }
            })
          })
        } else {
          reader.onload = (event) => {
            if (event.target?.result) {
              const url = event.target.result as string
              setFormInmueble(prev => {
                const list = [...(prev.galeriaImagenes || []), url]
                return { ...prev, galeriaImagenes: list, imagenUrl: prev.imagenUrl || url }
              })
            }
          }
          reader.readAsDataURL(file)
        }`
);

// 3. QR Cuenta:
content = content.replace(
  `      reader.onload = (event) => {
        if (event.target?.result) {
          setFormInmueble(prev => ({
            ...prev,
            cuentaBancaria: { ...prev.cuentaBancaria, qrCuenta: event.target!.result as string }
          }))
        }
      }
      reader.readAsDataURL(file)`,
  `      if (file.type.startsWith('image/')) {
        compressImage(file).then(url => {
          setFormInmueble(prev => ({
            ...prev,
            cuentaBancaria: { ...prev.cuentaBancaria, qrCuenta: url }
          }))
        })
      } else {
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormInmueble(prev => ({ ...prev, cuentaBancaria: { ...prev.cuentaBancaria, qrCuenta: event.target!.result as string } }))
          }
        }
        reader.readAsDataURL(file)
      }`
);

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
console.log('Added compression!');
