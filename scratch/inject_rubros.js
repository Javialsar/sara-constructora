const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

if (!c.includes('useQuery')) {
  c = c.replace('import { useState, useEffect } from "react"', 
    'import { useState, useEffect } from "react";\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport { useForm } from "react-hook-form";\nimport { zodResolver } from "@hookform/resolvers/zod";\nimport * as z from "zod";');
}

const schemaStr = `
const rubroSchema = z.object({
  codigo: z.string().min(2, "Requerido"),
  nombre: z.string().min(3, "Requerido"),
  unidad: z.string().min(1, "Requerido"),
  herramienta_menor_pct: z.number().min(0, "No negativo"),
  subfamilia_id: z.string().optional(),
  familia_id_temp: z.string().optional()
});
type RubroFormValues = z.infer<typeof rubroSchema>;
`;

if (!c.includes('const rubroSchema')) {
  c = c.replace('export default function RubrosPage() {', schemaStr + '\nexport default function RubrosPage() {');
}

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
