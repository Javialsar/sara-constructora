import re
import os

filepath = 'src/app/admin/proveedores/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update lucide-react imports
content = content.replace(
    'import { Plus, Search, Edit, Trash2, Building2, Loader2, X, Briefcase, BookOpen } from "lucide-react";',
    'import { Plus, Search, Edit, Trash2, Building2, Loader2, X, Briefcase, BookOpen, Upload } from "lucide-react";'
)

# 2. Update Zod Schema
content = content.replace(
    'sitio_web: z.union([z.literal(""), z.string().url("URL invǭlida")]).optional(),\n});',
    'sitio_web: z.union([z.literal(""), z.string().url("URL invǭlida")]).optional(),\n  logo_url: z.string().optional(),\n});'
)

# 3. Update useForm destructuring and default values
content = content.replace(
    '    reset,\n    setError,\n    formState: { errors, isSubmitting },\n  } = useForm<ProveedorFormValues>({',
    '    reset,\n    setError,\n    setValue,\n    watch,\n    formState: { errors, isSubmitting },\n  } = useForm<ProveedorFormValues>({'
)
content = content.replace(
    '      email: "",\n      sitio_web: "",\n    },\n  });',
    '      email: "",\n      sitio_web: "",\n      logo_url: "",\n    },\n  });\n\n  const [uploadingLogo, setUploadingLogo] = useState(false);'
)

# 4. Add logo upload handler before openNewModal
upload_handler = """  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('sara-assets')
        .upload(`proveedores/${fileName}`, file, { cacheControl: '3600', upsert: false });
      
      if (error) throw error;
      
      const { data } = supabase.storage.from('sara-assets').getPublicUrl(`proveedores/${fileName}`);
      setValue('logo_url', data.publicUrl);
    } catch (err: any) {
      alert("Error subiendo logotipo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const openNewModal = () => {"""

content = content.replace('  const openNewModal = () => {', upload_handler)

# 5. Update openNewModal reset
content = content.replace(
    'razon_social: "", ruc: "", dias_credito: 0, contacto_vendedor: "", telefono: "", email: "", sitio_web: ""',
    'razon_social: "", ruc: "", dias_credito: 0, contacto_vendedor: "", telefono: "", email: "", sitio_web: "", logo_url: ""'
)

# 6. Update handleEdit reset
content = content.replace(
    '      email: prov.email || "",\n      sitio_web: prov.sitio_web || "",\n    });',
    '      email: prov.email || "",\n      sitio_web: prov.sitio_web || "",\n      logo_url: prov.logo_url || "",\n    });'
)

# 7. Add UI for logo upload inside the form
logo_ui = """              <div className="grid grid-cols-2 gap-5 mb-8">
                <div className="col-span-2 flex items-center gap-4 mb-2">
                  <div className="h-16 w-24 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm p-1 shrink-0">
                    {watch("logo_url") ? (
                      <Image src={watch("logo_url")!} alt="Logo" width={96} height={64} className="max-w-full max-h-full object-contain mix-blend-multiply" unoptimized />
                    ) : (
                      <Building2 size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Logotipo de la Empresa</label>
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadingLogo} />
                      <button type="button" className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                        {uploadingLogo ? <Loader2 size={14} className="animate-spin text-brand-sage" /> : <Upload size={14} className="text-slate-500" />}
                        {uploadingLogo ? "Subiendo..." : "Subir Logotipo"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">"""

content = content.replace(
    '              <div className="grid grid-cols-2 gap-5 mb-8">\n                <div className="col-span-2">',
    logo_ui
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Form patched")
