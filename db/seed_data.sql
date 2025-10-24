-- ============================================================
-- Datos de Prueba (Seed Data) para MVP de Auditoría de Inventarios
-- ============================================================
-- Este archivo contiene datos de ejemplo para poblar la base de datos
-- con locales, informes y puntuaciones de prueba.
--
-- Uso:
--   mysql --host=<HOST> --port=<PORT> --user=<USER> --password=<PASSWORD> <DATABASE> < db/seed_data.sql
-- ============================================================

-- Insertar locales de ejemplo
INSERT INTO locals (name, address, createdAt, updatedAt) VALUES
('Minimarket Alerce', 'Av. Principal 123, Ciudad', NOW(), NOW()),
('Tienda Modelo', 'Calle Secundaria 456, Ciudad', NOW(), NOW()),
('Local con Problemas', 'Av. Tercera 789, Ciudad', NOW(), NOW());

-- Insertar informes de ejemplo (asumiendo que el usuario con id=1 existe)
-- Nota: El userId debe coincidir con un usuario existente en la tabla users
INSERT INTO reports (localId, userId, reportDate, inputType, rawContent, createdAt, updatedAt) VALUES
(1, 1, '2025-10-18', 'text', 'INFORME INVENTARIO MINIMARKET "ALERCE"\nEntre el 06 y el 18 Octubre de 2025, se realiza la toma física del inventario...\n\nExactitud del inventario: 95.66%\nFaltantes del inventario actual: 4.34%\nDañados y Vencidos: 0.01%\nCumplimiento de registro de facturas: 6.91%\nMargen Bruto: 22%\n\nLa cifra de faltantes de mercadería aumentó en este inventario...', NOW(), NOW()),
(2, 1, '2025-10-15', 'text', 'INFORME INVENTARIO TIENDA MODELO\nInventario realizado el 15 de Octubre de 2025.\n\nExactitud del inventario: 99.8%\nFaltantes: 0.2%\nCumplimiento de registro de facturas: 0% errores\nOrganización: Excelente\nVencidos/Dañados: 0.05%\n\nSolo una nota menor sobre la necesidad de actualizar el cartel de horario.', NOW(), NOW()),
(3, 1, '2025-10-10', 'text', 'INFORME INVENTARIO LOCAL CON PROBLEMAS\nInventario realizado el 10 de Octubre de 2025.\n\nExactitud del inventario: 85%\nFaltantes: 15%\nCumplimiento de registro de facturas: 30% errores\nOrganización: Bodega desordenada, pasillos obstruidos\nVencidos/Dañados: 5%\n\nEl informe es confuso y carece de datos numéricos clave.', NOW(), NOW());

-- Insertar puntuaciones de ejemplo
-- Caso 1: Alerce (71/100)
INSERT INTO scores (reportId, autoScore, finalScore, criteriaScores, aiSource, isOverridden, createdAt, updatedAt) VALUES
(1, 71, 71, '{"criteria_scores":[{"criterion":"Exactitud de Inventario","weight":30,"score":28,"justification":"La exactitud del 95.66% supera la meta del 95%."},{"criterion":"Faltantes y Pérdidas","weight":25,"score":10,"justification":"Faltantes del 4.34%, muy superior a la meta del 1%. Penalización severa."},{"criterion":"Cumplimiento de Procedimientos","weight":20,"score":12,"justification":"Alto porcentaje de facturas con errores (6.91% vs meta <2%)."},{"criterion":"Organización y Limpieza","weight":10,"score":7,"justification":"Bodega con buen orden, pero fallos de limpieza en zonas altas."},{"criterion":"Gestión de Vencidos/Dañados","weight":10,"score":9,"justification":"Nivel muy bajo (0.01%), dentro de lo aceptable."},{"criterion":"Claridad y Estructura del Informe","weight":5,"score":5,"justification":"El informe es claro y estructurado."}]}', 'gemini-2.5-flash', 0, NOW(), NOW());

-- Caso 2: Tienda Modelo (95/100)
INSERT INTO scores (reportId, autoScore, finalScore, criteriaScores, aiSource, isOverridden, createdAt, updatedAt) VALUES
(2, 95, 95, '{"criteria_scores":[{"criterion":"Exactitud de Inventario","weight":30,"score":30,"justification":"Exactitud del 99.8%, excelente."},{"criterion":"Faltantes y Pérdidas","weight":25,"score":25,"justification":"Faltantes del 0.2%, muy bajo."},{"criterion":"Cumplimiento de Procedimientos","weight":20,"score":20,"justification":"0% errores en facturas."},{"criterion":"Organización y Limpieza","weight":10,"score":9,"justification":"Excelente, sin observaciones mayores."},{"criterion":"Gestión de Vencidos/Dañados","weight":10,"score":10,"justification":"Nivel muy bajo (0.05%)."},{"criterion":"Claridad y Estructura del Informe","weight":5,"score":1,"justification":"Informe breve, sin datos detallados."}]}', 'gemini-2.5-flash', 0, NOW(), NOW());

-- Caso 3: Local con Problemas (35/100)
INSERT INTO scores (reportId, autoScore, finalScore, criteriaScores, aiSource, isOverridden, createdAt, updatedAt) VALUES
(3, 35, 35, '{"criteria_scores":[{"criterion":"Exactitud de Inventario","weight":30,"score":5,"justification":"Exactitud del 85%, muy bajo."},{"criterion":"Faltantes y Pérdidas","weight":25,"score":0,"justification":"Faltantes del 15%, inaceptable."},{"criterion":"Cumplimiento de Procedimientos","weight":20,"score":5,"justification":"30% errores en facturas, fallo de control."},{"criterion":"Organización y Limpieza","weight":10,"score":2,"justification":"Bodega desordenada, riesgo operativo."},{"criterion":"Gestión de Vencidos/Dañados","weight":10,"score":0,"justification":"5% de vencidos/dañados, muy alto."},{"criterion":"Claridad y Estructura del Informe","weight":5,"score":3,"justification":"Informe confuso."}]}', 'gemini-2.5-flash', 0, NOW(), NOW());

-- Insertar registros de auditoría
INSERT INTO auditLog (reportId, userId, action, details, createdAt) VALUES
(1, 1, 'REPORT_CREATED', 'Informe creado para Minimarket Alerce', NOW()),
(1, 1, 'SCORE_GENERATED', 'Puntuación automática generada por IA: 71/100', NOW()),
(2, 1, 'REPORT_CREATED', 'Informe creado para Tienda Modelo', NOW()),
(2, 1, 'SCORE_GENERATED', 'Puntuación automática generada por IA: 95/100', NOW()),
(3, 1, 'REPORT_CREATED', 'Informe creado para Local con Problemas', NOW()),
(3, 1, 'SCORE_GENERATED', 'Puntuación automática generada por IA: 35/100', NOW());

