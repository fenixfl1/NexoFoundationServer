BEGIN;

-- Tabla temporal con el mapeo de IDs
CREATE TEMP TABLE tmp_mapping(old_id text, new_id text, new_path text, new_order int);
INSERT INTO tmp_mapping(old_id, new_id, new_path, new_order) VALUES
  ('0-4',    '0-5-4', '/0-5-4/requests',                 4),
  ('0-2',    '0-5-5', '/0-5-5/grades',                   5),
  ('0-19-2', '0-5-6', '/0-5-6/requirements_validation',  6),
  ('0-19-1', '0-5-7', '/0-5-7/student_documents',        7),
  ('0-1',    '0-5-8', '/0-5-8/information',              8);

-- Limpiar si ya existían IDs nuevos
DELETE FROM PUBLIC."MENU_OPTION" mo
USING tmp_mapping m
WHERE mo."MENU_OPTION_ID" = m.new_id;

-- Insertar las nuevas filas clonando de las viejas
INSERT INTO PUBLIC."MENU_OPTION" (
  "CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID"
)
SELECT
  COALESCE(orig."CREATED_AT", NOW()),
  orig."CREATED_BY",
  COALESCE(orig."STATE", 'A'),
  m.new_id,
  orig."NAME",
  orig."DESCRIPTION",
  m.new_path,
  orig."TYPE",
  orig."ICON",
  m.new_order,
  '0-5'
FROM tmp_mapping m
JOIN PUBLIC."MENU_OPTION" orig ON orig."MENU_OPTION_ID" = m.old_id
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

-- Actualizar hijos que referencian al padre viejo
UPDATE PUBLIC."MENU_OPTION" c
SET "PARENT_ID" = m.new_id
FROM tmp_mapping m
WHERE c."PARENT_ID" = m.old_id;

-- Actualizar tablas dependientes
UPDATE PUBLIC."PERMISSION" p
SET "MENU_OPTION_ID" = m.new_id
FROM tmp_mapping m
WHERE p."MENU_OPTION_ID" = m.old_id;

UPDATE PUBLIC."PARAMETER" prm
SET "MENU_OPTION_ID" = m.new_id
FROM tmp_mapping m
WHERE prm."MENU_OPTION_ID" = m.old_id;

UPDATE PUBLIC."NOTIFICATION_TEMPLATE" nt
SET "MENU_OPTION_ID" = m.new_id
FROM tmp_mapping m
WHERE nt."MENU_OPTION_ID" = m.old_id;

-- Eliminar las filas antiguas
DELETE FROM PUBLIC."MENU_OPTION" mo
USING tmp_mapping m
WHERE mo."MENU_OPTION_ID" = m.old_id;

DROP TABLE IF EXISTS tmp_mapping;

COMMIT;
