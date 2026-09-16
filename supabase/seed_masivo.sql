-- =================================================================
-- SARA CONSTRUCTORA - SEED MASIVO DE PLANTILLAS APU (CATÁLOGO V2)
-- =================================================================
-- Este script inyecta un catálogo robusto de Insumos y Rubros Base.

-- 1. INSERTAR CATÁLOGO DE INSUMOS (MATERIALES, MANO DE OBRA, EQUIPOS)
INSERT INTO insumos (codigo, nombre, unidad, tipo, precio_sin_iva) VALUES
-- MATERIALES BÁSICOS
('MAT-001', 'Cemento Portland Tipo I', 'kg', 'material', 0.1700),
('MAT-002', 'Arena gruesa', 'm3', 'material', 15.0000),
('MAT-003', 'Arena fina', 'm3', 'material', 16.5000),
('MAT-004', 'Ripio triturado 3/4"', 'm3', 'material', 18.0000),
('MAT-005', 'Agua de consumo', 'lt', 'material', 0.0020),
('MAT-006', 'Piedra bola (Ciclópeo)', 'm3', 'material', 12.0000),
('MAT-007', 'Acero de refuerzo Fy=4200 kg/cm2', 'kg', 'material', 1.1500),
('MAT-008', 'Alambre recocido #18', 'kg', 'material', 1.8000),
('MAT-009', 'Madera de encofrado (Tablones)', 'u', 'material', 3.5000),
('MAT-010', 'Clavos de 2", 2 1/2", 3"', 'kg', 'material', 1.5000),
('MAT-011', 'Puntales de madera', 'u', 'material', 1.2000),
('MAT-012', 'Bloque de hormigón 15x20x40cm', 'u', 'material', 0.4500),
('MAT-013', 'Ladrillo panelero', 'u', 'material', 0.1800),
('MAT-014', 'Cerámica de piso 40x40cm', 'm2', 'material', 8.5000),
('MAT-015', 'Porcelanato 60x60cm', 'm2', 'material', 15.0000),
('MAT-016', 'Bondex (Pegante cerámica)', 'kg', 'material', 0.2500),
('MAT-017', 'Porcelana para juntas', 'kg', 'material', 0.8000),
('MAT-018', 'Pintura de caucho interior', 'gl', 'material', 12.0000),
('MAT-019', 'Pintura elastomérica exterior', 'gl', 'material', 22.0000),
('MAT-020', 'Empaste interior', 'kg', 'material', 0.5000),
('MAT-021', 'Sellador acrílico', 'gl', 'material', 10.0000),
('MAT-022', 'Tubería PVC Desagüe 4"', 'm', 'material', 3.2000),
('MAT-023', 'Tubería PVC Presión 1/2"', 'm', 'material', 0.9000),

-- MANO DE OBRA (Categorías Camicon / MDT)
('MO-001', 'Peón / Ayudante (E2)', 'h', 'mano_de_obra', 3.5000),
('MO-002', 'Albañil (D2)', 'h', 'mano_de_obra', 3.8000),
('MO-003', 'Fierrero / Estructurador (D2)', 'h', 'mano_de_obra', 3.8500),
('MO-004', 'Pintor (D2)', 'h', 'mano_de_obra', 3.7500),
('MO-005', 'Plomero / Instalador (D2)', 'h', 'mano_de_obra', 3.9000),
('MO-006', 'Maestro Mayor (C1)', 'h', 'mano_de_obra', 4.2000),
('MO-007', 'Operador de Maquinaria (C1)', 'h', 'mano_de_obra', 4.5000),

-- EQUIPOS Y MAQUINARIA
('EQ-001', 'Hormigonera 1 saco (110 lts)', 'h', 'equipo', 3.5000),
('EQ-002', 'Vibrador de hormigón', 'h', 'equipo', 2.5000),
('EQ-003', 'Retroexcavadora / Cargadora', 'h', 'equipo', 25.0000),
('EQ-004', 'Volqueta 8m3', 'h', 'equipo', 18.0000),
('EQ-005', 'Compactador manual (Sapo)', 'h', 'equipo', 4.0000),
('EQ-006', 'Cortadora de cerámica/concreto', 'h', 'equipo', 3.0000),
('EQ-007', 'Andamios metálicos', 'u', 'equipo', 1.0000)

ON CONFLICT (codigo) DO UPDATE 
SET precio_sin_iva = EXCLUDED.precio_sin_iva, nombre = EXCLUDED.nombre;


-- 2. INSERTAR RUBROS (LAS RECETAS)
INSERT INTO rubros (codigo, nombre, categoria, unidad, herramienta_menor_pct) VALUES

