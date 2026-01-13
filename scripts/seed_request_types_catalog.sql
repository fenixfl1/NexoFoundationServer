BEGIN;

WITH catalog AS (
  INSERT INTO PUBLIC."CATALOG" (
    "CREATED_AT",
    "CREATED_BY",
    "STATE",
    "KEY",
    "NAME",
    "DESCRIPTION"
  )
  VALUES (
    NOW(),
    NULL,
    'A',
    'ID_LIST_REQUEST_TYPES',
    'Tipos de solicitudes',
    'Catálogo de tipos de solicitudes para clasificar los registros del módulo.'
  )
  ON CONFLICT ("KEY") DO UPDATE
    SET
      "NAME" = EXCLUDED."NAME",
      "DESCRIPTION" = EXCLUDED."DESCRIPTION",
      "STATE" = 'A'
  RETURNING "CATALOG_ID"
)
INSERT INTO PUBLIC."CATALOG_ITEM" (
  "CREATED_AT",
  "CREATED_BY",
  "STATE",
  "CATALOG_ID",
  "VALUE",
  "LABEL",
  "ORDER",
  "EXTRA"
)
SELECT
  NOW(),
  NULL,
  'A',
  catalog."CATALOG_ID",
  items.value,
  items.label,
  items.sort_order,
  items.extra::json
FROM catalog
CROSS JOIN (
  VALUES
    ('new_application', 'Nueva beca', 1, '{"description":"Registro inicial del postulante"}'),
    ('renewal', 'Renovación anual', 2, '{"description":"Actualización de beneficios para becarios activos"}'),
    ('academic_support', 'Apoyo académico', 3, '{"description":"Solicitud de tutorías, cursos o materiales"}'),
    ('financial_support', 'Ayuda puntual', 4, '{"description":"Transporte, merienda u otros auxilios"}'),
    ('follow_up', 'Seguimiento especial', 5, '{"description":"Casos que requieren acompañamiento adicional"}')
) AS items(value, label, sort_order, extra)
ON CONFLICT ("CATALOG_ID", "VALUE") DO UPDATE
  SET
    "LABEL" = EXCLUDED."LABEL",
    "ORDER" = EXCLUDED."ORDER",
    "EXTRA" = EXCLUDED."EXTRA",
    "STATE" = 'A';

COMMIT;
