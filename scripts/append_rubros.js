const fs = require('fs');

let rubrosSql = `
-- Rubros Adicionales Sintéticos
INSERT INTO rubros (codigo, nombre, unidad, categoria, total_costo_directo, herramienta_menor_pct) VALUES 
('RUB-GEN-2001', 'Excavación manual a máquina', 'm3', '01 Preliminares', 0, 5),
('RUB-GEN-2002', 'Hormigón simple f''c=210 kg/cm2', 'm3', '02 Hormigones', 0, 5),
('RUB-GEN-2003', 'Acero de refuerzo fy=4200 kg/cm2', 'kg', '02 Hormigones', 0, 5),
('RUB-GEN-2004', 'Mampostería de bloque vibrado', 'm2', '03 Mampostería', 0, 5),
('RUB-GEN-2005', 'Enlucido vertical interior', 'm2', '04 Acabados', 0, 5),
('RUB-GEN-2006', 'Pintura interior látex 2 manos', 'm2', '04 Acabados', 0, 5),
('RUB-GEN-2007', 'Cubierta de galvalume', 'm2', '05 Cubiertas', 0, 5)
ON CONFLICT (codigo) DO NOTHING;

-- Asociar con algunos insumos al azar pero realistas (asumiendo que los insumos existen, el trigger ignorará fallos o podemos asegurar)
DO $$
DECLARE
    r_id UUID;
    i_id UUID;
BEGIN
    SELECT id INTO r_id FROM rubros WHERE codigo = 'RUB-GEN-2002' LIMIT 1;
    IF r_id IS NOT NULL THEN
        SELECT id INTO i_id FROM insumos WHERE nombre ILIKE '%cemento%' LIMIT 1;
        IF i_id IS NOT NULL THEN INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) VALUES (r_id, i_id, 350) ON CONFLICT DO NOTHING; END IF;
        SELECT id INTO i_id FROM insumos WHERE nombre ILIKE '%arena%' LIMIT 1;
        IF i_id IS NOT NULL THEN INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) VALUES (r_id, i_id, 0.45) ON CONFLICT DO NOTHING; END IF;
        SELECT id INTO i_id FROM insumos WHERE nombre ILIKE '%agua%' LIMIT 1;
        IF i_id IS NOT NULL THEN INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) VALUES (r_id, i_id, 200) ON CONFLICT DO NOTHING; END IF;
    END IF;
END $$;
`;

fs.appendFileSync('supabase/seed_excel.sql', rubrosSql);
console.log("Appended rubros.");