-- HORMIGONES
('RUB-101', 'Hormigón simple f''c=210 kg/cm2 (Preparado en obra)', 'ESTRUCTURAS', 'm3', 5.00),
('RUB-102', 'Hormigón ciclópeo (60% H.S. 180kg/cm2 + 40% Piedra)', 'CIMENTACIONES', 'm3', 5.00),
('RUB-103', 'Hormigón simple f''c=280 kg/cm2 (Para columnas/vigas)', 'ESTRUCTURAS', 'm3', 5.00),

-- ACEROS Y ENCOFRADOS
('RUB-201', 'Acero de refuerzo Fy=4200 kg/cm2 (Cortado y figurado)', 'ESTRUCTURAS', 'kg', 5.00),
('RUB-202', 'Encofrado y desencofrado recto para columnas', 'ESTRUCTURAS', 'm2', 5.00),

-- MAMPOSTERÍAS Y ENLUCIDOS
('RUB-301', 'Mampostería de bloque de hormigón 15x20x40 (e=15cm)', 'MAMPOSTERIA', 'm2', 5.00),
('RUB-302', 'Enlucido vertical paleteado fino (e=2cm)', 'ACABADOS', 'm2', 5.00),
('RUB-303', 'Empaste y lijado interior (2 manos)', 'ACABADOS', 'm2', 5.00),
('RUB-304', 'Pintura de caucho interior (2 manos + sellador)', 'ACABADOS', 'm2', 5.00),

-- PISOS Y RECUBRIMIENTOS
('RUB-401', 'Contrapiso de hormigón simple e=5cm', 'PISOS', 'm2', 5.00),
('RUB-402', 'Provisión e instalación de Cerámica 40x40', 'PISOS', 'm2', 5.00),
('RUB-403', 'Provisión e instalación de Porcelanato 60x60', 'PISOS', 'm2', 5.00),

-- PRELIMINARES Y MOVIMIENTO DE TIERRAS
('RUB-501', 'Replanteo y nivelación de obra', 'PRELIMINARES', 'm2', 5.00),
('RUB-502', 'Excavación manual de zanjas', 'MOV DE TIERRAS', 'm3', 5.00),
('RUB-503', 'Excavación a máquina (Retroexcavadora)', 'MOV DE TIERRAS', 'm3', 0.00),
('RUB-504', 'Desalojo de material a máquina (Carga y Transporte)', 'MOV DE TIERRAS', 'm3', 0.00)

ON CONFLICT (codigo) DO NOTHING;


-- 3. INSERTAR EL DETALLE DE RECETAS (RUBRO_INSUMOS)
-- Función auxiliar en bloque anónimo para facilitar la inserción por códigos
DO $$
DECLARE
    r_id UUID;
    i_id UUID;
BEGIN
    -- LIMPIAR RECETAS EXISTENTES PARA NO DUPLICAR AL REEJECUTAR
    DELETE FROM rubro_insumos WHERE rubro_id IN (SELECT id FROM rubros WHERE codigo LIKE 'RUB-%');

    -- MACRO PARA INSERTAR (Se reemplazará por consultas planas por simplicidad)
END $$;

-- RUB-101: Hormigón 210
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 350.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-101' AND i.codigo = 'MAT-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.45 FROM rubros r, insumos i WHERE r.codigo = 'RUB-101' AND i.codigo = 'MAT-002';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.85 FROM rubros r, insumos i WHERE r.codigo = 'RUB-101' AND i.codigo = 'MAT-004';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 180.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-101' AND i.codigo = 'MAT-005';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 5.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-101' AND i.codigo = 'MO-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 1.2 FROM rubros r, insumos i WHERE r.codigo = 'RUB-101' AND i.codigo = 'MO-002';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 1.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-101' AND i.codigo = 'EQ-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 1.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-101' AND i.codigo = 'EQ-002';

-- RUB-102: Ciclópeo (180kg + Piedra)
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 200.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-102' AND i.codigo = 'MAT-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.35 FROM rubros r, insumos i WHERE r.codigo = 'RUB-102' AND i.codigo = 'MAT-002';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.40 FROM rubros r, insumos i WHERE r.codigo = 'RUB-102' AND i.codigo = 'MAT-006'; -- Piedra bola
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 140.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-102' AND i.codigo = 'MAT-005';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 4.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-102' AND i.codigo = 'MO-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 1.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-102' AND i.codigo = 'MO-002';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 1.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-102' AND i.codigo = 'EQ-001';

