-- ==========================================
-- SARA CONSTRUCTORA - SEED DE PLANTILLAS APU
-- ==========================================

-- 1. Insertar Insumos
INSERT INTO insumos (codigo, nombre, unidad, tipo, precio_sin_iva) VALUES
('MAT-001', 'Cemento Portland Tipo I', 'kg', 'material', 0.1700),
('MAT-002', 'Arena gruesa', 'm3', 'material', 15.0000),
('MAT-003', 'Ripio triturado', 'm3', 'material', 18.0000),
('MAT-004', 'Agua', 'lt', 'material', 0.0020),
('MAT-005', 'Madera de encofrado', 'u', 'material', 3.5000),
('MAT-006', 'Clavos', 'kg', 'material', 1.5000),
('MO-001', 'Peón / Ayudante (E2)', 'h', 'mano_de_obra', 3.5000),
('MO-002', 'Albañil (D2)', 'h', 'mano_de_obra', 3.8000),
('MO-003', 'Maestro Mayor (C1)', 'h', 'mano_de_obra', 4.2000),
('EQ-001', 'Hormigonera 1 saco', 'h', 'equipo', 3.5000),
('EQ-002', 'Vibrador de hormigón', 'h', 'equipo', 2.5000)
ON CONFLICT (codigo) DO NOTHING;

-- 2. Insertar Rubros
INSERT INTO rubros (codigo, nombre, categoria, unidad, herramienta_menor_pct) VALUES
('RUB-001', 'Hormigón simple f''c=210 kg/cm2', 'ESTRUCTURAS', 'm3', 5.00),
('RUB-002', 'Enlucido vertical paleteado fino', 'MAMPOSTERIA', 'm2', 5.00),
('RUB-003', 'Excavación manual de zanjas', 'PRELIMINARES', 'm3', 5.00)
ON CONFLICT (codigo) DO NOTHING;

-- 3. Insertar Recetas (Vincular Rubros con Insumos)
-- Hormigón
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 350.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-001' AND i.codigo = 'MAT-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 0.45 FROM rubros r, insumos i WHERE r.codigo = 'RUB-001' AND i.codigo = 'MAT-002';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 0.85 FROM rubros r, insumos i WHERE r.codigo = 'RUB-001' AND i.codigo = 'MAT-003';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 180.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-001' AND i.codigo = 'MAT-004';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 6.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-001' AND i.codigo = 'MO-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 1.5 FROM rubros r, insumos i WHERE r.codigo = 'RUB-001' AND i.codigo = 'MO-002';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 1.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-001' AND i.codigo = 'EQ-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 1.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-001' AND i.codigo = 'EQ-002';

-- Enlucido
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 6.5 FROM rubros r, insumos i WHERE r.codigo = 'RUB-002' AND i.codigo = 'MAT-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 0.025 FROM rubros r, insumos i WHERE r.codigo = 'RUB-002' AND i.codigo = 'MAT-002';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 4.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-002' AND i.codigo = 'MAT-004';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 0.5 FROM rubros r, insumos i WHERE r.codigo = 'RUB-002' AND i.codigo = 'MO-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 0.6 FROM rubros r, insumos i WHERE r.codigo = 'RUB-002' AND i.codigo = 'MO-002';

-- Excavación
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad)
SELECT r.id, i.id, 3.5 FROM rubros r, insumos i WHERE r.codigo = 'RUB-003' AND i.codigo = 'MO-001';

-- 4. Actualizar el costo total directo de cada rubro sumando sus componentes
UPDATE rubros r SET total_costo_directo = (
    SELECT COALESCE(SUM(ri.cantidad * i.precio_sin_iva), 0) + 
           (COALESCE(SUM(CASE WHEN i.tipo = 'mano_de_obra' THEN ri.cantidad * i.precio_sin_iva ELSE 0 END), 0) * (r.herramienta_menor_pct / 100))
    FROM rubro_insumos ri
    JOIN insumos i ON ri.insumo_id = i.id
    WHERE ri.rubro_id = r.id
);
