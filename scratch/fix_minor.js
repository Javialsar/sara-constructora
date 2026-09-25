const fs = require('fs');

let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

c = c.replace(/export default function RubrosPage\(\) \{\n  const \[vista/, 'export default function RubrosPage() {\n  const queryClient = useQueryClient();\n  const [vista');

// Delete handleCreateRubro entirely
const idx = c.indexOf('const handleCreateRubro = async');
if (idx !== -1) {
    const endIdx = c.indexOf('const handleDeleteRubro = async', idx);
    c = c.substring(0, idx) + c.substring(endIdx);
}

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