-- RUB-201: Acero de refuerzo
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 1.05 FROM rubros r, insumos i WHERE r.codigo = 'RUB-201' AND i.codigo = 'MAT-007'; -- 5% desperdicio
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.02 FROM rubros r, insumos i WHERE r.codigo = 'RUB-201' AND i.codigo = 'MAT-008'; -- Alambre
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.08 FROM rubros r, insumos i WHERE r.codigo = 'RUB-201' AND i.codigo = 'MO-003'; -- Fierrero
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.08 FROM rubros r, insumos i WHERE r.codigo = 'RUB-201' AND i.codigo = 'MO-001';

-- RUB-301: Mampostería Bloque
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 12.5 FROM rubros r, insumos i WHERE r.codigo = 'RUB-301' AND i.codigo = 'MAT-012'; -- Bloques
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 4.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-301' AND i.codigo = 'MAT-001'; -- Cemento mortero
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.02 FROM rubros r, insumos i WHERE r.codigo = 'RUB-301' AND i.codigo = 'MAT-003'; -- Arena fina
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 1.2 FROM rubros r, insumos i WHERE r.codigo = 'RUB-301' AND i.codigo = 'MO-002'; -- Albañil
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 1.0 FROM rubros r, insumos i WHERE r.codigo = 'RUB-301' AND i.codigo = 'MO-001';

-- RUB-302: Enlucido Vertical
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 6.5 FROM rubros r, insumos i WHERE r.codigo = 'RUB-302' AND i.codigo = 'MAT-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.025 FROM rubros r, insumos i WHERE r.codigo = 'RUB-302' AND i.codigo = 'MAT-003';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.5 FROM rubros r, insumos i WHERE r.codigo = 'RUB-302' AND i.codigo = 'MO-002';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.5 FROM rubros r, insumos i WHERE r.codigo = 'RUB-302' AND i.codigo = 'MO-001';

-- RUB-304: Pintura Interior
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.03 FROM rubros r, insumos i WHERE r.codigo = 'RUB-304' AND i.codigo = 'MAT-018'; -- Pintura
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.01 FROM rubros r, insumos i WHERE r.codigo = 'RUB-304' AND i.codigo = 'MAT-021'; -- Sellador
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.3 FROM rubros r, insumos i WHERE r.codigo = 'RUB-304' AND i.codigo = 'MO-004'; -- Pintor

-- RUB-402: Piso Cerámica
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 1.05 FROM rubros r, insumos i WHERE r.codigo = 'RUB-402' AND i.codigo = 'MAT-014';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 3.5 FROM rubros r, insumos i WHERE r.codigo = 'RUB-402' AND i.codigo = 'MAT-016'; -- Bondex
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.3 FROM rubros r, insumos i WHERE r.codigo = 'RUB-402' AND i.codigo = 'MAT-017'; -- Porcelana
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.6 FROM rubros r, insumos i WHERE r.codigo = 'RUB-402' AND i.codigo = 'MO-002';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.6 FROM rubros r, insumos i WHERE r.codigo = 'RUB-402' AND i.codigo = 'MO-001';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.1 FROM rubros r, insumos i WHERE r.codigo = 'RUB-402' AND i.codigo = 'EQ-006';

-- RUB-503: Excavación a Máquina
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.05 FROM rubros r, insumos i WHERE r.codigo = 'RUB-503' AND i.codigo = 'EQ-003'; -- Retro 0.05h/m3
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.05 FROM rubros r, insumos i WHERE r.codigo = 'RUB-503' AND i.codigo = 'MO-007'; -- Operador

-- RUB-504: Desalojo
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.08 FROM rubros r, insumos i WHERE r.codigo = 'RUB-504' AND i.codigo = 'EQ-003';
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.12 FROM rubros r, insumos i WHERE r.codigo = 'RUB-504' AND i.codigo = 'EQ-004'; -- Volqueta
INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) SELECT r.id, i.id, 0.20 FROM rubros r, insumos i WHERE r.codigo = 'RUB-504' AND i.codigo = 'MO-007'; -- Operadores


-- 4. ACTUALIZAR TOTALES Y HERRAMIENTA MENOR
UPDATE rubros r SET total_costo_directo = (
    SELECT COALESCE(SUM(ri.cantidad * i.precio_sin_iva), 0) + 
           (COALESCE(SUM(CASE WHEN i.tipo = 'mano_de_obra' THEN ri.cantidad * i.precio_sin_iva ELSE 0 END), 0) * (r.herramienta_menor_pct / 100))
    FROM rubro_insumos ri
    JOIN insumos i ON ri.insumo_id = i.id
    WHERE ri.rubro_id = r.id
);
