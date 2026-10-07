-- seed.sql for sara-constructora

-- Insert Users (roles: constructor, proveedor, transportista)
INSERT INTO users (id, name, role, city, country, email) VALUES
('usr_001', 'Constructora Quito Sur', 'constructor', 'Quito', 'Ecuador', 'contacto@quitosur.ec'),
('usr_002', 'Constructora Guayas', 'constructor', 'Guayaquil', 'Ecuador', 'info@constructoraguayas.com.ec'),
('usr_003', 'Materiales Holcim', 'proveedor', 'Guayaquil', 'Ecuador', 'ventas@holcim.ec'),
('usr_004', 'Aceros Adelca', 'proveedor', 'Quito', 'Ecuador', 'ventas@adelca.ec'),
('usr_005', 'Transportes Andes', 'transportista', 'Quito', 'Ecuador', 'logistica@andes.ec'),
('usr_006', 'Fletes Costeños', 'transportista', 'Guayaquil', 'Ecuador', 'despachos@costenos.ec');

-- Insert Products
INSERT INTO products (id, supplier_id, name, description, price_per_unit, unit) VALUES
('prod_001', 'usr_003', 'Cemento Holcim Fuerte', 'Saco de cemento 50kg', 7.50, 'saco'),
('prod_002', 'usr_003', 'Cemento Holcim Premium', 'Saco de cemento 50kg alta resistencia', 8.20, 'saco'),
('prod_003', 'usr_004', 'Varillas Corrugadas Adelca 12mm', 'Varilla de acero 12mm x 12m', 12.00, 'unidad'),
('prod_004', 'usr_004', 'Varillas Corrugadas Adelca 10mm', 'Varilla de acero 10mm x 12m', 9.50, 'unidad');

-- Insert Freight Dispatches (Fletes)
INSERT INTO freight_dispatches (id, transporter_id, origin, destination, status, estimated_delivery) VALUES
('fdispatch_001', 'usr_005', 'Bodega Adelca Quito', 'Obra Quito Sur', 'en_transito', '2023-11-01 14:00:00'),
('fdispatch_002', 'usr_006', 'Planta Holcim Guayaquil', 'Obra Guayas', 'entregado', '2023-10-25 10:30:00');

-- Insert Escrow Transactions
INSERT INTO escrow_transactions (id, buyer_id, seller_id, amount, currency, status, description) VALUES
('escrow_001', 'usr_001', 'usr_004', 1200.00, 'USD', 'held', 'Compra de 100 varillas 12mm'),
('escrow_002', 'usr_002', 'usr_003', 750.00, 'USD', 'released', 'Compra de 100 sacos de cemento fuerte');
